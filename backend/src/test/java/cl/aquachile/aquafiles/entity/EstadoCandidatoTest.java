package cl.aquachile.aquafiles.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class EstadoCandidatoTest {

    @Test
    void ocultaAprobacionInternaAlPostulante() {
        assertEquals(EstadoCandidato.REVISION,
                EstadoCandidato.APROBADO.estadoParaPostulante());
        assertEquals("En revisión técnica",
                EstadoCandidato.DERIVADO.etiquetaParaPostulante());
    }

    @Test
    void publicaEstadosFinalesSinDetallesInternos() {
        assertEquals("Proceso cerrado",
                EstadoCandidato.RECHAZADO.etiquetaParaPostulante());
        assertEquals("Proceso finalizado",
                EstadoCandidato.FINALIZADO.etiquetaParaPostulante());
    }
}
