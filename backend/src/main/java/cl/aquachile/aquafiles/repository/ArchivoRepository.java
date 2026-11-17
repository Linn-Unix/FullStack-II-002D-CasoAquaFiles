package cl.aquachile.aquafiles.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.aquachile.aquafiles.entity.Archivo;

public interface ArchivoRepository extends JpaRepository<Archivo, Long> {

    List<Archivo> findByCandidatoIdOrderByFechaCargaDesc(Long candidatoId);

    Optional<Archivo> findByIdAndCandidatoId(Long id, Long candidatoId);
}
