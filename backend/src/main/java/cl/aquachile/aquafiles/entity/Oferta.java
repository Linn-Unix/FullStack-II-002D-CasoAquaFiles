package cl.aquachile.aquafiles.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Oferta laboral. Solo las publicadas se ven en el portal público.
@Entity
@Table(name = "ofertas")
public class Oferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String cargo;

    // Categoría / familia de cargo (ej. Operaciones, Mantención).
    @Column(nullable = false, length = 60)
    private String familia;

    @Column(nullable = false, length = 60)
    private String ubicacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Modalidad modalidad;

    @Column(nullable = false)
    private Integer cupos;

    @Column(nullable = false, length = 2000)
    private String descripcion;

    @Column(nullable = false, length = 2000)
    private String funciones;

    @Column(nullable = false, length = 2000)
    private String requisitos;

    @Column(nullable = false, length = 2000)
    private String beneficios;

    @Column(name = "sueldo_minimo", nullable = false)
    private Integer sueldoMinimo;

    @Column(name = "sueldo_maximo", nullable = false)
    private Integer sueldoMaximo;

    @Column(nullable = false)
    private boolean publicada;

    // Se completa la primera vez que la oferta se publica.
    @Column(name = "fecha_publicacion")
    private LocalDate fechaPublicacion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    public Oferta() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }
    public String getFamilia() { return familia; }
    public void setFamilia(String familia) { this.familia = familia; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public Modalidad getModalidad() { return modalidad; }
    public void setModalidad(Modalidad modalidad) { this.modalidad = modalidad; }
    public Integer getCupos() { return cupos; }
    public void setCupos(Integer cupos) { this.cupos = cupos; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getFunciones() { return funciones; }
    public void setFunciones(String funciones) { this.funciones = funciones; }
    public String getRequisitos() { return requisitos; }
    public void setRequisitos(String requisitos) { this.requisitos = requisitos; }
    public String getBeneficios() { return beneficios; }
    public void setBeneficios(String beneficios) { this.beneficios = beneficios; }
    public Integer getSueldoMinimo() { return sueldoMinimo; }
    public void setSueldoMinimo(Integer sueldoMinimo) { this.sueldoMinimo = sueldoMinimo; }
    public Integer getSueldoMaximo() { return sueldoMaximo; }
    public void setSueldoMaximo(Integer sueldoMaximo) { this.sueldoMaximo = sueldoMaximo; }
    public boolean isPublicada() { return publicada; }
    public void setPublicada(boolean publicada) { this.publicada = publicada; }
    public LocalDate getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(LocalDate fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}
