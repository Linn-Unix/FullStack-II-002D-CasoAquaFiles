package cl.aquachile.aquafiles.dto;

import cl.aquachile.aquafiles.entity.Modalidad;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OfertaRequest(
        @NotBlank(message = "El cargo es obligatorio.")
        @Size(min = 3, max = 120, message = "El cargo debe tener entre 3 y 120 caracteres.")
        String cargo,

        @NotBlank(message = "La categoría es obligatoria.")
        @Size(max = 60)
        String familia,

        @NotBlank(message = "La ubicación es obligatoria.")
        @Size(max = 60)
        String ubicacion,

        @NotNull(message = "La modalidad es obligatoria.")
        Modalidad modalidad,

        @NotNull(message = "Los cupos son obligatorios.")
        @Min(value = 1, message = "Debe haber al menos 1 cupo.")
        @Max(value = 100, message = "No puede haber más de 100 cupos.")
        Integer cupos,

        @NotBlank(message = "La descripción es obligatoria.")
        @Size(max = 2000)
        String descripcion,

        @NotBlank(message = "Las funciones son obligatorias.")
        @Size(max = 2000)
        String funciones,

        @NotBlank(message = "Los requisitos son obligatorios.")
        @Size(max = 2000)
        String requisitos,

        @NotBlank(message = "Los beneficios son obligatorios.")
        @Size(max = 2000)
        String beneficios,

        @NotNull(message = "El sueldo mínimo es obligatorio.")
        @Min(value = 0, message = "El sueldo no puede ser negativo.")
        Integer sueldoMinimo,

        @NotNull(message = "El sueldo máximo es obligatorio.")
        @Min(value = 0, message = "El sueldo no puede ser negativo.")
        Integer sueldoMaximo) {
}
