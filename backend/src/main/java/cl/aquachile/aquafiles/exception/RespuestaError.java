package cl.aquachile.aquafiles.exception;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;

// Un "record" es una clase corta que solo guarda datos.
public record RespuestaError(LocalDateTime fecha, int estado, String mensaje, Map<String, String> campos) {

    public static RespuestaError de(HttpStatus estado, String mensaje) {
        return new RespuestaError(LocalDateTime.now(), estado.value(), mensaje, Map.of());
    }
}