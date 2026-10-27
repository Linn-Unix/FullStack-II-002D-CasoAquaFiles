import { ESTADOS } from '../data/candidatos'

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

// 2. Filtra la lista de candidatos según el texto buscado, el estado y el centro de costos.
//    centroCosto tiene un valor por defecto (''), así que se puede omitir.
export function filtrarCandidatos(candidatos, busqueda, estado, centroCosto = '') {
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

    // ¿No hay centro seleccionado o el centro coincide?
    const centroOk = centroCosto === '' || candidato.centroCosto === centroCosto

    return textoOk && estadoOk && centroOk
  })
}

// 3. Cuenta cuántos candidatos tienen un estado. Se usa en los indicadores.
export function contarPorEstado(candidatos, estado) {
  return candidatos.filter((candidato) => candidato.estado === estado).length
}

// 4. Clase de color (definida en App.css) para cada estado del proceso.
const COLORES_ESTADO = {
  [ESTADOS.REVISION]: 'estado-revision',
  [ESTADOS.APROBADO]: 'estado-aprobado',
  [ESTADOS.RECHAZADO]: 'estado-rechazado',
  [ESTADOS.DERIVADO]: 'estado-derivado',
  [ESTADOS.AGENDADO]: 'estado-agendado',
  [ESTADOS.FINALIZADO]: 'estado-finalizado',
}

// Devuelve la clase de color según el estado. Si no existe, usa un color neutro.
export function obtenerColorEstado(estado) {
  return COLORES_ESTADO[estado] ?? 'estado-neutro'
}

// 5. Estado que ve el postulante. Oculta las decisiones internas de RR. HH. y del psicólogo:
//    "Aprobado técnicamente" y "Derivado a psicólogo" se muestran como "En revisión técnica".
const ESTADOS_POSTULANTE = {
  [ESTADOS.REVISION]: 'En revisión técnica',
  [ESTADOS.APROBADO]: 'En revisión técnica',
  [ESTADOS.DERIVADO]: 'En revisión técnica',
  [ESTADOS.AGENDADO]: 'Agendado',
  [ESTADOS.FINALIZADO]: 'Proceso finalizado',
  [ESTADOS.RECHAZADO]: 'Proceso cerrado',
}

export function obtenerEstadoPostulante(estado) {
  return ESTADOS_POSTULANTE[estado] ?? 'En revisión técnica'
}

// 6. Convierte una fecha "2026-10-28" al formato chileno "28-10-2026".
export function formatearFecha(fecha) {
  return fecha.split('-').reverse().join('-')
}
