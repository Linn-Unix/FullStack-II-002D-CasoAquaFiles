package cl.aquachile.aquafiles.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
import cl.aquachile.aquafiles.entity.Archivo;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.CategoriaArchivo;
import cl.aquachile.aquafiles.entity.EstadoCandidato;
import cl.aquachile.aquafiles.exception.DatoInvalidoException;
import cl.aquachile.aquafiles.exception.ReglaNegocioException;
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
        assertEquals("CV", respuesta.categoria());
        // El CV queda dentro de la carpeta del postulante.
        assertTrue(respuesta.carpeta().startsWith("tomas-fuentes-"));
        try (var carpetas = Files.list(directorio)) {
            Path carpeta = carpetas.findFirst().orElseThrow();
            assertEquals(respuesta.carpeta(), carpeta.getFileName().toString());
            try (var archivos = Files.list(carpeta)) {
                assertEquals(1, archivos.count());
            }
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

    @Test
    void noPermiteSubirUnSegundoCv() {
        when(candidatoService.buscarEntidad(7L)).thenReturn(candidato());
        when(archivoRepository.existsByCandidatoIdAndCategoria(7L, CategoriaArchivo.CV)).thenReturn(true);
        MockMultipartFile cv = new MockMultipartFile(
                "archivo", "otro.pdf", "application/pdf", "contenido".getBytes());

        assertThrows(ReglaNegocioException.class, () -> archivoService.guardarCv(7L, cv));
    }

    @Test
    void armaElNombreDeLaCarpetaSinTildesNiEspacios() {
        Candidato candidato = candidato();
        candidato.setNombre("  María José Ñúñez-Pérez ");
        assertTrue(ArchivoService.carpetaDe(candidato).matches("maria-jose-nunez-perez-[0-9a-f]{8}"));

        candidato.setNombre("!!!");
        assertTrue(ArchivoService.carpetaDe(candidato).startsWith("postulante-"));
    }

    @Test
    void descargaYEliminaElArchivoGuardado() throws Exception {
        Candidato candidato = candidato();
        when(candidatoService.buscarEntidad(7L)).thenReturn(candidato);
        org.mockito.ArgumentCaptor<Archivo> guardado = org.mockito.ArgumentCaptor.forClass(Archivo.class);
        when(archivoRepository.save(guardado.capture())).thenAnswer(invocacion -> invocacion.getArgument(0));
        archivoService.guardarCv(7L, new MockMultipartFile(
                "archivo", "cv.pdf", "application/pdf", "hola".getBytes()));
        when(archivoRepository.findById(1L)).thenReturn(java.util.Optional.of(guardado.getValue()));

        ArchivoService.ArchivoDescarga descarga = archivoService.descargar(1L);
        assertEquals("cv.pdf", descarga.nombre());
        assertEquals("hola", new String(descarga.recurso().getInputStream().readAllBytes()));

        archivoService.eliminar(1L);
        verify(archivoRepository).delete(guardado.getValue());
        assertTrue(Files.notExists(directorio.resolve(guardado.getValue().getNombreAlmacenado())));
    }

    private Candidato candidato() {
        Candidato candidato = new Candidato();
        candidato.setNombre("Tomás Fuentes");
        candidato.setEstado(EstadoCandidato.REVISION);
        return candidato;
    }
}
