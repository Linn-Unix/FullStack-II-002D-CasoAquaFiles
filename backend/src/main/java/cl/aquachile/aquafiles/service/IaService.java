package cl.aquachile.aquafiles.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import cl.aquachile.aquafiles.dto.AnalisisIaResponse;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.Oferta;
import cl.aquachile.aquafiles.exception.IaNoDisponibleException;
import cl.aquachile.aquafiles.util.Anonimizador;

// Apoyo de IA para el analista: compara el CV (anonimizado) con la oferta y sugiere
// una puntuación orientativa, fortalezas, brechas y preguntas para la entrevista.
// NO cambia el estado del candidato: la decisión siempre la toma una persona.
@Service
@Transactional(readOnly = true)
public class IaService {

    static final int MAXIMO_CV = 6000;

    static final String INSTRUCCIONES = """
            Eres un asistente de apoyo para analistas de reclutamiento de AquaChile (acuicultura, Chile).
            Tu tarea es comparar los antecedentes de un candidato con los requisitos de un cargo.
            Reglas:
            - No decides la contratación ni el descarte: solo entregas una sugerencia para que una persona revise.
            - Evalúa solo experiencia, formación, certificaciones y habilidades relacionadas con el cargo.
            - No consideres edad, género, origen, estado civil, salud ni ningún dato personal.
            - Si falta información, dilo en "brechas" en vez de inventarla.
            - En "requisitos" incluye una entrada por cada requisito real del cargo.
            - Sé breve: máximo una línea por punto.
            Responde SOLO un objeto JSON, sin texto adicional, con esta forma:
            {"puntaje": entero de 0 a 100 (adecuación orientativa al cargo),
             "resumen": "2 o 3 frases",
             "requisitos": [{"nombre": "requisito del cargo", "estado": "cumple" | "parcial" | "no", "detalle": "explicación breve"}],
             "fortalezas": ["..."],
             "brechas": ["..."],
             "preguntas": ["3 a 5 preguntas para la entrevista"],
             "criterios": ["cómo llegaste al puntaje, en frases cortas"]}
            """;

    private final CandidatoService candidatoService;
    private final ArchivoService archivoService;
    private final ClienteGroq clienteGroq;
    private final ObjectMapper json;

    public IaService(CandidatoService candidatoService, ArchivoService archivoService,
                     ClienteGroq clienteGroq, ObjectMapper json) {
        this.candidatoService = candidatoService;
        this.archivoService = archivoService;
        this.clienteGroq = clienteGroq;
        this.json = json;
    }

    public AnalisisIaResponse analizar(Long candidatoId) {
        if (!clienteGroq.configurado()) {
            throw new IaNoDisponibleException("El apoyo de IA no está configurado (falta GROQ_API_KEY en el backend).");
        }
        Candidato candidato = candidatoService.buscarEntidad(candidatoId);

        // 1. Texto del CV sin datos personales (solo PDF).
        String textoCv = Anonimizador.recortar(
                Anonimizador.anonimizar(archivoService.textoDelCv(candidato), candidato.getNombre()), MAXIMO_CV);

        // 2. Se pide la sugerencia a la IA y se valida la respuesta.
        String respuesta = clienteGroq.completar(INSTRUCCIONES, armarDatos(candidato, textoCv));
        return leerRespuesta(candidatoId, respuesta, !textoCv.isBlank());
    }

    // Datos que se envían: el cargo y la información profesional. Nunca nombre, RUT, correo ni teléfono.
    String armarDatos(Candidato candidato, String textoCv) {
        Oferta oferta = candidato.getOferta();
        StringBuilder datos = new StringBuilder();
        datos.append("CARGO: ").append(oferta != null ? oferta.getCargo() : candidato.getCargo()).append('\n');
        datos.append("FAMILIA DE CARGO: ").append(candidato.getFamilia()).append('\n');
        if (oferta != null) {
            datos.append("FUNCIONES: ").append(oferta.getFunciones()).append('\n');
            datos.append("REQUISITOS: ").append(oferta.getRequisitos()).append('\n');
        }
        if (candidato.getObservaciones() != null) {
            datos.append("OBSERVACIONES DEL ANALISTA: ")
                    .append(Anonimizador.anonimizar(candidato.getObservaciones(), candidato.getNombre())).append('\n');
        }
        datos.append("CV (anonimizado): ").append(textoCv.isBlank() ? "No disponible (solo se leen CV en PDF)." : textoCv);
        return datos.toString();
    }

    AnalisisIaResponse leerRespuesta(Long candidatoId, String respuesta, boolean cvAnalizado) {
        // La IA a veces envuelve el JSON en ```json ... ```: tomamos desde la primera "{" hasta la última "}".
        int inicio = respuesta.indexOf('{');
        int fin = respuesta.lastIndexOf('}');
        if (inicio < 0 || fin <= inicio) {
            throw new IaNoDisponibleException("La respuesta de la IA no tiene el formato esperado. Inténtalo nuevamente.");
        }
        try {
            JsonNode nodo = json.readTree(respuesta.substring(inicio, fin + 1));
            int puntaje = Math.max(0, Math.min(100, nodo.path("puntaje").asInt(0)));
            return new AnalisisIaResponse(candidatoId, puntaje, nodo.path("resumen").asText(""),
                    requisitos(nodo), lista(nodo, "fortalezas"), lista(nodo, "brechas"), lista(nodo, "preguntas"), lista(nodo, "criterios"),
                    cvAnalizado, clienteGroq.getModelo(), AnalisisIaResponse.ADVERTENCIA, LocalDateTime.now());
        } catch (JsonProcessingException error) {
            throw new IaNoDisponibleException("La respuesta de la IA no tiene el formato esperado. Inténtalo nuevamente.", error);
        }
    }

    // Solo se aceptan los estados conocidos; cualquier otro valor se muestra como "parcial".
    private List<AnalisisIaResponse.RequisitoIa> requisitos(JsonNode nodo) {
        List<AnalisisIaResponse.RequisitoIa> requisitos = new ArrayList<>();
        nodo.path("requisitos").forEach(requisito -> {
            String estado = requisito.path("estado").asText("").toLowerCase();
            if (!List.of("cumple", "parcial", "no").contains(estado)) {
                estado = "parcial";
            }
            requisitos.add(new AnalisisIaResponse.RequisitoIa(
                    requisito.path("nombre").asText(""), estado, requisito.path("detalle").asText("")));
        });
        return requisitos;
    }

    private List<String> lista(JsonNode nodo, String campo) {
        List<String> valores = new ArrayList<>();
        nodo.path(campo).forEach(valor -> valores.add(valor.asText()));
        return valores;
    }
}
