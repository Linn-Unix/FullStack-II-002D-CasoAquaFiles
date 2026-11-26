package cl.aquachile.aquafiles.dto;

import java.time.LocalDateTime;

import cl.aquachile.aquafiles.entity.Archivo;

public record ArchivoResponse(
        Long id,
        Long candidatoId,
        String nombreOriginal,
        String tipoContenido,
        String extension,
        String categoria,
        String carpeta,
        long tamano,
        LocalDateTime fechaCarga) {

    public static ArchivoResponse desde(Archivo archivo) {
        return new ArchivoResponse(
                archivo.getId(),
                archivo.getCandidato().getId(),
                archivo.getNombreOriginal(),
                archivo.getTipoContenido(),
                archivo.getExtension(),
                archivo.getCategoria() == null ? null : archivo.getCategoria().name(),
                carpetaDe(archivo.getNombreAlmacenado()),
                archivo.getTamano(),
                archivo.getFechaCarga());
    }

    // "tomas-fuentes-12/abc.pdf" → "tomas-fuentes-12". Los archivos antiguos no tienen carpeta.
    private static String carpetaDe(String nombreAlmacenado) {
        if (nombreAlmacenado == null || !nombreAlmacenado.contains("/")) {
            return null;
        }
        return nombreAlmacenado.substring(0, nombreAlmacenado.lastIndexOf('/'));
    }
}
