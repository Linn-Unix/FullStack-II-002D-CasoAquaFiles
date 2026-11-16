package cl.aquachile.aquafiles.util;

public final class RutUtil {

    private RutUtil() {
    }

    public static String limpiar(String rut) {
        return rut == null ? "" : rut.replaceAll("[.\\-\\s]", "").toUpperCase();
    }

    public static boolean esValido(String rut) {
        String valor = limpiar(rut);
        if (!valor.matches("\\d{7,8}[0-9K]")) {
            return false;
        }

        String cuerpo = valor.substring(0, valor.length() - 1);
        char digitoIngresado = valor.charAt(valor.length() - 1);
        int suma = 0;
        int multiplicador = 2;

        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += Character.getNumericValue(cuerpo.charAt(i)) * multiplicador;
            multiplicador = multiplicador == 7 ? 2 : multiplicador + 1;
        }

        int resultado = 11 - (suma % 11);
        char digitoEsperado = resultado == 11
                ? '0'
                : resultado == 10 ? 'K' : Character.forDigit(resultado, 10);
        return digitoIngresado == digitoEsperado;
    }

    public static String formatear(String rut) {
        String valor = limpiar(rut);
        if (!esValido(valor)) {
            throw new IllegalArgumentException("El RUT no es válido.");
        }

        String cuerpo = valor.substring(0, valor.length() - 1);
        char digito = valor.charAt(valor.length() - 1);
        StringBuilder conPuntos = new StringBuilder();
        int contador = 0;

        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            conPuntos.insert(0, cuerpo.charAt(i));
            contador++;
            if (contador % 3 == 0 && i > 0) {
                conPuntos.insert(0, '.');
            }
        }
        return conPuntos + "-" + digito;
    }
}
