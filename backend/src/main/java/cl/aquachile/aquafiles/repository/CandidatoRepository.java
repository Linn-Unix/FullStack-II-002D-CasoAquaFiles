package cl.aquachile.aquafiles.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.aquachile.aquafiles.entity.Candidato;

public interface CandidatoRepository extends JpaRepository<Candidato, Long> {

    boolean existsByRut(String rut);

    boolean existsByRutAndIdNot(String rut, Long id);

    Optional<Candidato> findByRut(String rut);

    List<Candidato> findAllByOrderByFechaSolicitudDescIdDesc();
}
