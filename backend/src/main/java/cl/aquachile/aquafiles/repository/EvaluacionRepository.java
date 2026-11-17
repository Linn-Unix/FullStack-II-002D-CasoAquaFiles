package cl.aquachile.aquafiles.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.aquachile.aquafiles.entity.Evaluacion;

public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {

    List<Evaluacion> findAllByOrderByFechaCreacionDesc();

    boolean existsByCandidatoId(Long candidatoId);

    Optional<Evaluacion> findByCandidatoId(Long candidatoId);
}