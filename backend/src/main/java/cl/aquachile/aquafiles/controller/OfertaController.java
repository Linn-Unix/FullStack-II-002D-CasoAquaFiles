package cl.aquachile.aquafiles.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.aquafiles.dto.OfertaRequest;
import cl.aquachile.aquafiles.dto.OfertaResponse;
import cl.aquachile.aquafiles.service.OfertaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

// Administración de ofertas. Solo ANALISTA (regla de SecurityConfig).
@RestController
@RequestMapping("/api/v1/ofertas")
@Tag(name = "Ofertas (administración)", description = "Crear, editar, publicar y despublicar ofertas laborales")
public class OfertaController {

    private final OfertaService ofertaService;

    public OfertaController(OfertaService ofertaService) {
        this.ofertaService = ofertaService;
    }

    @GetMapping
    @Operation(summary = "Listar todas las ofertas (publicadas y no publicadas)")
    public List<OfertaResponse> listar() {
        return ofertaService.listarTodas();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una oferta")
    public OfertaResponse obtener(@PathVariable Long id) {
        return ofertaService.obtener(id);
    }

    @PostMapping
    @Operation(summary = "Crear una oferta (queda sin publicar)")
    public ResponseEntity<OfertaResponse> crear(@Valid @RequestBody OfertaRequest datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ofertaService.crear(datos));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar una oferta")
    public OfertaResponse actualizar(@PathVariable Long id, @Valid @RequestBody OfertaRequest datos) {
        return ofertaService.actualizar(id, datos);
    }

    @PatchMapping("/{id}/publicar")
    @Operation(summary = "Publicar una oferta en el portal")
    public OfertaResponse publicar(@PathVariable Long id) {
        return ofertaService.publicar(id);
    }

    @PatchMapping("/{id}/despublicar")
    @Operation(summary = "Quitar una oferta del portal")
    public OfertaResponse despublicar(@PathVariable Long id) {
        return ofertaService.despublicar(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una oferta sin postulaciones")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ofertaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
