import { pedir, pedirArchivo } from './api'

// Lista los archivos (CV e informe) de un candidato. Solo personal interno.
export function listarArchivos(candidatoId) {
  return pedir(`/candidatos/${candidatoId}/archivos`)
}

// Descarga el archivo y le pide al navegador que lo guarde con su nombre original.
export async function descargarArchivo(archivo) {
  const blob = await pedirArchivo(`/archivos/${archivo.id}/descargar`)
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = archivo.nombreOriginal
  enlace.click()
  URL.revokeObjectURL(url)
}
