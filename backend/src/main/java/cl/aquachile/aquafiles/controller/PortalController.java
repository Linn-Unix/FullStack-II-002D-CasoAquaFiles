package cl.aquachile.aquafiles.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.aquafiles.dto.OfertaResponse;
import cl.aquachile.aquafiles.entity.Modalidad;
import cl.aquachile.aquafiles.service.OfertaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;

// Portal público de oportunidades laborales: NO necesita iniciar sesión.
@RestController
@RequestMapping("/api/v1/portal/ofertas")
@Tag(name = "Portal público", description = "Ofertas publicadas, visibles sin iniciar sesión")
@SecurityRequirements
public class PortalController {

    private final OfertaService ofertaService;

    public PortalController(OfertaService ofertaService) {
        this.ofertaService = ofertaService;
    }

    @GetMapping
    @Operation(summary = "Buscar ofertas publicadas por texto, categoría y modalidad")
    public List<OfertaResponse> listar(@RequestParam(required = false) String busqueda,
                                       @RequestParam(required = false) String familia,
                                       @RequestParam(required = false) Modalidad modalidad) {
        return ofertaService.listarPublicadas(busqueda, familia, modalidad);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una oferta publicada")
    public OfertaResponse obtener(@PathVariable Long id) {
        return ofertaService.obtenerPublicada(id);
    }
}
