package cl.aquachile.aquafiles.exception;

// 404: se busca algo que no existe (ej. el candidato 9999).
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}