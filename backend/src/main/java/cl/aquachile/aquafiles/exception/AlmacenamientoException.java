package cl.aquachile.aquafiles.exception;

public class AlmacenamientoException extends RuntimeException {

    public AlmacenamientoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
