package cl.aquachile.aquafiles.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class RutUtilTest {

    @Test
    void validaRutConFormatoYMinuscula() {
        assertTrue(RutUtil.esValido("15.678.432-k"));
        assertEquals("15.678.432-K", RutUtil.formatear("15678432-k"));
    }

    @Test
    void rechazaRutConDigitoVerificadorIncorrecto() {
        assertFalse(RutUtil.esValido("15.678.432-1"));
    }

    @Test
    void rechazaRutConFormatoInvalido() {
        assertFalse(RutUtil.esValido("123"));
        assertFalse(RutUtil.esValido(null));
    }
}
