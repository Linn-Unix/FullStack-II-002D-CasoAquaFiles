package cl.aquachile.aquafiles.dto;

import java.time.LocalDateTime;
import java.util.List;

// Sugerencia de la IA para el analista. No cambia el estado del candidato.
public record AnalisisIaResponse(
        Long candidatoId,
        int puntaje,
        String resumen,
        List<RequisitoIa> requisitos,
        List<String> fortalezas,
        List<String> brechas,
        List<String> preguntas,
        List<String> criterios,
        boolean cvAnalizado,
        String modelo,
        String advertencia,
        LocalDateTime fecha) {

    // Un requisito del cargo y si el CV lo cumple ("cumple", "parcial" o "no").
    public record RequisitoIa(String nombre, String estado, String detalle) {
    }

    public static final String ADVERTENCIA = "Sugerencia generada por IA (Groq). Es orientativa: no aprueba, rechaza "
            + "ni deriva candidatos y puede equivocarse. El analista debe revisar el CV y decidir.";
}
