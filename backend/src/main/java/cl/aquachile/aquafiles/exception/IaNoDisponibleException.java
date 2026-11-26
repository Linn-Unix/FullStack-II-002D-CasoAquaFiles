package cl.aquachile.aquafiles.exception;

// 503: la IA no está configurada o Grok no respondió bien. El resto del sistema sigue funcionando.
public class IaNoDisponibleException extends RuntimeException {
    public IaNoDisponibleException(String mensaje) {
        super(mensaje);
    }

    public IaNoDisponibleException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
