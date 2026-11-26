package cl.aquachile.aquafiles.service;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;

import cl.aquachile.aquafiles.exception.IaNoDisponibleException;

// Llama a la IA en Groq (basado en el ejemplo "aqua-ia" del profesor).
// Usa el formato "chat completions": un mensaje de sistema (las reglas) y uno de usuario (los datos).
@Component
public class ClienteGroq {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClienteGroq.class);

    // Largo máximo de la respuesta: el plan gratuito de Groq limita los tokens por minuto.
    static final int MAXIMO_TOKENS = 950;

    private final RestClient restClient;
    private final String url;
    private final String modelo;
    private final String clave;

    // Constructor que usa Spring: HTTP/1.1 (evita la negociación a HTTP/2 que algunos proxys no soportan)
    // y un tiempo máximo de espera, para que la pantalla no quede colgada si la IA no responde.
    @Autowired
    public ClienteGroq(RestClient.Builder builder,
                       @Value("${app.ia.url}") String url,
                       @Value("${app.ia.modelo}") String modelo,
                       @Value("${app.ia.clave:}") String clave) {
        this(builder.requestFactory(fabricaHttp11()), url, modelo, clave, true);
    }

    // Constructor de las pruebas: usa el builder tal cual (con el servidor simulado).
    ClienteGroq(RestClient.Builder builder, String url, String modelo, String clave, boolean preparado) {
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

    // Devuelve el texto que respondió la IA.
    public String completar(String instrucciones, String datos) {
        if (!configurado()) {
            throw new IaNoDisponibleException("El apoyo de IA no está configurado (falta GROQ_API_KEY en el backend).");
        }
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("model", modelo);
        cuerpo.put("reasoning_format", "hidden"); // oculta el "razonamiento" interno del modelo
        cuerpo.put("temperature", 0.2);           // bajo = respuestas más precisas, menos creativas
        cuerpo.put("max_completion_tokens", MAXIMO_TOKENS);
        cuerpo.put("messages", List.of(
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
                throw new IaNoDisponibleException("La IA respondió sin contenido. Inténtalo nuevamente.");
            }
            return contenido.asText();
        } catch (RestClientResponseException error) {
            // El detalle técnico queda en el log del backend; al usuario se le muestra un mensaje simple.
            LOGGER.warn("Error de Groq {}: {}", error.getStatusCode().value(), error.getResponseBodyAsString());
            throw new IaNoDisponibleException(mensajeDeError(error.getStatusCode().value(), error.getResponseBodyAsString()), error);
        } catch (RestClientException error) {
            LOGGER.warn("Error al llamar a Groq: {}", error.getMessage());
            throw new IaNoDisponibleException("No se pudo conectar con la IA. Inténtalo más tarde.", error);
        }
    }

    // Traduce los errores de Groq a mensajes que entiende el analista.
    static String mensajeDeError(int estado, String detalle) {
        if (estado == 429 && detalle != null && detalle.contains("Request too large")) {
            return "La consulta es demasiado grande para el plan gratuito de la IA. Prueba con un CV más corto.";
        }
        if (estado == 429) {
            return "Se alcanzó el límite gratuito de la IA. Espera un minuto y vuelve a intentar.";
        }
        if (estado == 401 || estado == 403) {
            return "La clave de la IA no es válida. Revisa GROQ_API_KEY en el backend.";
        }
        if (estado == 404 || estado == 400) {
            return "La IA rechazó la consulta. Revisa el modelo configurado (GROQ_MODELO).";
        }
        return "La IA no está disponible en este momento. Inténtalo más tarde.";
    }
}
