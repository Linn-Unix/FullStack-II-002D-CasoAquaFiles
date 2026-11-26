package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import cl.aquachile.aquafiles.dto.OfertaRequest;
import cl.aquachile.aquafiles.dto.OfertaResponse;
import cl.aquachile.aquafiles.entity.Modalidad;
import cl.aquachile.aquafiles.entity.Oferta;
import cl.aquachile.aquafiles.exception.DatoInvalidoException;
import cl.aquachile.aquafiles.exception.RecursoNoEncontradoException;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
import cl.aquachile.aquafiles.repository.CandidatoRepository;
import cl.aquachile.aquafiles.repository.OfertaRepository;

@ExtendWith(MockitoExtension.class)
class OfertaServiceTest {

    @Mock
    private OfertaRepository ofertaRepository;

    @Mock
    private CandidatoRepository candidatoRepository;

    private OfertaService ofertaService;

    @BeforeEach
    void setUp() {
        ofertaService = new OfertaService(ofertaRepository, candidatoRepository);
    }

    @Test
    void creaLaOfertaSinPublicar() {
        when(ofertaRepository.save(any(Oferta.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        OfertaResponse respuesta = ofertaService.crear(datos(800000, 1000000));

        assertEquals("Técnico Acuícola", respuesta.cargo());
        assertEquals("Híbrida", respuesta.modalidadEtiqueta());
        assertFalse(respuesta.publicada());
    }

    @Test
    void rechazaSueldoMaximoMenorQueElMinimo() {
        assertThrows(DatoInvalidoException.class, () -> ofertaService.crear(datos(900000, 500000)));
        verify(ofertaRepository, never()).save(any(Oferta.class));
    }

    @Test
    void publicarGuardaLaFechaSoloLaPrimeraVez() {
        Oferta oferta = new Oferta();
        oferta.setModalidad(Modalidad.PRESENCIAL);
        when(ofertaRepository.findById(1L)).thenReturn(Optional.of(oferta));

        OfertaResponse publicada = ofertaService.publicar(1L);
        assertTrue(publicada.publicada());
        assertEquals(LocalDate.now(), publicada.fechaPublicacion());

        oferta.setFechaPublicacion(LocalDate.of(2026, 1, 10));
        ofertaService.despublicar(1L);
        OfertaResponse otraVez = ofertaService.publicar(1L);
        assertEquals(LocalDate.of(2026, 1, 10), otraVez.fechaPublicacion());
    }

    @Test
    void despublicarSacaLaOfertaDelPortal() {
        Oferta oferta = new Oferta();
        oferta.setModalidad(Modalidad.REMOTA);
        oferta.setPublicada(true);
        when(ofertaRepository.findById(2L)).thenReturn(Optional.of(oferta));

        assertFalse(ofertaService.despublicar(2L).publicada());
    }

    @Test
    void actualizaLosDatosDeLaOferta() {
        Oferta oferta = new Oferta();
        when(ofertaRepository.findById(3L)).thenReturn(Optional.of(oferta));

        OfertaResponse respuesta = ofertaService.actualizar(3L, datos(700000, 900000));

        assertEquals(700000, respuesta.sueldoMinimo());
        assertEquals(2, respuesta.cupos());
    }

    @Test
    void noEliminaUnaOfertaConPostulaciones() {
        when(ofertaRepository.findById(4L)).thenReturn(Optional.of(new Oferta()));
        when(candidatoRepository.existsByOfertaId(4L)).thenReturn(true);

        assertThrows(ReglaNegocioException.class, () -> ofertaService.eliminar(4L));
        verify(ofertaRepository, never()).delete(any(Oferta.class));
    }

    @Test
    void eliminaUnaOfertaSinPostulaciones() {
        Oferta oferta = new Oferta();
        when(ofertaRepository.findById(5L)).thenReturn(Optional.of(oferta));
        when(candidatoRepository.existsByOfertaId(5L)).thenReturn(false);

        ofertaService.eliminar(5L);

        verify(ofertaRepository).delete(oferta);
    }

    @Test
    void elPortalNoMuestraOfertasSinPublicar() {
        when(ofertaRepository.findByIdAndPublicadaTrue(6L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> ofertaService.obtenerPublicada(6L));
    }

    @Test
    void elPortalBuscaConLosFiltrosLimpios() {
        when(ofertaRepository.buscarPublicadas("técnico", "Operaciones", null)).thenReturn(List.of());

        assertTrue(ofertaService.listarPublicadas("  Técnico ", " Operaciones ", null).isEmpty());
    }

    private OfertaRequest datos(int minimo, int maximo) {
        return new OfertaRequest("Técnico Acuícola", "Operaciones", "Puerto Montt", Modalidad.HIBRIDA, 2,
                "Apoyo en centros de cultivo.", "Monitorear jaulas.", "Título técnico.",
                "Seguro complementario.", minimo, maximo);
    }
}
