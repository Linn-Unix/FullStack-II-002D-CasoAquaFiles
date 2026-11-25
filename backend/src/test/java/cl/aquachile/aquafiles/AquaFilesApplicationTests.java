package cl.aquachile.aquafiles;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// @SpringBootTest: enciende el backend completo, igual que el ▶ verde, pero dentro de una prueba.
@SpringBootTest
@ActiveProfiles("test")
class AquaFilesApplicationTests {

    // Si la aplicación arranca sin errores, la prueba pasa.
    // Está vacía a propósito: lo que se prueba es que Spring logre encender todo.
    @Test
    void contextLoads() {
    }
}