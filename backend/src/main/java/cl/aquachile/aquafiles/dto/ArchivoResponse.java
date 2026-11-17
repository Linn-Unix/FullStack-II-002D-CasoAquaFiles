package cl.aquachile.aquafiles.dto;

import java.time.LocalDateTime;

import cl.aquachile.aquafiles.entity.Archivo;

public record ArchivoResponse(
        Long id,
        Long candidatoId,
        String nombreOriginal,
        String tipoContenido,
        String extension,
        long tamano,
        LocalDateTime fechaCarga) {

    public static ArchivoResponse desde(Archivo archivo) {
        return new ArchivoResponse(
                archivo.getId(),
                archivo.getCandidato().getId(),
                archivo.getNombreOriginal(),
                archivo.getTipoContenido(),
                archivo.getExtension(),
                archivo.getTamano(),
                archivo.getFechaCarga());
    }
}
