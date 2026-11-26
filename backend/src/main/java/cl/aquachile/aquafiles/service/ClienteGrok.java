package cl.aquachile.aquafiles.service;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.databind.JsonNode;

import cl.aquachile.aquafiles.exception.IaNoDisponibleException;

// Llama a la API de Grok (xAI). Usa el formato de "chat completions":
// se envía un mensaje de sistema (las reglas) y uno de usuario (los datos), y Grok responde un texto.
@Component
public class ClienteGrok {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClienteGrok.class);

    private final RestClient restClient;
    private final String url;
    private final String modelo;
    private final String clave;

    // Constructor que usa Spring: HTTP/1.1 (evita la negociación a HTTP/2 que algunos proxys no soportan)
    // y un tiempo máximo de espera, para que la pantalla no quede colgada si Grok no responde.
    @Autowired
    public ClienteGrok(RestClient.Builder builder,
                       @Value("${app.ia.url}") String url,
                       @Value("${app.ia.modelo}") String modelo,
                       @Value("${app.ia.clave:}") String clave) {
        this(builder.requestFactory(fabricaHttp11()), url, modelo, clave, true);
    }

    // Constructor de las pruebas: usa el builder tal cual (con el servidor simulado).
    ClienteGrok(RestClient.Builder builder, String url, String modelo, String clave, boolean preparado) {
        this.restClient = builder.build();
        this.url = url;
        this.modelo = modelo;
        this.clave = clave;
    }

    private static JdkClientHttpRequestFactory fabricaHttp11() {
        HttpClient http = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory(http);
        fabrica.setReadTimeout(Duration.ofSeconds(60));
        return fabrica;
    }

    public boolean configurado() {
        return clave != null && !clave.isBlank();
    }

    public String getModelo() {
        return modelo;
    }

    // Devuelve el texto que respondió Grok.
    public String completar(String instrucciones, String datos) {
        if (!configurado()) {
            throw new IaNoDisponibleException("El apoyo de IA no está configurado (falta GROK_API_KEY en el backend).");
        }
        Map<String, Object> cuerpo = Map.of(
                "model", modelo,
                "temperature", 0.2,
                "messages", List.of(
                        Map.of("role", "system", "content", instrucciones),
                        Map.of("role", "user", "content", datos)));
        try {
            JsonNode respuesta = restClient.post()
                    .uri(url)
                    .header("Authorization", "Bearer " + clave)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(cuerpo)
                    .retrieve()
                    .body(JsonNode.class);
            JsonNode contenido = respuesta == null ? null : respuesta.at("/choices/0/message/content");
            if (contenido == null || contenido.isMissingNode() || contenido.asText().isBlank()) {
                throw new IaNoDisponibleException("Grok respondió sin contenido. Inténtalo nuevamente.");
            }
            return contenido.asText();
        } catch (RestClientException error) {
            // El detalle técnico queda en el log del backend; al usuario se le muestra un mensaje simple.
            LOGGER.warn("Error al llamar a Grok: {}", error.getMessage());
            throw new IaNoDisponibleException("No se pudo obtener la respuesta de Grok. Inténtalo más tarde.", error);
        }
    }
}
