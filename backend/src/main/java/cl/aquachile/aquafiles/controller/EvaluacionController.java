package cl.aquachile.aquafiles.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import cl.aquachile.aquafiles.dto.EvaluacionRequest;
import cl.aquachile.aquafiles.dto.EvaluacionResponse;
import cl.aquachile.aquafiles.service.EvaluacionService;
import jakarta.validation.Valid;

// Solo EVALUADOR (regla de SecurityConfig, rama 4).
@RestController
@RequestMapping("/api/evaluaciones")
public class EvaluacionController {

    private final EvaluacionService evaluacionService;

    public EvaluacionController(EvaluacionService evaluacionService) {
        this.evaluacionService = evaluacionService;
    }

    @GetMapping
    public List<EvaluacionResponse> listar() {
        return evaluacionService.listar();
    }

    @GetMapping("/{id}")
    public EvaluacionResponse obtener(@PathVariable Long id) {
        return evaluacionService.obtener(id);
    }

    // {"fechaEntrevista":"2026-11-20","resultado":"Recomendable","observaciones":"..."}
    @PutMapping("/{id}")
    public EvaluacionResponse actualizar(@PathVariable Long id, @Valid @RequestBody EvaluacionRequest datos) {
        return evaluacionService.actualizar(id, datos);
    }

    // form-data: archivo=<file>
    @PostMapping(value = "/{id}/informe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public EvaluacionResponse subirInforme(@PathVariable Long id, @RequestParam("archivo") MultipartFile archivo) {
        return evaluacionService.subirInforme(id, archivo);
    }
}