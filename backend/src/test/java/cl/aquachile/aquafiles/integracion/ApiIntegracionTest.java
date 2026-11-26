package cl.aquachile.aquafiles.integracion;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

// Pruebas funcionales de la API completa: seguridad JWT, ofertas, portal, postulación con CV,
// estados, evaluación y dashboard. Usan la base H2 en memoria del perfil "test".
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegracionTest {

    private static final String API = "/api/v1";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    // ---------- 1. Login, JWT y permisos ----------

    @Test
    void elLoginEntregaUnTokenYLasCredencialesMalasDan401() throws Exception {
        mvc.perform(post(API + "/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usuario\":\"analista\",\"clave\":\"aqua123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("ANALISTA"))
                .andExpect(jsonPath("$.nombre").value("Rosa Martínez"))
                .andExpect(jsonPath("$.token").isNotEmpty());

        mvc.perform(post(API + "/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usuario\":\"analista\",\"clave\":\"mala\"}"))
                .andExpect(status().isUnauthorized());

        mvc.perform(post(API + "/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.usuario").exists());
    }

    @Test
    void lasRutasInternasExigenTokenYElRolCorrecto() throws Exception {
        String evaluador = token("evaluador");

        mvc.perform(get(API + "/candidatos")).andExpect(status().isUnauthorized());
        mvc.perform(get(API + "/ofertas").header("Authorization", "Bearer token-falso"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get(API + "/ofertas").header("Authorization", "Bearer " + evaluador))
                .andExpect(status().isForbidden());
        mvc.perform(get(API + "/dashboard/resumen").header("Authorization", "Bearer " + evaluador))
                .andExpect(status().isForbidden());
        mvc.perform(get(API + "/evaluaciones").header("Authorization", "Bearer " + token("analista")))
                .andExpect(status().isForbidden());
    }

    @Test
    void elTokenSePuedeRenovar() throws Exception {
        mvc.perform(post(API + "/auth/renovar").header("Authorization", "Bearer " + token("evaluador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("EVALUADOR"));
    }

    // ---------- 2. Ofertas y portal público ----------

    @Test
    void elAnalistaPublicaUnaOfertaYElPortalLaMuestraSinLogin() throws Exception {
        String analista = token("analista");
        long id = crearOferta(analista, "Buzo Mariscador", "Operaciones");

        // Sin publicar no aparece en el portal.
        mvc.perform(get(API + "/portal/ofertas/" + id)).andExpect(status().isNotFound());

        conToken(patch(API + "/ofertas/" + id + "/publicar"), analista)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publicada").value(true))
                .andExpect(jsonPath("$.fechaPublicacion").value(LocalDate.now().toString()));

        mvc.perform(get(API + "/portal/ofertas").param("familia", "Operaciones").param("busqueda", "buzo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].cargo", hasItem("Buzo Mariscador")));
        mvc.perform(get(API + "/portal/ofertas").param("modalidad", "REMOTA"))
                .andExpect(jsonPath("$[*].modalidad", org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.is("REMOTA"))));
        mvc.perform(get(API + "/portal/ofertas/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requisitos").value("Curso de buceo vigente."));

        // Editar, despublicar y eliminar (sin postulaciones sí se puede).
        conToken(put(API + "/ofertas/" + id).contentType(MediaType.APPLICATION_JSON)
                .content(oferta("Buzo Mariscador Senior", "Operaciones")), analista)
                .andExpect(jsonPath("$.cargo").value("Buzo Mariscador Senior"));
        conToken(get(API + "/ofertas/" + id), analista).andExpect(jsonPath("$.cupos").value(2));
        conToken(get(API + "/ofertas"), analista).andExpect(jsonPath("$[*].id", hasItem((int) id)));
        conToken(patch(API + "/ofertas/" + id + "/despublicar"), analista)
                .andExpect(jsonPath("$.publicada").value(false));
        conToken(delete(API + "/ofertas/" + id), analista).andExpect(status().isNoContent());
        conToken(get(API + "/ofertas/" + id), analista).andExpect(status().isNotFound());
    }

    @Test
    void laOfertaValidaSusCampos() throws Exception {
        String analista = token("analista");
        conToken(post(API + "/ofertas").contentType(MediaType.APPLICATION_JSON).content("{\"cargo\":\"X\"}"), analista)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.modalidad").value("La modalidad es obligatoria."));

        Map<String, Object> sueldoMalo = json.readValue(oferta("Operario", "Operaciones"), Map.class);
        sueldoMalo.put("sueldoMaximo", 1);
        conToken(post(API + "/ofertas").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(sueldoMalo)), analista)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value(containsString("sueldo máximo")));

        mvc.perform(get(API + "/portal/ofertas").param("modalidad", "VOLANDO"))
                .andExpect(status().isBadRequest());
        conToken(post(API + "/ofertas").contentType(MediaType.APPLICATION_JSON).content("{ no es json"), analista)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("El cuerpo de la petición no es válido."));
    }

    // ---------- 3. Flujo completo: postulación → CV → estados → evaluación → dashboard ----------

    @Test
    void flujoCompletoDesdeLaPostulacionHastaElInforme() throws Exception {
        String analista = token("analista");
        String evaluador = token("evaluador");
        long ofertaId = crearOferta(analista, "Jefe de Centro", "Producción");
        conToken(patch(API + "/ofertas/" + ofertaId + "/publicar"), analista).andExpect(status().isOk());

        // 3.1- El postulante postula sin sesión y adjunta su CV.
        JsonNode postulacion = leer(mvc.perform(post(API + "/postulaciones").contentType(MediaType.APPLICATION_JSON)
                        .content(postulacion("Valentina Ríos", "20.456.789-1", ofertaId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cargo").value("Jefe de Centro"))
                .andExpect(jsonPath("$.estadoGeneral").value("En revisión técnica")));
        long candidatoId = postulacion.get("id").asLong();

        mvc.perform(multipart(API + "/postulaciones/" + candidatoId + "/cv")
                        .file(new MockMultipartFile("archivo", "virus.exe", "application/octet-stream", "x".getBytes())))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart(API + "/postulaciones/" + candidatoId + "/cv").file(cv("cv_valentina.pdf")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.carpeta").value("valentina-rios-" + candidatoId));
        mvc.perform(multipart(API + "/postulaciones/" + candidatoId + "/cv").file(cv("otro.pdf")))
                .andExpect(status().isConflict());

        // 3.2- Con la misma oferta no se puede eliminar.
        conToken(delete(API + "/ofertas/" + ofertaId), analista).andExpect(status().isConflict());

        // 3.3- El analista ve la postulación y descarga el CV; sin sesión no se puede.
        conToken(get(API + "/candidatos").param("busqueda", "valentina"), analista)
                .andExpect(jsonPath("$[0].ofertaCargo").value("Jefe de Centro"));
        JsonNode archivos = leer(conToken(get(API + "/candidatos/" + candidatoId + "/archivos"), analista)
                .andExpect(jsonPath("$", hasSize(1))));
        long cvId = archivos.get(0).get("id").asLong();
        conToken(get(API + "/archivos/" + cvId + "/descargar"), analista)
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("cv_valentina.pdf")))
                .andExpect(content().bytes("contenido de prueba".getBytes()));
        mvc.perform(get(API + "/archivos/" + cvId + "/descargar")).andExpect(status().isUnauthorized());

        // 3.4- Estados: no se puede saltar etapas, derivar exige responsable.
        conToken(patch(API + "/candidatos/" + candidatoId + "/finalizar"), evaluador).andExpect(status().isConflict());
        conToken(patch(API + "/candidatos/" + candidatoId + "/aprobar"), analista)
                .andExpect(jsonPath("$.estado").value("APROBADO"));
        conToken(patch(API + "/candidatos/" + candidatoId + "/derivar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"responsable\":\"\"}"), analista).andExpect(status().isBadRequest());
        conToken(get(API + "/usuarios/evaluadores"), analista).andExpect(jsonPath("$", hasItem("Luis Herrera")));
        conToken(patch(API + "/candidatos/" + candidatoId + "/derivar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"responsable\":\"Luis Herrera\"}"), analista)
                .andExpect(jsonPath("$.estado").value("DERIVADO"))
                .andExpect(jsonPath("$.responsable").value("Luis Herrera"));

        // 3.5- El postulante consulta con su RUT y no ve estados internos.
        mvc.perform(get(API + "/candidatos/consulta").param("rut", "204567891"))
                .andExpect(jsonPath("$.estadoGeneral").value("En revisión técnica"));
        mvc.perform(get(API + "/candidatos/consulta").param("rut", "1-1")).andExpect(status().isBadRequest());

        // 3.6- El evaluador agenda, registra el resultado y sube el informe.
        JsonNode evaluaciones = leer(conToken(get(API + "/evaluaciones"), evaluador).andExpect(status().isOk()));
        long evaluacionId = -1;
        for (JsonNode evaluacion : evaluaciones) {
            if (evaluacion.get("candidatoId").asLong() == candidatoId) {
                evaluacionId = evaluacion.get("id").asLong();
            }
        }
        String fecha = LocalDate.now().plusDays(3).toString();
        conToken(multipart(API + "/evaluaciones/" + evaluacionId + "/informe").file(informe()), evaluador)
                .andExpect(status().isConflict());
        conToken(put(API + "/evaluaciones/" + evaluacionId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"fechaEntrevista\":\"" + fecha + "\"}"), evaluador)
                .andExpect(jsonPath("$.estado").value("AGENDADO"));
        mvc.perform(get(API + "/candidatos/consulta").param("rut", "20.456.789-1"))
                .andExpect(jsonPath("$.fechaEntrevista").value(fecha));
        conToken(multipart(API + "/evaluaciones/" + evaluacionId + "/informe").file(informe()), evaluador)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").value(startsWith("Guarda el resultado")));
        conToken(put(API + "/evaluaciones/" + evaluacionId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"fechaEntrevista\":\"" + fecha + "\",\"resultado\":\"Inventado\"}"), evaluador)
                .andExpect(status().isBadRequest());
        conToken(put(API + "/evaluaciones/" + evaluacionId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"fechaEntrevista\":\"" + fecha + "\",\"resultado\":\"Recomendable\",\"observaciones\":\"Buen perfil\"}"), evaluador)
                .andExpect(jsonPath("$.resultado").value("Recomendable"));
        conToken(get(API + "/evaluaciones/" + evaluacionId), evaluador).andExpect(jsonPath("$.observaciones").value("Buen perfil"));
        conToken(multipart(API + "/evaluaciones/" + evaluacionId + "/informe").file(informe()), evaluador)
                .andExpect(jsonPath("$.estado").value("FINALIZADO"))
                .andExpect(jsonPath("$.nombreInforme").value("informe.pdf"));
        conToken(put(API + "/evaluaciones/" + evaluacionId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"resultado\":\"No recomendable\"}"), evaluador)
                .andExpect(status().isConflict());

        // 3.7- El dashboard refleja el proceso.
        conToken(get(API + "/dashboard/resumen"), analista)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.porEstado.FINALIZADO").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.porFamilia.Producción").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    void elAnalistaCreaEditaYRechazaCandidatos() throws Exception {
        String analista = token("analista");
        String datos = """
                {"nombre":"Pedro Soto","rut":"18.923.456-2","correo":"pedro@correo.cl","telefono":"+56 9 3333 4444",
                 "cargo":"Supervisor de Planta","familia":"Operaciones","ubicacion":"Puerto Montt","centroCosto":"Planta de proceso"}
                """;
        JsonNode creado = leer(conToken(post(API + "/candidatos").contentType(MediaType.APPLICATION_JSON).content(datos), analista)
                .andExpect(status().isCreated()));
        long id = creado.get("id").asLong();

        conToken(post(API + "/candidatos").contentType(MediaType.APPLICATION_JSON).content(datos), analista)
                .andExpect(status().isConflict());
        conToken(put(API + "/candidatos/" + id).contentType(MediaType.APPLICATION_JSON)
                .content(datos.replace("Supervisor de Planta", "Jefe de Turno")), analista)
                .andExpect(jsonPath("$.cargo").value("Jefe de Turno"));
        conToken(get(API + "/candidatos/" + id), analista).andExpect(jsonPath("$.rut").value("18.923.456-2"));
        conToken(get(API + "/candidatos").param("estado", "REVISION").param("familia", "Operaciones"), analista)
                .andExpect(jsonPath("$[*].id", hasItem((int) id)));
        conToken(patch(API + "/candidatos/" + id + "/rechazar"), analista).andExpect(jsonPath("$.estado").value("RECHAZADO"));
        conToken(get(API + "/candidatos/999999"), analista).andExpect(status().isNotFound());
        conToken(post(API + "/candidatos").contentType(MediaType.APPLICATION_JSON)
                .content(datos.replace("18.923.456-2", "11.111.111-2")), analista)
                .andExpect(status().isBadRequest());
    }

    @Test
    void elApoyoDeIaEsSoloDelAnalistaYAvisaSiNoEstaConfigurado() throws Exception {
        mvc.perform(post(API + "/ia/candidatos/1/analisis")).andExpect(status().isUnauthorized());
        conToken(post(API + "/ia/candidatos/1/analisis"), token("evaluador")).andExpect(status().isForbidden());
        // En las pruebas no hay GROQ_API_KEY: la API responde 503 con un mensaje claro.
        conToken(post(API + "/ia/candidatos/1/analisis"), token("analista"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.mensaje").value(containsString("GROQ_API_KEY")));
    }

    @Test
    void laVerificacionYSwaggerSonPublicos() throws Exception {
        mvc.perform(get(API + "/verificacion")).andExpect(status().isOk());
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/portal/ofertas']").exists());
    }

    // ---------- Ayudas ----------

    private String token(String usuario) throws Exception {
        JsonNode respuesta = leer(mvc.perform(post(API + "/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"usuario\":\"" + usuario + "\",\"clave\":\"aqua123\"}")));
        return respuesta.get("token").asText();
    }

    private ResultActions conToken(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder peticion,
                                   String token) throws Exception {
        return mvc.perform(peticion.header("Authorization", "Bearer " + token));
    }

    private long crearOferta(String token, String cargo, String familia) throws Exception {
        JsonNode creada = leer(conToken(post(API + "/ofertas").contentType(MediaType.APPLICATION_JSON)
                .content(oferta(cargo, familia)), token).andExpect(status().isCreated()));
        return creada.get("id").asLong();
    }

    private String oferta(String cargo, String familia) {
        return """
                {"cargo":"%s","familia":"%s","ubicacion":"Chiloé","modalidad":"PRESENCIAL","cupos":2,
                 "descripcion":"Trabajo en centros de cultivo.","funciones":"Inspeccionar redes.",
                 "requisitos":"Curso de buceo vigente.","beneficios":"Seguro complementario.",
                 "sueldoMinimo":900000,"sueldoMaximo":1200000}
                """.formatted(cargo, familia);
    }

    private String postulacion(String nombre, String rut, long ofertaId) {
        return """
                {"nombre":"%s","rut":"%s","correo":"postulante@correo.cl","telefono":"+56 9 1111 2222",
                 "cargo":"Cargo","familia":"Familia","ubicacion":"Ubicación","centroCosto":"Cultivo y engorda","ofertaId":%d}
                """.formatted(nombre, rut, ofertaId);
    }

    private MockMultipartFile cv(String nombre) {
        return new MockMultipartFile("archivo", nombre, "application/pdf", "contenido de prueba".getBytes());
    }

    private MockMultipartFile informe() {
        return new MockMultipartFile("archivo", "informe.pdf", "application/pdf", "informe".getBytes());
    }

    private JsonNode leer(ResultActions resultado) throws Exception {
        return json.readTree(resultado.andReturn().getResponse().getContentAsByteArray());
    }
}
