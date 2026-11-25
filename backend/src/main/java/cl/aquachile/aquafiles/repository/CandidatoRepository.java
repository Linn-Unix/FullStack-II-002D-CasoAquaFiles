package cl.aquachile.aquafiles.repository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;

public interface CandidatoRepository extends JpaRepository<Candidato, Long> {

    boolean existsByRut(String rut);

    boolean existsByOfertaId(Long ofertaId);

    boolean existsByRutAndIdNot(String rut, Long id);

    Optional<Candidato> findByRut(String rut);

    List<Candidato> findAllByOrderByFechaSolicitudDescIdDesc();

    @Query("""
            SELECT c FROM Candidato c
            WHERE (:texto = ''
                   OR LOWER(c.nombre) LIKE CONCAT('%', :texto, '%')
                   OR REPLACE(REPLACE(c.rut, '.', ''), '-', '') LIKE CONCAT('%', :rut, '%'))
              AND c.estado IN :estados
              AND (:familia = '' OR c.familia = :familia)
              AND (:ubicacion = '' OR c.ubicacion = :ubicacion)
              AND (:centroCosto = '' OR c.centroCosto = :centroCosto)
            ORDER BY c.fechaSolicitud DESC, c.id DESC
            """)
    List<Candidato> buscar(@Param("texto") String texto,
                           @Param("rut") String rut,
                           @Param("estados") Collection<EstadoCandidato> estados,
                           @Param("familia") String familia,
                           @Param("ubicacion") String ubicacion,
                           @Param("centroCosto") String centroCosto);
}
