package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.aquachile.aquafiles.dto.PostulacionRequest;
import cl.aquachile.aquafiles.dto.PostulacionResponse;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.CandidatoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CandidatoServicePostulacionTest {

    @Mock
    private CandidatoRepository candidatoRepository;

    private CandidatoService candidatoService;

    @BeforeEach
    void setUp() {
        candidatoService = new CandidatoService(candidatoRepository);
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

    private PostulacionRequest solicitud(String rut) {
        return new PostulacionRequest(
                "Ana Postulante",
                rut,
                "ana@ejemplo.cl",
                "+56 9 1234 5678",
                "Operaria de planta",
                "Operaciones",
                "Puerto Montt",
                "Cultivo y engorda");
    }
}
