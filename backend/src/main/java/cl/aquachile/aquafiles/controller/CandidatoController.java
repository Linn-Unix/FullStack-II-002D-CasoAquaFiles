package cl.aquachile.aquafiles.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.aquafiles.dto.CandidatoRequest;
import cl.aquachile.aquafiles.dto.CandidatoResponse;
import cl.aquachile.aquafiles.service.CandidatoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/candidatos")
public class CandidatoController {

    private final CandidatoService candidatoService;

    public CandidatoController(CandidatoService candidatoService) {
        this.candidatoService = candidatoService;
    }

    @PostMapping
    public ResponseEntity<CandidatoResponse> crear(@Valid @RequestBody CandidatoRequest datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(candidatoService.crear(datos));
    }

    @GetMapping
    public List<CandidatoResponse> listar() {
        return candidatoService.listar();
    }

    @GetMapping("/{id}")
    public CandidatoResponse obtener(@PathVariable Long id) {
        return candidatoService.obtener(id);
    }

    @PutMapping("/{id}")
    public CandidatoResponse actualizar(@PathVariable Long id,
                                        @Valid @RequestBody CandidatoRequest datos) {
        return candidatoService.actualizar(id, datos);
    }
}
