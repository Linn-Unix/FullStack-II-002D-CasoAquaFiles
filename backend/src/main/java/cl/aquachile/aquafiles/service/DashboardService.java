package cl.aquachile.aquafiles.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.aquachile.aquafiles.dto.DashboardResponse;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.repository.CandidatoRepository;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final CandidatoRepository candidatoRepository;

    public DashboardService(CandidatoRepository candidatoRepository) {
        this.candidatoRepository = candidatoRepository;
    }

    public DashboardResponse resumen() {
        List<Candidato> candidatos = candidatoRepository.findAll();

        // 1. Por estado: partimos todos en 0 para que el frontend siempre reciba los 6.
        Map<String, Long> porEstado = new LinkedHashMap<>();
        for (EstadoCandidato estado : EstadoCandidato.values()) {
            porEstado.put(estado.name(), 0L);
        }
        for (Candidato candidato : candidatos) {
            porEstado.merge(candidato.getEstado().name(), 1L, Long::sum);
        }

        // 2. Por familia y por ubicación (ordenados alfabéticamente).
        Map<String, Long> porFamilia = contarPor(candidatos, Candidato::getFamilia);
        Map<String, Long> porUbicacion = contarPor(candidatos, Candidato::getUbicacion);

        // 3. Tiempos promedio en días desde la solicitud.
        Double diasDerivacion = promedioDias(candidatos, Candidato::getFechaDerivacion);
        Double diasFinalizacion = promedioDias(candidatos, Candidato::getFechaFinalizacion);

        return new DashboardResponse(candidatos.size(), porEstado, porFamilia, porUbicacion,
                diasDerivacion, diasFinalizacion);
    }

    // groupingBy agrupa la lista según el campo y counting cuenta cuántos hay en cada grupo.
    private Map<String, Long> contarPor(List<Candidato> candidatos, Function<Candidato, String> campo) {
        return candidatos.stream()
                .collect(Collectors.groupingBy(campo, TreeMap::new, Collectors.counting()));
    }

    // Promedio de días entre fechaSolicitud y otra fecha. Solo cuenta a quienes ya llegaron a esa etapa.
    private Double promedioDias(List<Candidato> candidatos, Function<Candidato, LocalDate> fechaFin) {
        OptionalDouble promedio = candidatos.stream()
                .filter(candidato -> fechaFin.apply(candidato) != null)
                .mapToLong(candidato -> ChronoUnit.DAYS.between(candidato.getFechaSolicitud(), fechaFin.apply(candidato)))
                .average();
        // Redondeamos a 1 decimal. Si nadie llegó a esa etapa, devolvemos null.
        return promedio.isPresent() ? Math.round(promedio.getAsDouble() * 10) / 10.0 : null;
    }
}