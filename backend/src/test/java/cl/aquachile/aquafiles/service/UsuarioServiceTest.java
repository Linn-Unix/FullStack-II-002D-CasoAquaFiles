package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import cl.aquachile.aquafiles.entity.Rol;
import cl.aquachile.aquafiles.entity.Usuario;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioService(usuarioRepository, new BCryptPasswordEncoder());
    }

    @Test
    void creaElUsuarioConLaClaveCifrada() {
        when(usuarioRepository.existsByUsuario("analista")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario usuario = usuarioService.crear("  Analista ", "Rosa Martínez", "aqua123", Rol.ANALISTA);

        assertEquals("analista", usuario.getUsuario());
        assertTrue(usuario.getClave().startsWith("$2"));
        assertTrue(usuarioService.claveCorrecta(usuario, "aqua123"));
    }

    @Test
    void noCreaUsuariosRepetidos() {
        when(usuarioRepository.existsByUsuario("analista")).thenReturn(true);

        assertThrows(ReglaNegocioException.class,
                () -> usuarioService.crear("analista", "Otra", "clave", Rol.ANALISTA));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void listaLosNombresDeLosEvaluadores() {
        when(usuarioRepository.findByRolAndActivoTrueOrderByNombre(Rol.EVALUADOR)).thenReturn(List.of(
                new Usuario("evaluadora", "Andrea Vidal", "x", Rol.EVALUADOR),
                new Usuario("evaluador", "Luis Herrera", "x", Rol.EVALUADOR)));

        assertEquals(List.of("Andrea Vidal", "Luis Herrera"), usuarioService.nombresDeEvaluadores());
    }
}
