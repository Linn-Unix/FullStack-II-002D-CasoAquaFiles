package cl.aquachile.aquafiles.entity;

// Modalidad de trabajo de una oferta laboral.
public enum Modalidad {
    PRESENCIAL("Presencial"),
    HIBRIDA("Híbrida"),
    REMOTA("Remota");

    private final String etiqueta;

    Modalidad(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
