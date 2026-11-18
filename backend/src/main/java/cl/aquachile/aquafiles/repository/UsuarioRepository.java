package cl.aquachile.aquafiles.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.aquachile.aquafiles.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsuario(String usuario);

    boolean existsByUsuario(String usuario);
}