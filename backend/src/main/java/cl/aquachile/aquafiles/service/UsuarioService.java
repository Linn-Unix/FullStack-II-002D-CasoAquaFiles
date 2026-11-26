package cl.aquachile.aquafiles.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.aquachile.aquafiles.entity.Rol;
import cl.aquachile.aquafiles.entity.Usuario;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. Busca ignorando mayúsculas y espacios ("  Analista " → "analista").
    public Optional<Usuario> buscarPorUsuario(String usuario) {
        return usuarioRepository.findByUsuario(normalizar(usuario));
    }

    // 2. Crea un usuario guardando la clave CIFRADA, nunca la original.
    @Transactional
    public Usuario crear(String usuario, String nombre, String claveSinCifrar, Rol rol) {
        String nombreUsuario = normalizar(usuario);
        if (usuarioRepository.existsByUsuario(nombreUsuario)) {
            throw new ReglaNegocioException("El usuario " + nombreUsuario + " ya existe.");
        }
        String claveCifrada = passwordEncoder.encode(claveSinCifrar);
        return usuarioRepository.save(new Usuario(nombreUsuario, nombre, claveCifrada, rol));
    }

    // 3. BCrypt compara la clave escrita con la cifrada (sin "descifrarla"). Lo usa el login.
    public boolean claveCorrecta(Usuario usuario, String claveEscrita) {
        return passwordEncoder.matches(claveEscrita, usuario.getClave());
    }

    // 4. Nombres de los evaluadores activos (para el responsable de la derivación).
    public List<String> nombresDeEvaluadores() {
        return usuarioRepository.findByRolAndActivoTrueOrderByNombre(Rol.EVALUADOR)
                .stream()
                .map(Usuario::getNombre)
                .toList();
    }

    private String normalizar(String usuario) {
        return usuario == null ? "" : usuario.trim().toLowerCase();
    }
}