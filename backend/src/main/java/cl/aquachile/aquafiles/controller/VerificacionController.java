package cl.aquachile.aquafiles.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

// @RestController: esta clase responde peticiones HTTP con JSON.
// @Tag y @Operation: cómo se ve en Swagger. Todos los controladores siguen este ejemplo.
@RestController
@Tag(name = "Verificación", description = "Comprobar que el servidor está encendido")
public class VerificacionController {

    // GET /api/v1/verificacion → {"estado":"ok"}
    @Operation(summary = "Comprobar que la API responde")
    @GetMapping("/api/v1/verificacion")
    public Map<String, String> verificar() {
        return Map.of("estado", "ok");
    }
}