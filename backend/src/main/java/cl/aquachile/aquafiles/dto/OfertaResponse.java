package cl.aquachile.aquafiles.dto;

import java.time.LocalDate;

import cl.aquachile.aquafiles.entity.Modalidad;
import cl.aquachile.aquafiles.entity.Oferta;

public record OfertaResponse(
        Long id,
        String cargo,
        String familia,
        String ubicacion,
        Modalidad modalidad,
        String modalidadEtiqueta,
        Integer cupos,
        String descripcion,
        String funciones,
        String requisitos,
        String beneficios,
        Integer sueldoMinimo,
        Integer sueldoMaximo,
        boolean publicada,
        LocalDate fechaPublicacion) {

    public static OfertaResponse desde(Oferta oferta) {
        return new OfertaResponse(
                oferta.getId(),
                oferta.getCargo(),
                oferta.getFamilia(),
                oferta.getUbicacion(),
                oferta.getModalidad(),
                oferta.getModalidad().getEtiqueta(),
                oferta.getCupos(),
                oferta.getDescripcion(),
                oferta.getFunciones(),
                oferta.getRequisitos(),
                oferta.getBeneficios(),
                oferta.getSueldoMinimo(),
                oferta.getSueldoMaximo(),
                oferta.isPublicada(),
                oferta.getFechaPublicacion());
    }
}
