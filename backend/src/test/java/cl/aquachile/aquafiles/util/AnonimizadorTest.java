package cl.aquachile.aquafiles.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class AnonimizadorTest {

    @Test
    void quitaRutCorreoTelefonoYNombre() {
        String cv = "María José Ñúñez · RUT 17.345.678-6 · maria.nunez@correo.cl · +56 9 1234 5678\n"
                + "Técnica acuícola con 3 años en centros de cultivo. Referencias: María Ñúñez.";

        String limpio = Anonimizador.anonimizar(cv, "María José Ñúñez");

        assertFalse(limpio.contains("17.345.678-6"));
        assertFalse(limpio.contains("maria.nunez@correo.cl"));
        assertFalse(limpio.contains("1234 5678"));
        assertFalse(limpio.toLowerCase().contains("maría"));
        assertTrue(limpio.contains("[rut]") && limpio.contains("[correo]") && limpio.contains("[teléfono]"));
        assertTrue(limpio.contains("3 años en centros de cultivo"));
    }

    @Test
    void quitaElNombreAunqueEsteEscritoSinTildesOEnMayusculas() {
        String limpio = Anonimizador.anonimizar("TOMAS FUENTES. Referencia: Tomas. Tomasa no es el nombre.", "Tomás Fuentes");

        assertFalse(limpio.toLowerCase().contains("tomas "));
        assertFalse(limpio.contains("FUENTES"));
        assertTrue(limpio.startsWith("[nombre] [nombre]."));
        assertTrue(limpio.contains("Tomasa"));
    }

    @Test
    void manejaTextosVaciosYRecortaLosLargos() {
        assertEquals("", Anonimizador.anonimizar(null, "Ana"));
        assertEquals("", Anonimizador.anonimizar("  ", "Ana"));
        assertEquals("sin nombre", Anonimizador.anonimizar("sin nombre", null));
        assertEquals("", Anonimizador.recortar(null, 10));
        assertEquals("uno dos", Anonimizador.recortar("  uno \n dos ", 10));
        assertEquals("abcde …", Anonimizador.recortar("abcdefghij", 5));
    }
}
