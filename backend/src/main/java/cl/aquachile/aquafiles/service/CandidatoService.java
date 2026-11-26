package cl.aquachile.aquafiles.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.aquachile.aquafiles.dto.CandidatoRequest;
import cl.aquachile.aquafiles.dto.CandidatoResponse;
import cl.aquachile.aquafiles.dto.PostulacionRequest;
import cl.aquachile.aquafiles.dto.PostulacionResponse;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.entity.Evaluacion;
import cl.aquachile.aquafiles.entity.Oferta;
import cl.aquachile.aquafiles.repository.EvaluacionRepository;
import cl.aquachile.aquafiles.exception.DatoInvalidoException;
import cl.aquachile.aquafiles.exception.RecursoNoEncontradoException;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.CandidatoRepository;
import cl.aquachile.aquafiles.repository.OfertaRepository;
import cl.aquachile.aquafiles.util.RutUtil;

@Service
@Transactional(readOnly = true)
public class CandidatoService {

    private final CandidatoRepository candidatoRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final OfertaRepository ofertaRepository;

    public CandidatoService(CandidatoRepository candidatoRepository,
                            EvaluacionRepository evaluacionRepository,
                            OfertaRepository ofertaRepository) {
        this.candidatoRepository = candidatoRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.ofertaRepository = ofertaRepository;
    }

    public List<CandidatoResponse> listar(String busqueda, EstadoCandidato estado,
                                          String familia, String ubicacion, String centroCosto) {
        String texto = limpiarFiltro(busqueda).toLowerCase();
        String rut = RutUtil.limpiar(texto);
        if (rut.isEmpty()) {
            rut = "#";
        }
        List<EstadoCandidato> estados = estado == null
                ? List.of(EstadoCandidato.values())
                : List.of(estado);

        return candidatoRepository.buscar(texto, rut, estados,
                        limpiarFiltro(familia), limpiarFiltro(ubicacion), limpiarFiltro(centroCosto))
                .stream()
                .map(CandidatoResponse::desde)
                .toList();
    }

    public PostulacionResponse consultarPorRut(String rut) {
        if (!RutUtil.esValido(rut)) {
            throw new DatoInvalidoException("Ingresa un RUT válido. Ej: 12.345.678-5");
        }
        Candidato candidato = candidatoRepository.findByRut(RutUtil.formatear(rut))
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No encontramos una postulación con ese RUT."));
        LocalDate fechaEntrevista = null;
        if (candidato.getEstado() == EstadoCandidato.AGENDADO) {
            fechaEntrevista = evaluacionRepository.findByCandidatoId(candidato.getId())
                    .map(Evaluacion::getFechaEntrevista)
                    .orElse(null);
        }
        return PostulacionResponse.desde(candidato, fechaEntrevista);
    }

    public CandidatoResponse obtener(Long id) {
        return CandidatoResponse.desde(buscarEntidad(id));
    }

    @Transactional
    public CandidatoResponse crear(CandidatoRequest datos) {
        return CandidatoResponse.desde(crearEntidad(datos));
    }

    @Transactional
    public PostulacionResponse registrarPostulacion(PostulacionRequest datos) {
        // Si postula a una oferta, debe estar publicada. El cargo, la familia y la ubicación
        // se toman de la oferta para que la postulación quede coherente con ella.
        Oferta oferta = null;
        if (datos.ofertaId() != null) {
            oferta = ofertaRepository.findByIdAndPublicadaTrue(datos.ofertaId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "La oferta " + datos.ofertaId() + " no existe o ya no está publicada."));
        }

        Candidato candidato = crearEntidad(datos.comoCandidato());
        if (oferta != null) {
            candidato.setOferta(oferta);
            candidato.setCargo(oferta.getCargo());
            candidato.setFamilia(oferta.getFamilia());
            candidato.setUbicacion(oferta.getUbicacion());
        }
        return PostulacionResponse.desde(candidato, null);
    }

    @Transactional
    public CandidatoResponse actualizar(Long id, CandidatoRequest datos) {
        Candidato candidato = buscarEntidad(id);
        String rut = validarRut(datos.rut());

        if (candidatoRepository.existsByRutAndIdNot(rut, id)) {
            throw new ReglaNegocioException("Ya existe otro candidato con el RUT " + rut + ".");
        }

        copiarDatos(datos, candidato, rut);
        return CandidatoResponse.desde(candidato);
    }

    @Transactional
    public CandidatoResponse cambiarEstado(Long id, EstadoCandidato nuevoEstado) {
        Candidato candidato = buscarEntidad(id);
        EstadoCandidato estadoActual = candidato.getEstado();

        if (!transicionPermitida(estadoActual, nuevoEstado)) {
            throw new ReglaNegocioException(
                    "No se puede cambiar el estado de " + estadoActual.getEtiqueta()
                            + " a " + nuevoEstado.getEtiqueta() + ".");
        }

        candidato.setEstado(nuevoEstado);
        if (nuevoEstado == EstadoCandidato.DERIVADO) {
            candidato.setFechaDerivacion(LocalDate.now());
            if (!evaluacionRepository.existsByCandidatoId(candidato.getId())) {
                evaluacionRepository.save(new Evaluacion(candidato));
            }
        } else if (nuevoEstado == EstadoCandidato.FINALIZADO) {
            candidato.setFechaFinalizacion(LocalDate.now());
        }
        return CandidatoResponse.desde(candidato);
    }

    // Derivar exige indicar el profesional responsable.
    @Transactional
    public CandidatoResponse derivar(Long id, String responsable) {
        if (responsable == null || responsable.isBlank()) {
            throw new DatoInvalidoException("Selecciona el profesional responsable.");
        }
        cambiarEstado(id, EstadoCandidato.DERIVADO);
        Candidato candidato = buscarEntidad(id);
        candidato.setResponsable(responsable.trim());
        return CandidatoResponse.desde(candidato);
    }

    public Candidato buscarEntidad(Long id) {
        return candidatoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el candidato con id " + id + "."));
    }

    @Transactional
    public Candidato crearEntidad(CandidatoRequest datos) {
        String rut = validarRut(datos.rut());
        if (candidatoRepository.existsByRut(rut)) {
            throw new ReglaNegocioException("Ya existe una postulación con el RUT " + rut + ".");
        }

        Candidato candidato = new Candidato();
        copiarDatos(datos, candidato, rut);
        candidato.setEstado(EstadoCandidato.REVISION);
        candidato.setFechaSolicitud(LocalDate.now());
        return candidatoRepository.save(candidato);
    }

    private String validarRut(String rut) {
        if (!RutUtil.esValido(rut)) {
            throw new DatoInvalidoException(
                    "El RUT " + rut + " no es válido. Ej: 12.345.678-5");
        }
        return RutUtil.formatear(rut);
    }

    private void copiarDatos(CandidatoRequest datos, Candidato candidato, String rut) {
        candidato.setNombre(datos.nombre().trim());
        candidato.setRut(rut);
        candidato.setCorreo(datos.correo().trim().toLowerCase());
        candidato.setTelefono(datos.telefono().trim());
        candidato.setCargo(datos.cargo().trim());
        candidato.setFamilia(datos.familia().trim());
        candidato.setUbicacion(datos.ubicacion().trim());
        candidato.setCentroCosto(datos.centroCosto().trim());
        candidato.setResponsable(normalizarOpcional(datos.responsable()));
        candidato.setObservaciones(normalizarOpcional(datos.observaciones()));
    }

    private String normalizarOpcional(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private boolean transicionPermitida(EstadoCandidato actual, EstadoCandidato nuevo) {
        return switch (actual) {
            case REVISION -> nuevo == EstadoCandidato.APROBADO
                    || nuevo == EstadoCandidato.RECHAZADO;
            case APROBADO -> nuevo == EstadoCandidato.DERIVADO;
            case DERIVADO -> nuevo == EstadoCandidato.AGENDADO;
            case AGENDADO -> nuevo == EstadoCandidato.FINALIZADO;
            case RECHAZADO, FINALIZADO -> false;
        };
    }

    private String limpiarFiltro(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
