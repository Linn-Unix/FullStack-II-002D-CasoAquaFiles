package cl.aquachile.aquafiles.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.aquafiles.dto.PostulacionRequest;
import cl.aquachile.aquafiles.dto.PostulacionResponse;
import cl.aquachile.aquafiles.service.CandidatoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/postulaciones")
public class PostulacionController {

    private final CandidatoService candidatoService;

    public PostulacionController(CandidatoService candidatoService) {
        this.candidatoService = candidatoService;
    }

    @PostMapping
    public ResponseEntity<PostulacionResponse> postular(@Valid @RequestBody PostulacionRequest datos) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidatoService.registrarPostulacion(datos));
    }
}
