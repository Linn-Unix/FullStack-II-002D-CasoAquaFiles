package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import cl.aquachile.aquafiles.exception.IaNoDisponibleException;

// MockRestServiceServer simula la API de xAI: no se hace ninguna llamada real a internet.
class ClienteGrokTest {

    private static final String URL = "https://api.x.ai/v1/chat/completions";

    @Test
    void enviaElModeloLosMensajesYLaClave() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(builder).build();
        ClienteGrok cliente = new ClienteGrok(builder, URL, "grok-3-mini", "clave-de-prueba", true);
        servidor.expect(requestTo(URL))
                .andExpect(header("Authorization", "Bearer clave-de-prueba"))
                .andExpect(jsonPath("$.model").value("grok-3-mini"))
                .andExpect(jsonPath("$.messages[0].role").value("system"))
                .andExpect(jsonPath("$.messages[1].content").value("datos"))
                .andRespond(withSuccess("{\"choices\":[{\"message\":{\"content\":\"{\\\"puntaje\\\":70}\"}}]}",
                        MediaType.APPLICATION_JSON));

        assertEquals("{\"puntaje\":70}", cliente.completar("reglas", "datos"));
        servidor.verify();
    }

    @Test
    void avisaSiFaltaLaClaveOSiGrokFalla() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(builder).build();
        ClienteGrok sinClave = new ClienteGrok(builder, URL, "grok-3-mini", "", true);
        assertFalse(sinClave.configurado());
        assertThrows(IaNoDisponibleException.class, () -> sinClave.completar("a", "b"));

        ClienteGrok cliente = new ClienteGrok(builder, URL, "grok-3-mini", "clave", true);
        servidor.expect(requestTo(URL)).andRespond(withServerError());
        assertThrows(IaNoDisponibleException.class, () -> cliente.completar("a", "b"));
    }

    @Test
    void elConstructorDeSpringPreparaElCliente() {
        ClienteGrok cliente = new ClienteGrok(RestClient.builder(), URL, "grok-3-mini", "clave");
        assertEquals(true, cliente.configurado());
    }

    @Test
    void avisaSiGrokRespondeSinContenido() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(builder).build();
        ClienteGrok cliente = new ClienteGrok(builder, URL, "grok-3-mini", "clave", true);
        servidor.expect(requestTo(URL)).andRespond(withSuccess("{\"choices\":[]}", MediaType.APPLICATION_JSON));

        assertThrows(IaNoDisponibleException.class, () -> cliente.completar("a", "b"));
        assertEquals("grok-3-mini", cliente.getModelo());
    }
}
