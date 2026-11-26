package cl.aquachile.aquafiles.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

// Quita datos personales de un texto antes de enviarlo a un servicio externo (Groq).
// Así la IA recibe la experiencia y la formación, pero no quién es la persona.
public final class Anonimizador {

    private static final Pattern RUT = Pattern.compile("\\b\\d{1,2}\\.?\\d{3}\\.?\\d{3}-?[\\dkK]\\b");
    private static final Pattern CORREO = Pattern.compile("[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+");
    private static final Pattern TELEFONO = Pattern.compile("(\\+?56[\\s-]?)?\\b9[\\s-]?\\d{4}[\\s-]?\\d{4}\\b");

    private Anonimizador() {
    }

    // 1. Reemplaza RUT, correos, teléfonos y cada palabra del nombre de la persona.
    public static String anonimizar(String texto, String nombre) {
        if (texto == null || texto.isBlank()) {
            return "";
        }
        String limpio = CORREO.matcher(texto).replaceAll("[correo]");
        limpio = RUT.matcher(limpio).replaceAll("[rut]");
        limpio = TELEFONO.matcher(limpio).replaceAll("[teléfono]");
        if (nombre != null) {
            for (String parte : nombre.trim().split("\\s+")) {
                if (parte.length() > 2) {
                    limpio = Pattern.compile("(?iu)(?<![\\p{L}])" + patronSinTildes(parte) + "(?![\\p{L}])")
                            .matcher(limpio).replaceAll("[nombre]");
                }
            }
        }
        return limpio;
    }

    // Arma una expresión que acepta la palabra con o sin tildes: "Tomás" también encuentra "Tomas" y "TOMAS".
    private static String patronSinTildes(String palabra) {
        String base = Normalizer.normalize(palabra, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase();
        StringBuilder patron = new StringBuilder();
        for (char letra : base.toCharArray()) {
            patron.append(switch (letra) {
                case 'a' -> "[aáàä]";
                case 'e' -> "[eéèë]";
                case 'i' -> "[iíìï]";
                case 'o' -> "[oóòö]";
                case 'u' -> "[uúùü]";
                case 'n' -> "[nñ]";
                default -> Pattern.quote(String.valueOf(letra));
            });
        }
        return patron.toString();
    }

    // 2. Corta textos muy largos para no enviar más de lo necesario.
    public static String recortar(String texto, int maximo) {
        if (texto == null) {
            return "";
        }
        String compacto = texto.replaceAll("\\s+", " ").trim();
        return compacto.length() <= maximo ? compacto : compacto.substring(0, maximo) + " …";
    }
}
