package cl.aquachile.aquafiles.dto;

import jakarta.validation.constraints.NotBlank;

// Lo que manda el frontend: {"usuario":"analista","clave":"aqua123"}
public record LoginRequest(
        @NotBlank(message = "Ingresa tu usuario.") String usuario,
        @NotBlank(message = "Ingresa tu contraseña.") String clave) {
}