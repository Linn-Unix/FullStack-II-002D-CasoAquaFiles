package cl.aquachile.aquafiles.dto;

import java.time.LocalDate;

import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;

public record PostulacionResponse(
        Long id,
        String nombre,
        String cargo,
        String familia,
        String ubicacion,
        LocalDate fechaSolicitud,
        EstadoCandidato estado,
        String estadoGeneral) {

    public static PostulacionResponse desde(Candidato candidato) {
        return new PostulacionResponse(
                candidato.getId(),
                candidato.getNombre(),
                candidato.getCargo(),
                candidato.getFamilia(),
                candidato.getUbicacion(),
                candidato.getFechaSolicitud(),
                candidato.getEstado(),
                candidato.getEstado().getEtiqueta());
    }
}
