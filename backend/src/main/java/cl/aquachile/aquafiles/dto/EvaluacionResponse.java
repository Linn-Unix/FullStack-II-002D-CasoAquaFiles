package cl.aquachile.aquafiles.dto;

import java.time.LocalDate;

import cl.aquachile.aquafiles.entity.Archivo;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.entity.Evaluacion;

// Todo lo que necesita ver el panel del evaluador, en un solo objeto.
public record EvaluacionResponse(
        Long id,
        Long candidatoId,
        String nombre,
        String rut,
        String cargo,
        String familia,
        String ubicacion,
        String centroCosto,
        String responsable,
        LocalDate fechaSolicitud,
        LocalDate fechaDerivacion,
        EstadoCandidato estado,
        String estadoEtiqueta,
        String observacionesAnalista,  // el evaluador solo las lee
        Long cvId,
        String nombreCv,
        LocalDate fechaEntrevista,
        String resultado,
        String observaciones,
        Long informeId,
        String nombreInforme) {

    public static EvaluacionResponse desde(Evaluacion e) {
        Candidato c = e.getCandidato();
        Archivo informe = e.getInforme();
        return new EvaluacionResponse(
                e.getId(), c.getId(), c.getNombre(), c.getRut(), c.getCargo(), c.getFamilia(),
                c.getUbicacion(), c.getCentroCosto(), c.getResponsable(),
                c.getFechaSolicitud(), c.getFechaDerivacion(),
                c.getEstado(), c.getEstado().getEtiqueta(), c.getObservaciones(),
                c.buscarCv().map(Archivo::getId).orElse(null),
                c.buscarCv().map(Archivo::getNombreOriginal).orElse(null),
                e.getFechaEntrevista(), e.getResultado(), e.getObservaciones(),
                informe == null ? null : informe.getId(),
                informe == null ? null : informe.getNombreOriginal());
    }
}