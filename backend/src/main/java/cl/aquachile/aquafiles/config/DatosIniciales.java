package cl.aquachile.aquafiles.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import cl.aquachile.aquafiles.entity.Rol;
import cl.aquachile.aquafiles.service.UsuarioService;

// run() se ejecuta UNA vez, cuando el backend termina de encender.
// Solo se activa si app.usuarios-prueba.crear = true (en producción se puede apagar).
@Component
@ConditionalOnProperty(name = "app.usuarios-prueba.crear", havingValue = "true", matchIfMissing = true)
public class DatosIniciales implements CommandLineRunner {

    private final UsuarioService usuarioService;
    private final String clavePrueba;

    public DatosIniciales(UsuarioService usuarioService,
                          @Value("${app.usuarios-prueba.clave}") String clavePrueba) {
        this.usuarioService = usuarioService;
        this.clavePrueba = clavePrueba;
    }

    @Override
    public void run(String... args) {
        crearSiNoExiste("analista", "Rosa Martínez", Rol.ANALISTA);
        crearSiNoExiste("evaluador", "Luis Herrera", Rol.EVALUADOR);
    }

    // Si ya existe, no hace nada: así no se duplica cada vez que enciendo el backend.
    private void crearSiNoExiste(String usuario, String nombre, Rol rol) {
        if (usuarioService.buscarPorUsuario(usuario).isEmpty()) {
            usuarioService.crear(usuario, nombre, clavePrueba, rol);
        }
    }
}