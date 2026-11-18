package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import cl.aquachile.aquafiles.dto.LoginRequest;
import cl.aquachile.aquafiles.dto.LoginResponse;
import cl.aquachile.aquafiles.entity.Rol;
import cl.aquachile.aquafiles.entity.Usuario;
import cl.aquachile.aquafiles.exception.CredencialesInvalidasException;
import cl.aquachile.aquafiles.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(usuarioService, jwtService);
    }

    @Test
    void loginValidoDevuelveTokenYDatosDelUsuario() {
        Usuario usuario = new Usuario("analista", "Rosa Martínez", "hash", Rol.ANALISTA);
        when(usuarioService.buscarPorUsuario("analista")).thenReturn(Optional.of(usuario));
        when(usuarioService.claveCorrecta(usuario, "aqua123")).thenReturn(true);
        when(jwtService.generarToken(usuario)).thenReturn("token-prueba");

        LoginResponse respuesta = authService.login(
                new LoginRequest("analista", "aqua123"));

        assertEquals("token-prueba", respuesta.token());
        assertEquals("analista", respuesta.usuario());
        assertEquals("Rosa Martínez", respuesta.nombre());
        assertEquals(Rol.ANALISTA, respuesta.rol());
        verify(jwtService).generarToken(usuario);
    }

    @Test
    void loginInvalidoRechazaCredenciales() {
        Usuario usuario = new Usuario("analista", "Rosa Martínez", "hash", Rol.ANALISTA);
        when(usuarioService.buscarPorUsuario("analista")).thenReturn(Optional.of(usuario));
        when(usuarioService.claveCorrecta(usuario, "incorrecta")).thenReturn(false);

        assertThrows(CredencialesInvalidasException.class,
                () -> authService.login(new LoginRequest("analista", "incorrecta")));
    }

    @Test
    void renovarRechazaUsuarioInactivo() {
        Usuario usuario = new Usuario("evaluador", "Luis Herrera", "hash", Rol.EVALUADOR);
        usuario.setActivo(false);
        when(usuarioService.buscarPorUsuario("evaluador")).thenReturn(Optional.of(usuario));

        assertThrows(CredencialesInvalidasException.class,
                () -> authService.renovar("evaluador"));
    }
}
