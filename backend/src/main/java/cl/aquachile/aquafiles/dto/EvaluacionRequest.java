package cl.aquachile.aquafiles.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Lo que manda el evaluador. Todos los campos son opcionales:
// puede guardar solo la fecha, o solo el resultado.
public record EvaluacionRequest(
        LocalDate fechaEntrevista,

        @Pattern(regexp = "Recomendable|Recomendable con observaciones|No recomendable",
                message = "Selecciona un resultado válido.")
        String resultado,

        @Size(max = 2000, message = "Las observaciones no pueden superar 2000 caracteres.")
        String observaciones) {
}