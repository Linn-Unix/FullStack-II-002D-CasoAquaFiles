package cl.aquachile.aquafiles.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // MySQL genera el id (AUTO_INCREMENT)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String usuario;

    @Column(nullable = false, length = 120)
    private String nombre;

    // Clave cifrada con BCrypt (se ve como "$2a$10$...").
    @Column(nullable = false, length = 100)
    private String clave;

    // EnumType.STRING guarda el texto "ANALISTA" y no un número.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol;

    @Column(nullable = false)
    private boolean activo = true;

    // JPA necesita un constructor vacío para armar el objeto al leer de la base.
    protected Usuario() {
    }

    public Usuario(String usuario, String nombre, String clave, Rol rol) {
        this.usuario = usuario;
        this.nombre = nombre;
        this.clave = clave;
        this.rol = rol;
    }

    public Long getId() { return id; }
    public String getUsuario() { return usuario; }
    public String getNombre() { return nombre; }
    public String getClave() { return clave; }
    public Rol getRol() { return rol; }
    public boolean isActivo() { return activo; }

    public void setActivo(boolean activo) { this.activo = activo; }
}