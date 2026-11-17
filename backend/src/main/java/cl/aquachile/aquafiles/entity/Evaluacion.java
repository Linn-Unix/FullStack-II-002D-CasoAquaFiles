package cl.aquachile.aquafiles.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "evaluaciones")
public class Evaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Una evaluación por candidato.
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidato_id", nullable = false, unique = true)
    private Candidato candidato;

    private LocalDate fechaEntrevista;

    // "Recomendable", "Recomendable con observaciones" o "No recomendable"
    @Column(length = 60)
    private String resultado;

    @Column(length = 2000)
    private String observaciones;

    // El informe es un Archivo de categoría INFORME (rama 9).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "informe_id")
    private Archivo informe;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    protected Evaluacion() {
    }

    public Evaluacion(Candidato candidato) {
        this.candidato = candidato;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Candidato getCandidato() { return candidato; }
    public LocalDate getFechaEntrevista() { return fechaEntrevista; }
    public void setFechaEntrevista(LocalDate fechaEntrevista) { this.fechaEntrevista = fechaEntrevista; }
    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    public Archivo getInforme() { return informe; }
    public void setInforme(Archivo informe) { this.informe = informe; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}