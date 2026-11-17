package cl.aquachile.aquafiles.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CandidatoRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(min = 3, max = 120, message = "El nombre debe tener entre 3 y 120 caracteres.")
        String nombre,

        @NotBlank(message = "El RUT es obligatorio.")
        String rut,

        @NotBlank(message = "El correo es obligatorio.")
        @Email(message = "Ingresa un correo válido.")
        String correo,

        @NotBlank(message = "El teléfono es obligatorio.")
        @Pattern(regexp = "^\\+56\\s?[29](\\s?\\d){8}$",
                message = "Ingresa un teléfono válido. Ej: +56 9 1234 5678")
        String telefono,

        @NotBlank(message = "El cargo es obligatorio.")
        @Size(min = 3, max = 120, message = "El cargo debe tener entre 3 y 120 caracteres.")
        String cargo,

        @NotBlank(message = "La familia de cargo es obligatoria.")
        String familia,

        @NotBlank(message = "La ubicación es obligatoria.")
        String ubicacion,

        @NotBlank(message = "El centro de costos es obligatorio.")
        String centroCosto,

        @Size(max = 120)
        String responsable,

        @Size(max = 2000, message = "Las observaciones no pueden superar 2000 caracteres.")
        String observaciones) {
}
