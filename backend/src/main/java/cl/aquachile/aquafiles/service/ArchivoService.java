package cl.aquachile.aquafiles.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import cl.aquachile.aquafiles.dto.ArchivoResponse;
import cl.aquachile.aquafiles.entity.Archivo;
import cl.aquachile.aquafiles.entity.Candidato;
import cl.aquachile.aquafiles.entity.CategoriaArchivo;
import cl.aquachile.aquafiles.exception.AlmacenamientoException;
import cl.aquachile.aquafiles.exception.DatoInvalidoException;
import cl.aquachile.aquafiles.exception.RecursoNoEncontradoException;
import cl.aquachile.aquafiles.repository.ArchivoRepository;

@Service
@Transactional(readOnly = true)
public class ArchivoService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ArchivoService.class);
    private static final long TAMANO_MAXIMO = 5 * 1024 * 1024;
    private static final Set<String> EXTENSIONES_PERMITIDAS = Set.of("pdf", "doc", "docx");

    private final ArchivoRepository archivoRepository;
    private final CandidatoService candidatoService;
    private final Path directorio;

    public ArchivoService(ArchivoRepository archivoRepository,
                          CandidatoService candidatoService,
                          @Value("${app.archivos.directorio}") String directorio) {
        this.archivoRepository = archivoRepository;
        this.candidatoService = candidatoService;
        this.directorio = Path.of(directorio).toAbsolutePath().normalize();
    }

    @Transactional
    public ArchivoResponse guardarCv(Long candidatoId, MultipartFile archivo) {
        Candidato candidato = candidatoService.buscarEntidad(candidatoId);
        return ArchivoResponse.desde(guardarEntidad(candidato, archivo, CategoriaArchivo.CV));
    }

    @Transactional
    public Archivo guardarEntidad(Candidato candidato, MultipartFile archivo, CategoriaArchivo categoria) {
        validarArchivo(archivo);
        String extension = extensionDe(archivo.getOriginalFilename());
        String nombreAlmacenado = UUID.randomUUID() + "." + extension;
        Path destino = directorio.resolve(nombreAlmacenado).normalize();

        try {
            Files.createDirectories(directorio);
            try (InputStream contenido = archivo.getInputStream()) {
                Files.copy(contenido, destino, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException error) {
            throw new AlmacenamientoException("No se pudo guardar el archivo.", error);
        }

        Archivo entidad = new Archivo();
        entidad.setCandidato(candidato);
        entidad.setNombreOriginal(nombreSeguro(archivo.getOriginalFilename()));
        entidad.setNombreAlmacenado(nombreAlmacenado);
        entidad.setTipoContenido(tipoContenido(archivo.getContentType()));
        entidad.setExtension(extension);
        entidad.setTamano(archivo.getSize());
        entidad.setCategoria(categoria);
        entidad.setFechaCarga(LocalDateTime.now());

        try {
            return archivoRepository.save(entidad);
        } catch (RuntimeException error) {
            borrarFisico(destino);
            throw error;
        }
    }

    public List<ArchivoResponse> listar(Long candidatoId) {
        candidatoService.buscarEntidad(candidatoId);
        return archivoRepository.findByCandidatoIdOrderByFechaCargaDesc(candidatoId)
                .stream()
                .map(ArchivoResponse::desde)
                .toList();
    }

    public ArchivoDescarga descargar(Long archivoId) {
        Archivo archivo = buscarArchivo(archivoId);
        Path ruta = directorio.resolve(archivo.getNombreAlmacenado()).normalize();
        try {
            Resource recurso = new UrlResource(ruta.toUri());
            if (!recurso.exists() || !recurso.isReadable()) {
                throw new RecursoNoEncontradoException("El archivo solicitado no está disponible.");
            }
            return new ArchivoDescarga(recurso, archivo.getNombreOriginal(), archivo.getTipoContenido());
        } catch (IOException error) {
            throw new AlmacenamientoException("No se pudo leer el archivo.", error);
        }
    }

    @Transactional
    public void eliminar(Long archivoId) {
        Archivo archivo = buscarArchivo(archivoId);
        Path ruta = directorio.resolve(archivo.getNombreAlmacenado()).normalize();
        try {
            Files.deleteIfExists(ruta);
            archivoRepository.delete(archivo);
        } catch (IOException error) {
            throw new AlmacenamientoException("No se pudo eliminar el archivo.", error);
        }
    }

    private Archivo buscarArchivo(Long archivoId) {
        return archivoRepository.findById(archivoId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el archivo con id " + archivoId + "."));
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new DatoInvalidoException("Debes adjuntar un archivo.");
        }
        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new DatoInvalidoException("El archivo no puede pesar más de 5 MB.");
        }
        if (!EXTENSIONES_PERMITIDAS.contains(extensionDe(archivo.getOriginalFilename()))) {
            throw new DatoInvalidoException("El archivo debe ser PDF o Word (.pdf, .doc, .docx).");
        }
    }

    private String extensionDe(String nombre) {
        if (nombre == null || !nombre.contains(".")) {
            throw new DatoInvalidoException("El archivo debe tener una extensión válida.");
        }
        return nombre.substring(nombre.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private String nombreSeguro(String nombre) {
        return Path.of(nombre == null ? "archivo" : nombre).getFileName().toString();
    }

    private String tipoContenido(String tipo) {
        return tipo == null || tipo.isBlank() ? "application/octet-stream" : tipo;
    }

    private void borrarFisico(Path ruta) {
        try {
            Files.deleteIfExists(ruta);
        } catch (IOException error) {
            LOGGER.warn("No se pudo limpiar el archivo temporal {}", ruta, error);
        }
    }

    public record ArchivoDescarga(Resource recurso, String nombre, String tipoContenido) {
    }
}
