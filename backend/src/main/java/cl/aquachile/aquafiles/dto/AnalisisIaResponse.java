package cl.aquachile.aquafiles.dto;

import java.time.LocalDateTime;
import java.util.List;

// Sugerencia de la IA para el analista. No cambia el estado del candidato.
public record AnalisisIaResponse(
        Long candidatoId,
        int puntaje,
        String resumen,
        List<String> fortalezas,
        List<String> brechas,
        List<String> preguntas,
        List<String> criterios,
        boolean cvAnalizado,
        String modelo,
        String advertencia,
        LocalDateTime fecha) {

    public static final String ADVERTENCIA = "Sugerencia generada por IA (Grok). Es orientativa: no aprueba, rechaza "
            + "ni deriva candidatos y puede equivocarse. El analista debe revisar el CV y decidir.";
}
