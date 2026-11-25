package cl.aquachile.aquafiles.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.aquachile.aquafiles.entity.Modalidad;
import cl.aquachile.aquafiles.entity.Oferta;

public interface OfertaRepository extends JpaRepository<Oferta, Long> {

    List<Oferta> findAllByOrderByFechaCreacionDescIdDesc();

    Optional<Oferta> findByIdAndPublicadaTrue(Long id);

    // Portal público: solo ofertas publicadas, con búsqueda por texto y filtros opcionales.
    @Query("""
            SELECT o FROM Oferta o
            WHERE o.publicada = TRUE
              AND (:texto = ''
                   OR LOWER(o.cargo) LIKE CONCAT('%', :texto, '%')
                   OR LOWER(o.descripcion) LIKE CONCAT('%', :texto, '%'))
              AND (:familia = '' OR o.familia = :familia)
              AND (:modalidad IS NULL OR o.modalidad = :modalidad)
            ORDER BY o.fechaPublicacion DESC, o.id DESC
            """)
    List<Oferta> buscarPublicadas(@Param("texto") String texto,
                                  @Param("familia") String familia,
                                  @Param("modalidad") Modalidad modalidad);
}
