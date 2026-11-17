import { borrarSesion, leerSesion } from './sesion'

const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

const MENSAJES_HTTP = {
  401: 'Tu sesión expiró. Inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró lo que buscabas.',
}

export async function pedir(ruta, { metodo = 'GET', cuerpo } = {}) {
  const cabeceras = {}
  const sesion = leerSesion()

  if (sesion?.token) cabeceras.Authorization = `Bearer ${sesion.token}`

  let body
  if (cuerpo instanceof FormData) {
    body = cuerpo
  } else if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json'
    body = JSON.stringify(cuerpo)
  }

  let respuesta
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, { method: metodo, headers: cabeceras, body })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que el backend esté encendido.')
  }

  if (respuesta.status === 401 && sesion?.token) borrarSesion()

  const texto = await respuesta.text()
  let datos = null
  try {
    datos = texto ? JSON.parse(texto) : null
  } catch {
    datos = null
  }

  if (!respuesta.ok) {
    const detalle = datos?.campos ? Object.values(datos.campos).join(' ') : ''
    const mensaje = datos?.mensaje ?? MENSAJES_HTTP[respuesta.status] ?? 'Ocurrió un error inesperado.'
    throw new Error([mensaje, detalle].filter(Boolean).join(' '))
  }

  return datos
}
