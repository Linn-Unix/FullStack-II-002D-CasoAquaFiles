package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import cl.aquachile.aquafiles.dto.CandidatoResponse;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.CandidatoRepository;

@ExtendWith(MockitoExtension.class)
class CandidatoServiceEstadosTest {

    @Mock
    private CandidatoRepository candidatoRepository;

    private CandidatoService candidatoService;

    @BeforeEach
    void setUp() {
        candidatoService = new CandidatoService(candidatoRepository);
    }

    @Test
    void derivaUnCandidatoAprobadoYRegistraLaFecha() {
        Candidato candidato = candidato(EstadoCandidato.APROBADO);
        when(candidatoRepository.findById(1L)).thenReturn(Optional.of(candidato));

        CandidatoResponse respuesta = candidatoService.cambiarEstado(1L, EstadoCandidato.DERIVADO);

        assertEquals(EstadoCandidato.DERIVADO, respuesta.estado());
        assertEquals(LocalDate.now(), candidato.getFechaDerivacion());
        verify(candidatoRepository).findById(1L);
    }

    @Test
    void finalizaUnCandidatoAgendadoYRegistraLaFecha() {
        Candidato candidato = candidato(EstadoCandidato.AGENDADO);
        when(candidatoRepository.findById(1L)).thenReturn(Optional.of(candidato));

        CandidatoResponse respuesta = candidatoService.cambiarEstado(1L, EstadoCandidato.FINALIZADO);

        assertEquals(EstadoCandidato.FINALIZADO, respuesta.estado());
        assertEquals(LocalDate.now(), candidato.getFechaFinalizacion());
    }

    @Test
    void rechazaUnaTransicionQueNoCorresponde() {
        Candidato candidato = candidato(EstadoCandidato.REVISION);
        when(candidatoRepository.findById(1L)).thenReturn(Optional.of(candidato));

        assertThrows(ReglaNegocioException.class,
                () -> candidatoService.cambiarEstado(1L, EstadoCandidato.FINALIZADO));
        assertEquals(EstadoCandidato.REVISION, candidato.getEstado());
    }

    private Candidato candidato(EstadoCandidato estado) {
        Candidato candidato = new Candidato();
        candidato.setEstado(estado);
        candidato.setFechaSolicitud(LocalDate.now());
        return candidato;
    }
}
