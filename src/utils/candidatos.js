// 1. Obtiene las iniciales de un nombre. Ej: "Valentina Ríos" → "VR"
export function obtenerIniciales(nombre) {
  return nombre
    .split(' ') // separa el nombre en palabras
    .filter(Boolean) // elimina espacios vacíos
    .map((palabra) => palabra[0]) // toma la primera letra de cada palabra
    .join('') // une las letras
    .slice(0, 2) // deja solo las dos primeras
    .toUpperCase()
}

// 2. Filtra la lista de candidatos según el texto buscado y el estado seleccionado.
export function filtrarCandidatos(candidatos, busqueda, estado) {
  // Pasamos la búsqueda a minúsculas para que no importen las mayúsculas.
  const texto = busqueda.trim().toLowerCase()

  // 2.1- filter() recorre la lista y crea un nuevo arreglo con los que cumplen la condición.
  return candidatos.filter((candidato) => {
    // Juntamos los datos en los que se puede buscar.
    const datos = `${candidato.nombre} ${candidato.rut} ${candidato.cargo} ${candidato.ubicacion}`.toLowerCase()

    // ¿El candidato contiene el texto buscado?
    const textoOk = datos.includes(texto)

    // ¿No hay estado seleccionado ("") o el estado coincide?
    const estadoOk = estado === '' || candidato.estado === estado

    return textoOk && estadoOk
  })
}

// 3. Cuenta cuántos candidatos tienen un estado. Se usa en los indicadores.
<<<<<<< HEAD
export function countByStatus(candidates, status) {
  return candidates.filter((candidate) => candidate.status === status).length
}

export const obtenerIniciales = (nombre) => initials(nombre)

export function filtrarCandidatos(candidatos, busqueda, estado) {
  const texto = busqueda.trim().toLowerCase()

  return candidatos.filter((candidato) => {
    const buscable = `${candidato.nombre} ${candidato.rut} ${candidato.cargo} ${candidato.ubicacion}`.toLowerCase()
    return buscable.includes(texto) && (estado === '' || candidato.estado === estado)
  })
}

=======
>>>>>>> origin
export function contarPorEstado(candidatos, estado) {
  return candidatos.filter((candidato) => candidato.estado === estado).length
}