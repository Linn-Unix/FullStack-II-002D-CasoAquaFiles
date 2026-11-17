package cl.aquachile.aquafiles.exception;

// 400: un dato que no se puede validar con anotaciones. Ej: RUT con dígito verificador malo.
public class DatoInvalidoException extends RuntimeException {
    public DatoInvalidoException(String mensaje) {
        super(mensaje);
    }
}