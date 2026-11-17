const CLAVE = 'aquafiles_sesion'

export function guardarSesion(sesion) {
  localStorage.setItem(CLAVE, JSON.stringify(sesion))
}

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE))
  } catch {
    return null
  }
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE)
}
