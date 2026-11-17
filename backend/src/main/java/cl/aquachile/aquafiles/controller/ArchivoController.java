package cl.aquachile.aquafiles.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import cl.aquachile.aquafiles.dto.ArchivoResponse;
import cl.aquachile.aquafiles.service.ArchivoService;

@RestController
@RequestMapping("/api/v1")
public class ArchivoController {

    private final ArchivoService archivoService;

    public ArchivoController(ArchivoService archivoService) {
        this.archivoService = archivoService;
    }

    @PostMapping("/postulaciones/{candidatoId}/cv")
    public ResponseEntity<ArchivoResponse> subirCv(@PathVariable Long candidatoId,
                                                    @RequestPart("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(archivoService.guardarCv(candidatoId, archivo));
    }

    @GetMapping("/candidatos/{candidatoId}/archivos")
    public List<ArchivoResponse> listar(@PathVariable Long candidatoId) {
        return archivoService.listar(candidatoId);
    }

    @GetMapping("/archivos/{archivoId}/descargar")
    public ResponseEntity<Resource> descargar(@PathVariable Long archivoId) {
        ArchivoService.ArchivoDescarga descarga = archivoService.descargar(archivoId);
        MediaType tipo;
        try {
            tipo = MediaType.parseMediaType(descarga.tipoContenido());
        } catch (IllegalArgumentException error) {
            tipo = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
                .contentType(tipo)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(descarga.nombre())
                                .build()
                                .toString())
                .body(descarga.recurso());
    }

    @DeleteMapping("/archivos/{archivoId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long archivoId) {
        archivoService.eliminar(archivoId);
        return ResponseEntity.noContent().build();
    }
}
