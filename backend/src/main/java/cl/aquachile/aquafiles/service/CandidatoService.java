package cl.aquachile.aquafiles.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.aquachile.aquafiles.dto.CandidatoRequest;
import cl.aquachile.aquafiles.dto.CandidatoResponse;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.exception.DatoInvalidoException;
import cl.aquachile.aquafiles.exception.RecursoNoEncontradoException;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.CandidatoRepository;
import cl.aquachile.aquafiles.util.RutUtil;

@Service
@Transactional(readOnly = true)
public class CandidatoService {

    private final CandidatoRepository candidatoRepository;

    public CandidatoService(CandidatoRepository candidatoRepository) {
        this.candidatoRepository = candidatoRepository;
    }

    public List<CandidatoResponse> listar() {
        return candidatoRepository.findAllByOrderByFechaSolicitudDescIdDesc()
                .stream()
                .map(CandidatoResponse::desde)
                .toList();
    }

    public CandidatoResponse obtener(Long id) {
        return CandidatoResponse.desde(buscarEntidad(id));
    }

    @Transactional
    public CandidatoResponse crear(CandidatoRequest datos) {
        return CandidatoResponse.desde(crearEntidad(datos));
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
}
