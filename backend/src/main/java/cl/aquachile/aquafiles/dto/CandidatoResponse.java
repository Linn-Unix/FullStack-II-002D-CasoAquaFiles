package cl.aquachile.aquafiles.dto;

import java.time.LocalDate;

import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;

public record CandidatoResponse(
        Long id,
        String nombre,
        String rut,
        String correo,
        String telefono,
        String cargo,
        String familia,
        String ubicacion,
        String centroCosto,
        String responsable,
        String observaciones,
        EstadoCandidato estado,
        String estadoEtiqueta,
        LocalDate fechaSolicitud,
        LocalDate fechaDerivacion,
        LocalDate fechaFinalizacion) {

    public static CandidatoResponse desde(Candidato candidato) {
        return new CandidatoResponse(
                candidato.getId(),
                candidato.getNombre(),
                candidato.getRut(),
                candidato.getCorreo(),
                candidato.getTelefono(),
                candidato.getCargo(),
                candidato.getFamilia(),
                candidato.getUbicacion(),
                candidato.getCentroCosto(),
                candidato.getResponsable(),
                candidato.getObservaciones(),
                candidato.getEstado(),
                candidato.getEstado().getEtiqueta(),
                candidato.getFechaSolicitud(),
                candidato.getFechaDerivacion(),
                candidato.getFechaFinalizacion());
    }
}
