package cl.aquachile.aquafiles.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.aquafiles.dto.AnalisisIaResponse;
import cl.aquachile.aquafiles.service.IaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

// Solo ANALISTA. La IA sugiere; no modifica al candidato.
@RestController
@RequestMapping("/api/v1/ia")
@Tag(name = "Apoyo de IA", description = "Sugerencias de la IA (Groq) para el analista (revisión humana obligatoria)")
public class IaController {

    private final IaService iaService;

    public IaController(IaService iaService) {
        this.iaService = iaService;
    }

    @PostMapping("/candidatos/{id}/analisis")
    @Operation(summary = "Puntuación orientativa, fortalezas, brechas y preguntas de entrevista para un candidato")
    public AnalisisIaResponse analizar(@PathVariable Long id) {
        return iaService.analizar(id);
    }
}
