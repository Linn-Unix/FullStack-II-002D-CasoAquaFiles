package cl.aquachile.aquafiles.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Al derivar, el analista indica qué profesional evaluador queda a cargo.
public record DerivacionRequest(
        @NotBlank(message = "Selecciona el profesional responsable.")
        @Size(max = 120)
        String responsable) {
}
