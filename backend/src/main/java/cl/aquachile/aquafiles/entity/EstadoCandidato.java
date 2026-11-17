package cl.aquachile.aquafiles.entity;

public enum EstadoCandidato {
    REVISION("En revisión técnica"),
    APROBADO("Aprobado técnicamente"),
    RECHAZADO("Rechazado técnicamente"),
    DERIVADO("Derivado a psicólogo"),
    AGENDADO("Agendado"),
    FINALIZADO("Proceso Finalizado");

    private final String etiqueta;

    EstadoCandidato(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public EstadoCandidato estadoParaPostulante() {
        return switch (this) {
            case REVISION, APROBADO, DERIVADO -> REVISION;
            default -> this;
        };
    }

    public String etiquetaParaPostulante() {
        return switch (estadoParaPostulante()) {
            case AGENDADO -> "Agendado";
            case FINALIZADO -> "Proceso finalizado";
            case RECHAZADO -> "Proceso cerrado";
            default -> "En revisión técnica";
        };
    }
}
