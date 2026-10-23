// 1. Obtiene las iniciales de un nombre. Ej: "Valentina Ríos" → "VR"
export function initials(name) {
  return name
    .split(' ') // separa el nombre en palabras
    .filter(Boolean) // elimina espacios vacíos
    .map((word) => word[0]) // toma la primera letra de cada palabra
    .join('') // une las letras
    .slice(0, 2) // deja solo las dos primeras
    .toUpperCase()
}

// 2. Filtra la lista de candidatos según el texto buscado y el estado seleccionado.
export function filterCandidates(candidates, search, status) {
  // Pasamos la búsqueda a minúsculas para que no importen las mayúsculas.
  const text = search.trim().toLowerCase()

  // 2.1- filter() recorre la lista y crea un nuevo arreglo con los que cumplen la condición.
  return candidates.filter((candidate) => {
    // Juntamos los datos en los que se puede buscar.
    const searchable = `${candidate.name} ${candidate.rut} ${candidate.position} ${candidate.location}`.toLowerCase()

    // ¿El candidato contiene el texto buscado?
    const matchesText = searchable.includes(text)

    // ¿No hay estado seleccionado ("") o el estado coincide?
    const matchesStatus = status === '' || candidate.status === status

    return matchesText && matchesStatus
  })
}

// 3. Cuenta cuántos candidatos tienen un estado. Se usa en los indicadores.
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

export function contarPorEstado(candidatos, estado) {
  return candidatos.filter((candidato) => candidato.estado === estado).length
}