package cl.aquachile.aquafiles.dto;

import cl.aquachile.aquafiles.entity.Rol;

// Lo que responde el backend. Nunca se devuelve la clave.
public record LoginResponse(String token, String usuario, String nombre, Rol rol) {
}