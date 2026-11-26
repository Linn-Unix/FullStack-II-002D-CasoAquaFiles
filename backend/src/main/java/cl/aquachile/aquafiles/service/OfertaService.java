package cl.aquachile.aquafiles.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.aquachile.aquafiles.dto.OfertaRequest;
import cl.aquachile.aquafiles.dto.OfertaResponse;
import cl.aquachile.aquafiles.entity.Modalidad;
import cl.aquachile.aquafiles.entity.Oferta;
import cl.aquachile.aquafiles.exception.DatoInvalidoException;
import cl.aquachile.aquafiles.exception.RecursoNoEncontradoException;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.CandidatoRepository;
import cl.aquachile.aquafiles.repository.OfertaRepository;

@Service
@Transactional(readOnly = true)
public class OfertaService {

    private final OfertaRepository ofertaRepository;
    private final CandidatoRepository candidatoRepository;

    public OfertaService(OfertaRepository ofertaRepository, CandidatoRepository candidatoRepository) {
        this.ofertaRepository = ofertaRepository;
        this.candidatoRepository = candidatoRepository;
    }

    // 1. Panel del analista: todas las ofertas, publicadas o no.
    public List<OfertaResponse> listarTodas() {
        return ofertaRepository.findAllByOrderByFechaCreacionDescIdDesc()
                .stream()
                .map(OfertaResponse::desde)
                .toList();
    }

    public OfertaResponse obtener(Long id) {
        return OfertaResponse.desde(buscarEntidad(id));
    }

    @Transactional
    public OfertaResponse crear(OfertaRequest datos) {
        Oferta oferta = new Oferta();
        copiarDatos(datos, oferta);
        return OfertaResponse.desde(ofertaRepository.save(oferta));
    }

    @Transactional
    public OfertaResponse actualizar(Long id, OfertaRequest datos) {
        Oferta oferta = buscarEntidad(id);
        copiarDatos(datos, oferta);
        return OfertaResponse.desde(oferta);
    }

    // 2. Publicar: la oferta aparece en el portal. La fecha se guarda la primera vez.
    @Transactional
    public OfertaResponse publicar(Long id) {
        Oferta oferta = buscarEntidad(id);
        oferta.setPublicada(true);
        if (oferta.getFechaPublicacion() == null) {
            oferta.setFechaPublicacion(LocalDate.now());
        }
        return OfertaResponse.desde(oferta);
    }

    @Transactional
    public OfertaResponse despublicar(Long id) {
        Oferta oferta = buscarEntidad(id);
        oferta.setPublicada(false);
        return OfertaResponse.desde(oferta);
    }

    // 3. Solo se elimina si nadie ha postulado. Si hay postulaciones, se despublica.
    @Transactional
    public void eliminar(Long id) {
        Oferta oferta = buscarEntidad(id);
        if (candidatoRepository.existsByOfertaId(id)) {
            throw new ReglaNegocioException(
                    "La oferta tiene postulaciones. Despublícala en vez de eliminarla.");
        }
        ofertaRepository.delete(oferta);
    }

    // 4. Portal público (sin sesión).
    public List<OfertaResponse> listarPublicadas(String busqueda, String familia, Modalidad modalidad) {
        return ofertaRepository.buscarPublicadas(
                        limpiar(busqueda).toLowerCase(), limpiar(familia), modalidad)
                .stream()
                .map(OfertaResponse::desde)
                .toList();
    }

    public OfertaResponse obtenerPublicada(Long id) {
        return OfertaResponse.desde(buscarPublicada(id));
    }

    // La usa la postulación: solo se puede postular a una oferta publicada.
    public Oferta buscarPublicada(Long id) {
        return ofertaRepository.findByIdAndPublicadaTrue(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "La oferta " + id + " no existe o ya no está publicada."));
    }

    public Oferta buscarEntidad(Long id) {
        return ofertaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la oferta con id " + id + "."));
    }

    private void copiarDatos(OfertaRequest datos, Oferta oferta) {
        if (datos.sueldoMaximo() < datos.sueldoMinimo()) {
            throw new DatoInvalidoException("El sueldo máximo no puede ser menor que el mínimo.");
        }
        oferta.setCargo(datos.cargo().trim());
        oferta.setFamilia(datos.familia().trim());
        oferta.setUbicacion(datos.ubicacion().trim());
        oferta.setModalidad(datos.modalidad());
        oferta.setCupos(datos.cupos());
        oferta.setDescripcion(datos.descripcion().trim());
        oferta.setFunciones(datos.funciones().trim());
        oferta.setRequisitos(datos.requisitos().trim());
        oferta.setBeneficios(datos.beneficios().trim());
        oferta.setSueldoMinimo(datos.sueldoMinimo());
        oferta.setSueldoMaximo(datos.sueldoMaximo());
    }

    private String limpiar(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
