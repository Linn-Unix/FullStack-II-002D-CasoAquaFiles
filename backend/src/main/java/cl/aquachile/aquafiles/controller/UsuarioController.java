package cl.aquachile.aquafiles.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.aquafiles.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

// Solo ANALISTA: lo usa para elegir el responsable al derivar.
@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuarios", description = "Profesionales internos")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/evaluadores")
    @Operation(summary = "Nombres de los profesionales evaluadores activos")
    public List<String> evaluadores() {
        return usuarioService.nombresDeEvaluadores();
    }
}
