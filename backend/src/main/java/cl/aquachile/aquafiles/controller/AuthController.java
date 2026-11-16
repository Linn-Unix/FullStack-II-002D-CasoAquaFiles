package cl.aquachile.aquafiles.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.aquafiles.dto.LoginRequest;
import cl.aquachile.aquafiles.dto.LoginResponse;
import cl.aquachile.aquafiles.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación", description = "Inicio de sesión y renovación del token JWT")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /api/v1/auth/login → {"token":"...","usuario":"analista","nombre":"...","rol":"ANALISTA"}
    @Operation(summary = "Iniciar sesión con usuario y contraseña")
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest datos) {
        return authService.login(datos);
    }

    // POST /api/v1/auth/renovar (con el token actual en Authorization)
    // "autenticacion" la llenó JwtFiltro; getName() es el usuario que venía en el token.
    @Operation(summary = "Renovar el token antes de que venza")
    @PostMapping("/renovar")
    public LoginResponse renovar(Authentication autenticacion) {
        return authService.renovar(autenticacion.getName());
    }
}