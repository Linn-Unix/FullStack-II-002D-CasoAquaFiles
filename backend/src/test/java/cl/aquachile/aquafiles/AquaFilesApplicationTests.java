package cl.aquachile.aquafiles;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// @SpringBootTest: enciende el backend completo, igual que el ▶ verde, pero dentro de una prueba.
@SpringBootTest
class AquaFilesApplicationTests {

    // Si la aplicación arranca sin errores, la prueba pasa.
    // Está vacía a propósito: lo que se prueba es que Spring logre encender todo.
    @Test
    void contextLoads() {
    }
}