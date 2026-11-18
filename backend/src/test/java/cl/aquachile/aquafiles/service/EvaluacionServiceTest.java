package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import cl.aquachile.aquafiles.dto.EvaluacionRequest;
import cl.aquachile.aquafiles.dto.EvaluacionResponse;
import cl.aquachile.aquafiles.entity.Archivo;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.CategoriaArchivo;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.entity.Evaluacion;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.EvaluacionRepository;

@ExtendWith(MockitoExtension.class)
class EvaluacionServiceTest {

    @Mock
    private EvaluacionRepository evaluacionRepository;

    @Mock
    private CandidatoService candidatoService;

    @Mock
    private ArchivoService archivoService;

    private EvaluacionService evaluacionService;

    @BeforeEach
    void setUp() {
        evaluacionService = new EvaluacionService(evaluacionRepository, candidatoService, archivoService);
    }

    @Test
    void actualizarAgregaFechaYResultado() {
        Candidato candidato = candidato(EstadoCandidato.DERIVADO);
        Evaluacion evaluacion = new Evaluacion(candidato);
        when(evaluacionRepository.findById(4L)).thenReturn(Optional.of(evaluacion));

        EvaluacionResponse respuesta = evaluacionService.actualizar(4L, new EvaluacionRequest(
                LocalDate.of(2026, 12, 10),
                "Recomendable",
                "Buen desempeño."));

        assertEquals(LocalDate.of(2026, 12, 10), respuesta.fechaEntrevista());
        assertEquals("Recomendable", respuesta.resultado());
        assertEquals("Buen desempeño.", respuesta.observaciones());
        verify(candidatoService).cambiarEstado(null, EstadoCandidato.AGENDADO);
    }

    @Test
    void subirInformeExigeResultadoGuardado() {
        Candidato candidato = candidato(EstadoCandidato.AGENDADO);
        Evaluacion evaluacion = new Evaluacion(candidato);
        when(evaluacionRepository.findById(5L)).thenReturn(Optional.of(evaluacion));
        MockMultipartFile informe = new MockMultipartFile(
                "archivo", "informe.pdf", "application/pdf", "contenido".getBytes());

        assertThrows(ReglaNegocioException.class,
                () -> evaluacionService.subirInforme(5L, informe));
    }

    @Test
    void subirInformeCierraElProcesoCuandoElResultadoExiste() {
        Candidato candidato = candidato(EstadoCandidato.AGENDADO);
        Evaluacion evaluacion = new Evaluacion(candidato);
        evaluacion.setResultado("Recomendable");
        when(evaluacionRepository.findById(6L)).thenReturn(Optional.of(evaluacion));

        Archivo archivo = new Archivo();
        archivo.setNombreOriginal("informe.pdf");
        MockMultipartFile informe = new MockMultipartFile(
                "archivo", "informe.pdf", "application/pdf", "contenido".getBytes());
        when(archivoService.guardarEntidad(eq(candidato),
                any(MultipartFile.class), eq(CategoriaArchivo.INFORME))).thenReturn(archivo);

        EvaluacionResponse respuesta = evaluacionService.subirInforme(6L, informe);

        assertEquals("informe.pdf", respuesta.nombreInforme());
        verify(candidatoService).cambiarEstado(null, EstadoCandidato.FINALIZADO);
    }

    private Candidato candidato(EstadoCandidato estado) {
        Candidato candidato = new Candidato();
        candidato.setNombre("Pedro Soto");
        candidato.setRut("12.345.678-5");
        candidato.setCorreo("pedro@correo.cl");
        candidato.setTelefono("+56 9 1234 5678");
        candidato.setCargo("Técnico");
        candidato.setFamilia("Operaciones");
        candidato.setUbicacion("Hangares");
        candidato.setCentroCosto("Mantención");
        candidato.setEstado(estado);
        candidato.setFechaSolicitud(LocalDate.of(2026, 11, 1));
        return candidato;
    }
}
