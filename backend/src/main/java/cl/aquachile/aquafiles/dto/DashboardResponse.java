package cl.aquachile.aquafiles.dto;

import java.util.Map;

public record DashboardResponse(
        long total,
        Map<String, Long> porEstado,       // {"REVISION": 3, "APROBADO": 1, ...}
        Map<String, Long> porFamilia,      // {"Operaciones": 4, ...}
        Map<String, Long> porUbicacion,    // {"Puerto Montt": 2, ...}
        Double promedioDiasHastaDerivacion,
        Double promedioDiasHastaFinalizacion) {
}