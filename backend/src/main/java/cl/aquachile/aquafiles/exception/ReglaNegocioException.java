package cl.aquachile.aquafiles.exception;

// 409: la petición está bien escrita, pero rompe una regla del proceso.
public class ReglaNegocioException extends RuntimeException {
    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}