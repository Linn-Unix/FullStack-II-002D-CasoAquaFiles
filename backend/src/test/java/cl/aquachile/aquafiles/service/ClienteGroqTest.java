package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import cl.aquachile.aquafiles.exception.IaNoDisponibleException;

// MockRestServiceServer simula la API de Groq: no se hace ninguna llamada real a internet.
class ClienteGroqTest {

    private static final String URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODELO = "qwen/qwen3.8-27b";

    @Test
    void enviaElModeloLosMensajesYLaClave() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(builder).build();
        ClienteGroq cliente = new ClienteGroq(builder, URL, MODELO, "clave-de-prueba", true);
        servidor.expect(requestTo(URL))
                .andExpect(header("Authorization", "Bearer clave-de-prueba"))
                .andExpect(jsonPath("$.model").value(MODELO))
                .andExpect(jsonPath("$.reasoning_format").value("hidden"))
                .andExpect(jsonPath("$.max_completion_tokens").value(ClienteGroq.MAXIMO_TOKENS))
                .andExpect(jsonPath("$.messages[0].role").value("system"))
                .andExpect(jsonPath("$.messages[1].content").value("datos"))
                .andRespond(withSuccess("{\"choices\":[{\"message\":{\"content\":\"{\\\"puntaje\\\":70}\"}}]}",
                        MediaType.APPLICATION_JSON));

        assertEquals("{\"puntaje\":70}", cliente.completar("reglas", "datos"));
        servidor.verify();
    }

    @Test
    void avisaSiFaltaLaClaveOSiGroqFalla() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(builder).build();
        ClienteGroq sinClave = new ClienteGroq(builder, URL, MODELO, "", true);
        assertFalse(sinClave.configurado());
        assertThrows(IaNoDisponibleException.class, () -> sinClave.completar("a", "b"));

        ClienteGroq cliente = new ClienteGroq(builder, URL, MODELO, "clave", true);
        servidor.expect(requestTo(URL)).andRespond(withServerError());
        IaNoDisponibleException error = assertThrows(IaNoDisponibleException.class, () -> cliente.completar("a", "b"));
        assertTrue(error.getMessage().contains("no está disponible"));
    }

    @Test
    void explicaElLimiteDelPlanGratuito() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(builder).build();
        ClienteGroq cliente = new ClienteGroq(builder, URL, MODELO, "clave", true);
        servidor.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS)
                .contentType(MediaType.APPLICATION_JSON).body("{\"error\":{\"message\":\"Rate limit reached\"}}"));

        IaNoDisponibleException error = assertThrows(IaNoDisponibleException.class, () -> cliente.completar("a", "b"));
        assertTrue(error.getMessage().contains("Espera un minuto"));
    }

    @Test
    void traduceLosErroresDeGroq() {
        assertTrue(ClienteGroq.mensajeDeError(429, "{\"error\":\"Request too large for model\"}").contains("demasiado grande"));
        assertTrue(ClienteGroq.mensajeDeError(401, "").contains("GROQ_API_KEY"));
        assertTrue(ClienteGroq.mensajeDeError(404, "").contains("GROQ_MODELO"));
        assertTrue(ClienteGroq.mensajeDeError(503, null).contains("no está disponible"));
    }

    @Test
    void avisaSiGroqRespondeSinContenidoYQueElConstructorDeSpringFunciona() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(builder).build();
        ClienteGroq cliente = new ClienteGroq(builder, URL, MODELO, "clave", true);
        servidor.expect(requestTo(URL)).andRespond(withSuccess("{\"choices\":[]}", MediaType.APPLICATION_JSON));

        assertThrows(IaNoDisponibleException.class, () -> cliente.completar("a", "b"));
        assertEquals(MODELO, cliente.getModelo());
        assertTrue(new ClienteGroq(RestClient.builder(), URL, MODELO, "clave").configurado());
    }
}
