package cl.aquachile.aquafiles.service;

import org.springframework.stereotype.Service;

import cl.aquachile.aquafiles.dto.LoginRequest;
import cl.aquachile.aquafiles.dto.LoginResponse;
import cl.aquachile.aquafiles.entity.Usuario;
import cl.aquachile.aquafiles.exception.CredencialesInvalidasException;
import cl.aquachile.aquafiles.security.JwtService;

@Service
public class AuthService {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    public AuthService(UsuarioService usuarioService, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    // 1. Login: el usuario existe, está activo y la clave calza. Si algo falla → 401.
    public LoginResponse login(LoginRequest datos) {
        Usuario usuario = usuarioService.buscarPorUsuario(datos.usuario())
                .filter(Usuario::isActivo)
                .filter(encontrado -> usuarioService.claveCorrecta(encontrado, datos.clave()))
                .orElseThrow(CredencialesInvalidasException::new);
        return respuesta(usuario);
    }

    // 2. Renovación: llega con un token TODAVÍA válido y se le entrega uno nuevo.
    //    Volvemos a buscar al usuario por si lo desactivaron mientras tanto.
    public LoginResponse renovar(String nombreUsuario) {
        Usuario usuario = usuarioService.buscarPorUsuario(nombreUsuario)
                .filter(Usuario::isActivo)
                .orElseThrow(CredencialesInvalidasException::new);
        return respuesta(usuario);
    }

    private LoginResponse respuesta(Usuario usuario) {
        String token = jwtService.generarToken(usuario);
        return new LoginResponse(token, usuario.getUsuario(), usuario.getNombre(), usuario.getRol());
    }
}