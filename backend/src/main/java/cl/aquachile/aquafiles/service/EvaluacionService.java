package cl.aquachile.aquafiles.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import cl.aquachile.aquafiles.dto.EvaluacionRequest;
import cl.aquachile.aquafiles.dto.EvaluacionResponse;
import cl.aquachile.aquafiles.entity.Archivo;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.CategoriaArchivo;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.entity.Evaluacion;
import cl.aquachile.aquafiles.exception.RecursoNoEncontradoException;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.EvaluacionRepository;

@Service
@Transactional(readOnly = true)
public class EvaluacionService {

    private final EvaluacionRepository evaluacionRepository;
    private final CandidatoService candidatoService;
    private final ArchivoService archivoService;

    public EvaluacionService(EvaluacionRepository evaluacionRepository, CandidatoService candidatoService,
                             ArchivoService archivoService) {
        this.evaluacionRepository = evaluacionRepository;
        this.candidatoService = candidatoService;
        this.archivoService = archivoService;
    }

    // 1. Candidatos derivados (y los que ya avanzaron), los más nuevos primero.
    public List<EvaluacionResponse> listar() {
        return evaluacionRepository.findAllByOrderByFechaCreacionDesc()
                .stream()
                .map(EvaluacionResponse::desde)
                .toList();
    }

    public EvaluacionResponse obtener(Long id) {
        return EvaluacionResponse.desde(buscarEntidad(id));
    }

    // 2. Guarda fecha, resultado y observaciones.
    @Transactional
    public EvaluacionResponse actualizar(Long id, EvaluacionRequest datos) {
        Evaluacion evaluacion = buscarEntidad(id);
        Candidato candidato = evaluacion.getCandidato();

        if (candidato.getEstado() == EstadoCandidato.FINALIZADO) {
            throw new ReglaNegocioException("El proceso ya está finalizado y la evaluación no se puede modificar.");
        }
        if (datos.fechaEntrevista() == null && candidato.getEstado() == EstadoCandidato.AGENDADO) {
            throw new ReglaNegocioException("La entrevista ya está agendada. Elige una nueva fecha en vez de borrarla.");
        }

        evaluacion.setFechaEntrevista(datos.fechaEntrevista());
        evaluacion.setResultado(vacioANull(datos.resultado()));
        evaluacion.setObservaciones(vacioANull(datos.observaciones()));

        // 2.1- Si hay fecha, el candidato queda AGENDADO (o se reagenda).
        if (datos.fechaEntrevista() != null && candidato.getEstado() != EstadoCandidato.AGENDADO) {
            candidatoService.cambiarEstado(candidato.getId(), EstadoCandidato.AGENDADO);
        }
        return EvaluacionResponse.desde(evaluacion);
    }

    // 3. Sube el informe y cierra el proceso.
    @Transactional
    public EvaluacionResponse subirInforme(Long id, MultipartFile archivo) {
        Evaluacion evaluacion = buscarEntidad(id);
        Candidato candidato = evaluacion.getCandidato();

        if (candidato.getEstado() != EstadoCandidato.AGENDADO) {
            throw new ReglaNegocioException("Primero agenda la entrevista. El informe se sube después de entrevistar al candidato.");
        }
        if (evaluacion.getResultado() == null) {
            throw new ReglaNegocioException("Guarda el resultado de la evaluación antes de subir el informe.");
        }

        Archivo informe = archivoService.guardarEntidad(candidato, archivo, CategoriaArchivo.INFORME);
        evaluacion.setInforme(informe);
        candidatoService.cambiarEstado(candidato.getId(), EstadoCandidato.FINALIZADO);
        return EvaluacionResponse.desde(evaluacion);
    }

    private Evaluacion buscarEntidad(Long id) {
        return evaluacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la evaluación con id " + id + "."));
    }

    private String vacioANull(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}