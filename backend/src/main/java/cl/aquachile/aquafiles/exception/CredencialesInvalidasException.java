package cl.aquachile.aquafiles.exception;

// 401: usuario o clave incorrectos. El mensaje es el mismo en los dos casos
// para no darle pistas a alguien que esté probando usuarios.
public class CredencialesInvalidasException extends RuntimeException {
    public CredencialesInvalidasException() {
        super("Usuario o contraseña incorrectos.");
    }
}