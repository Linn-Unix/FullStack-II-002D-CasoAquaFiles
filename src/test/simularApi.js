import { vi } from 'vitest'
import { candidatosIniciales, ESTADOS } from '../data/candidatos'

export function candidatoApi(candidato) {
  const estado = Object.keys(ESTADOS).find(
    (clave) => ESTADOS[clave] === candidato.estado,
  )

  return {
    ...candidato,
    estado,
  }
}

export const candidatosApi = candidatosIniciales.map(candidatoApi)

export function simularApi(rutas) {
  const fetchFalso = vi.fn(async (url, opciones = {}) => {
    const metodo = opciones.method ?? 'GET'
    const ruta = url.replace(/^.*\/api\/v1/, '').split('?')[0]
    const definida = rutas[`${metodo} ${ruta}`]

    if (!definida) {
      return {
        ok: false,
        status: 404,
        text: async () =>
          JSON.stringify({
            mensaje: `Ruta no simulada: ${metodo} ${ruta}`,
          }),
      }
    }

    const respuesta =
      typeof definida === 'function'
        ? definida(opciones, url)
        : definida

    const { status = 200, cuerpo } = respuesta

    return {
      ok: status < 400,
      status,
      text: async () =>
        cuerpo === undefined ? '' : JSON.stringify(cuerpo),
    }
  })

  vi.stubGlobal('fetch', fetchFalso)
  return fetchFalso
}

export function loginApi(usuario) {
  const datos = {
    analista: {
      nombre: 'Rosa Martínez',
      rol: 'ANALISTA',
    },
    evaluador: {
      nombre: 'Luis Herrera',
      rol: 'EVALUADOR',
    },
  }[usuario]

  return {
    cuerpo: {
      token: 'token-de-prueba',
      usuario,
      ...datos,
    },
  }
}
