package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import cl.aquachile.aquafiles.dto.AnalisisIaResponse;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.Oferta;
import cl.aquachile.aquafiles.exception.IaNoDisponibleException;

@ExtendWith(MockitoExtension.class)
class IaServiceTest {

    @Mock
    private CandidatoService candidatoService;

    @Mock
    private ArchivoService archivoService;

    @Mock
    private ClienteGroq clienteGroq;

    private IaService iaService;
    private Candidato candidato;

    @BeforeEach
    void setUp() {
        iaService = new IaService(candidatoService, archivoService, clienteGroq, new ObjectMapper());
        Oferta oferta = new Oferta();
        oferta.setCargo("Técnico Acuícola");
        oferta.setFunciones("Monitorear jaulas.");
        oferta.setRequisitos("Título técnico en acuicultura.");
        candidato = new Candidato();
        candidato.setNombre("Tomás Fuentes");
        candidato.setRut("12.345.678-5");
        candidato.setCorreo("tomas@correo.cl");
        candidato.setTelefono("+56 9 1111 2222");
        candidato.setCargo("Técnico Acuícola");
        candidato.setFamilia("Operaciones");
        candidato.setObservaciones("Tomás tiene buena experiencia.");
        candidato.setOferta(oferta);
    }

    @Test
    void enviaDatosAnonimizadosYDevuelveLaSugerencia() {
        when(clienteGroq.configurado()).thenReturn(true);
        when(clienteGroq.getModelo()).thenReturn("qwen/qwen3.8-27b");
        when(candidatoService.buscarEntidad(5L)).thenReturn(candidato);
        when(archivoService.textoDelCv(candidato))
                .thenReturn("Tomás Fuentes, 12.345.678-5, tomas@correo.cl. Técnico en acuicultura, 4 años en centros de cultivo.");
        when(clienteGroq.completar(eq(IaService.INSTRUCCIONES), anyString())).thenReturn("""
                ```json
                {"puntaje": 82, "resumen": "Perfil técnico adecuado.",
                 "requisitos": [{"nombre": "Título técnico", "estado": "cumple", "detalle": "Técnico en acuicultura"},
                                {"nombre": "Licencia clase B", "estado": "desconocido", "detalle": "No aparece"}],
                 "fortalezas": ["4 años en centros"],
                 "brechas": ["Sin licencia indicada"], "preguntas": ["¿Qué parámetros del agua monitoreaba?"],
                 "criterios": ["Cumple el título técnico"]}
                ```""");

        AnalisisIaResponse sugerencia = iaService.analizar(5L);

        assertEquals(82, sugerencia.puntaje());
        assertEquals("cumple", sugerencia.requisitos().get(0).estado());
        // Un estado desconocido se muestra como "parcial".
        assertEquals("parcial", sugerencia.requisitos().get(1).estado());
        assertEquals(List.of("4 años en centros"), sugerencia.fortalezas());
        assertEquals(List.of("¿Qué parámetros del agua monitoreaba?"), sugerencia.preguntas());
        assertTrue(sugerencia.cvAnalizado());
        assertEquals(AnalisisIaResponse.ADVERTENCIA, sugerencia.advertencia());

        ArgumentCaptor<String> datos = ArgumentCaptor.forClass(String.class);
        verify(clienteGroq).completar(eq(IaService.INSTRUCCIONES), datos.capture());
        String enviado = datos.getValue();
        assertTrue(enviado.contains("REQUISITOS: Título técnico en acuicultura."));
        assertTrue(enviado.contains("4 años en centros de cultivo"));
        assertFalse(enviado.contains("Tomás"));
        assertFalse(enviado.contains("12.345.678-5"));
        assertFalse(enviado.contains("tomas@correo.cl"));
        assertFalse(enviado.contains("1111 2222"));
    }

    @Test
    void sinOfertaNiCvUsaElCargoDelCandidato() {
        candidato.setOferta(null);
        candidato.setObservaciones(null);

        String datos = iaService.armarDatos(candidato, "");

        assertTrue(datos.contains("CARGO: Técnico Acuícola"));
        assertTrue(datos.contains("No disponible"));
        assertFalse(datos.contains("REQUISITOS"));
    }

    @Test
    void limitaElPuntajeYRechazaRespuestasSinJson() {
        when(clienteGroq.getModelo()).thenReturn("qwen/qwen3.8-27b");
        assertEquals(100, iaService.leerRespuesta(1L, "{\"puntaje\": 140}", false).puntaje());
        assertEquals(0, iaService.leerRespuesta(1L, "{\"puntaje\": -5}", false).puntaje());

        assertThrows(IaNoDisponibleException.class, () -> iaService.leerRespuesta(1L, "No puedo ayudar.", false));
        assertThrows(IaNoDisponibleException.class, () -> iaService.leerRespuesta(1L, "{ no es json }", false));
    }

    @Test
    void sinClaveNoLlamaALaIa() {
        when(clienteGroq.configurado()).thenReturn(false);

        assertThrows(IaNoDisponibleException.class, () -> iaService.analizar(5L));
        verify(candidatoService, never()).buscarEntidad(5L);
    }
}
