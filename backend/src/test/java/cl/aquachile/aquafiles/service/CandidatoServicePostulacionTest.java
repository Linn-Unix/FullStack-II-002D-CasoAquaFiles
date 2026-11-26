package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import cl.aquachile.aquafiles.dto.PostulacionRequest;
import cl.aquachile.aquafiles.dto.PostulacionResponse;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.entity.Oferta;
import cl.aquachile.aquafiles.exception.RecursoNoEncontradoException;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.CandidatoRepository;
import cl.aquachile.aquafiles.repository.EvaluacionRepository;
import cl.aquachile.aquafiles.repository.OfertaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CandidatoServicePostulacionTest {

    @Mock
    private CandidatoRepository candidatoRepository;

    @Mock
    private EvaluacionRepository evaluacionRepository;

    @Mock
    private OfertaRepository ofertaRepository;

    private CandidatoService candidatoService;

    @BeforeEach
    void setUp() {
        candidatoService = new CandidatoService(candidatoRepository, evaluacionRepository, ofertaRepository);
    }

    @Test
    void registraPostulacionEnRevision() {
        when(candidatoRepository.existsByRut("15.678.432-K")).thenReturn(false);
        when(candidatoRepository.save(any(Candidato.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));

        PostulacionResponse respuesta = candidatoService.registrarPostulacion(
                solicitud("15.678.432-K"));

        assertEquals(EstadoCandidato.REVISION, respuesta.estado());
        assertEquals("En revisión técnica", respuesta.estadoGeneral());
        verify(candidatoRepository).save(any(Candidato.class));
    }

    @Test
    void rechazaRutDuplicado() {
        when(candidatoRepository.existsByRut("15.678.432-K")).thenReturn(true);

        assertThrows(ReglaNegocioException.class,
                () -> candidatoService.registrarPostulacion(solicitud("15.678.432-K")));
        verify(candidatoRepository, never()).save(any(Candidato.class));
    }

    @Test
    void ligaLaPostulacionALaOfertaPublicada() {
        Oferta oferta = new Oferta();
        oferta.setCargo("Técnico Acuícola");
        oferta.setFamilia("Operaciones");
        oferta.setUbicacion("Castro");
        when(ofertaRepository.findByIdAndPublicadaTrue(7L)).thenReturn(Optional.of(oferta));
        when(candidatoRepository.existsByRut("15.678.432-K")).thenReturn(false);
        when(candidatoRepository.save(any(Candidato.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));

        PostulacionResponse respuesta = candidatoService.registrarPostulacion(
                solicitud("15.678.432-K", 7L));

        assertEquals("Técnico Acuícola", respuesta.cargo());
        assertEquals("Castro", respuesta.ubicacion());
    }

    @Test
    void rechazaPostularAUnaOfertaNoPublicada() {
        when(ofertaRepository.findByIdAndPublicadaTrue(9L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class,
                () -> candidatoService.registrarPostulacion(solicitud("15.678.432-K", 9L)));
        verify(candidatoRepository, never()).save(any(Candidato.class));
    }

    private PostulacionRequest solicitud(String rut) {
        return solicitud(rut, null);
    }

    private PostulacionRequest solicitud(String rut, Long ofertaId) {
        return new PostulacionRequest(
                "Ana Postulante",
                rut,
                "ana@ejemplo.cl",
                "+56 9 1234 5678",
                "Operaria de planta",
                "Operaciones",
                "Puerto Montt",
                "Cultivo y engorda",
                ofertaId);
    }
}
