import { afterEach, describe, expect, it, vi } from 'vitest'
import { ROLES } from '../data/roles'
import { iniciarSesionApi } from './authService'
import { leerSesion } from './sesion'

function simularRespuesta(status, cuerpo) {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: status < 400,
    status,
    text: async () => JSON.stringify(cuerpo),
  })))
}

describe('authService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('guarda la sesión y traduce el rol del backend', async () => {
    simularRespuesta(200, { token: 'abc', usuario: 'analista', nombre: 'Rosa Martínez', rol: 'ANALISTA' })
    const sesion = await iniciarSesionApi('analista', 'aqua123')

    expect(sesion.rol).toBe(ROLES.SUPERVISOR)
    expect(leerSesion().token).toBe('abc')
  })

  it('muestra el mensaje del backend si la clave es incorrecta', async () => {
    simularRespuesta(401, { mensaje: 'Usuario o contraseña incorrectos.' })

    await expect(iniciarSesionApi('analista', '1234')).rejects.toThrow('Usuario o contraseña incorrectos.')
  })
})
