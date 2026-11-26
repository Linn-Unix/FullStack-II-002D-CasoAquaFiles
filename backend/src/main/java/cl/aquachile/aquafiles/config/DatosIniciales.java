package cl.aquachile.aquafiles.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

import cl.aquachile.aquafiles.entity.Modalidad;
import cl.aquachile.aquafiles.entity.Oferta;
import cl.aquachile.aquafiles.entity.Rol;
import cl.aquachile.aquafiles.repository.OfertaRepository;
import cl.aquachile.aquafiles.service.UsuarioService;

// run() se ejecuta UNA vez, cuando el backend termina de encender.
// Solo se activa si app.usuarios-prueba.crear = true (en producción se puede apagar).
@Component
@ConditionalOnProperty(name = "app.usuarios-prueba.crear", havingValue = "true", matchIfMissing = true)
public class DatosIniciales implements CommandLineRunner {

    private final UsuarioService usuarioService;
    private final OfertaRepository ofertaRepository;
    private final String clavePrueba;

    public DatosIniciales(UsuarioService usuarioService,
                          OfertaRepository ofertaRepository,
                          @Value("${app.usuarios-prueba.clave}") String clavePrueba) {
        this.usuarioService = usuarioService;
        this.ofertaRepository = ofertaRepository;
        this.clavePrueba = clavePrueba;
    }

    @Override
    public void run(String... args) {
        crearSiNoExiste("analista", "Rosa Martínez", Rol.ANALISTA);
        crearSiNoExiste("evaluador", "Luis Herrera", Rol.EVALUADOR);
        crearSiNoExiste("evaluadora", "Andrea Vidal", Rol.EVALUADOR);
        crearOfertasDeEjemplo();
    }

    // Ofertas ficticias para que el portal no parta vacío. Solo si no hay ninguna.
    private void crearOfertasDeEjemplo() {
        if (ofertaRepository.count() > 0) {
            return;
        }
        ofertaRepository.save(oferta("Técnico Acuícola", "Operaciones", "Puerto Montt", Modalidad.PRESENCIAL, 3,
                "Buscamos técnico para apoyar la operación diaria de centros de cultivo.",
                "Monitorear jaulas y parámetros del agua. Registrar alimentación. Apoyar cosechas.",
                "Título técnico en acuicultura o afín. Licencia de conducir clase B.",
                "Seguro complementario de salud, bono de producción y transporte.",
                850000, 1100000, true));
        ofertaRepository.save(oferta("Analista de Datos de Producción", "Producción", "Puerto Montt", Modalidad.HIBRIDA, 1,
                "Analizar indicadores productivos y apoyar la toma de decisiones.",
                "Construir reportes semanales. Mantener tableros de control. Validar datos de terreno.",
                "Ingeniería en información o afín. Manejo de Excel avanzado y SQL.",
                "Trabajo híbrido 3x2, seguro complementario y capacitaciones.",
                1400000, 1800000, true));
        ofertaRepository.save(oferta("Asistente de Reclutamiento", "Personas", "Chiloé", Modalidad.REMOTA, 1,
                "Apoyar al equipo de Personas en la selección de nuevos colaboradores.",
                "Revisar postulaciones. Coordinar entrevistas. Mantener al día el registro de candidatos.",
                "Técnico o profesional en recursos humanos. Manejo de planillas.",
                "Trabajo remoto, seguro complementario y día libre de cumpleaños.",
                750000, 950000, false));
    }

    private Oferta oferta(String cargo, String familia, String ubicacion, Modalidad modalidad, int cupos,
                          String descripcion, String funciones, String requisitos, String beneficios,
                          int sueldoMinimo, int sueldoMaximo, boolean publicada) {
        Oferta oferta = new Oferta();
        oferta.setCargo(cargo);
        oferta.setFamilia(familia);
        oferta.setUbicacion(ubicacion);
        oferta.setModalidad(modalidad);
        oferta.setCupos(cupos);
        oferta.setDescripcion(descripcion);
        oferta.setFunciones(funciones);
        oferta.setRequisitos(requisitos);
        oferta.setBeneficios(beneficios);
        oferta.setSueldoMinimo(sueldoMinimo);
        oferta.setSueldoMaximo(sueldoMaximo);
        oferta.setPublicada(publicada);
        oferta.setFechaPublicacion(publicada ? LocalDate.now() : null);
        return oferta;
    }

    // Si ya existe, no hace nada: así no se duplica cada vez que enciendo el backend.
    private void crearSiNoExiste(String usuario, String nombre, Rol rol) {
        if (usuarioService.buscarPorUsuario(usuario).isEmpty()) {
            usuarioService.crear(usuario, nombre, clavePrueba, rol);
        }
    }
}