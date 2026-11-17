package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import cl.aquachile.aquafiles.dto.ArchivoResponse;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.exception.DatoInvalidoException;
import cl.aquachile.aquafiles.repository.ArchivoRepository;

@ExtendWith(MockitoExtension.class)
class ArchivoServiceTest {

    @Mock
    private ArchivoRepository archivoRepository;

    @Mock
    private CandidatoService candidatoService;

    private Path directorio;
    private ArchivoService archivoService;

    @BeforeEach
    void setUp() throws Exception {
        directorio = Files.createTempDirectory("aquafiles-test-");
        archivoService = new ArchivoService(archivoRepository, candidatoService, directorio.toString());
    }

    @AfterEach
    void tearDown() throws Exception {
        try (var archivos = Files.walk(directorio)) {
            archivos.sorted((a, b) -> b.compareTo(a)).forEach(ruta -> {
                try {
                    Files.deleteIfExists(ruta);
                } catch (Exception error) {
                    throw new IllegalStateException(error);
                }
            });
        }
    }

    @Test
    void guardaCvYDevuelveSusMetadatos() throws Exception {
        Candidato candidato = candidato();
        MockMultipartFile cv = new MockMultipartFile(
                "archivo", "curriculum.pdf", "application/pdf", "contenido".getBytes());
        when(candidatoService.buscarEntidad(7L)).thenReturn(candidato);
        when(archivoRepository.save(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocacion -> invocacion.getArgument(0));

        ArchivoResponse respuesta = archivoService.guardarCv(7L, cv);

        assertEquals("curriculum.pdf", respuesta.nombreOriginal());
        assertEquals("pdf", respuesta.extension());
        try (var archivos = Files.list(directorio)) {
            assertEquals(1, archivos.count());
        }
        verify(archivoRepository).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rechazaExtensionesNoPermitidas() {
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "curriculum.exe", "application/octet-stream", "contenido".getBytes());

        assertThrows(DatoInvalidoException.class, () -> archivoService.guardarCv(7L, archivo));
    }

    @Test
    void rechazaArchivosMayoresA5Mb() {
        byte[] contenido = new byte[5 * 1024 * 1024 + 1];
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "curriculum.pdf", "application/pdf", contenido);

        assertThrows(DatoInvalidoException.class, () -> archivoService.guardarCv(7L, archivo));
    }

    private Candidato candidato() {
        Candidato candidato = new Candidato();
        candidato.setEstado(EstadoCandidato.REVISION);
        return candidato;
    }
}
