import { describe, expect, it, vi } from 'vitest'
import { pedir } from './api'
import { guardarSesion, leerSesion } from './sesion'
import { simularApi } from '../test/simularApi'

describe('pedir()', () => {
  it('manda el token guardado', async () => {
    guardarSesion({ token: 'abc' })
    const fetchFalso = simularApi({
      'GET /candidatos': { cuerpo: [] },
    })

    await pedir('/candidatos')

    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe('Bearer abc')
  })

  it('junta los mensajes de validación de cada campo', async () => {
    simularApi({
      'POST /candidatos': {
        status: 400,
        cuerpo: {
          mensaje: 'Hay datos inválidos en el formulario.',
          campos: { rut: 'El RUT es obligatorio.' },
        },
      },
    })

    await expect(pedir('/candidatos', {
      metodo: 'POST',
      cuerpo: {},
    })).rejects.toThrow('El RUT es obligatorio.')
  })

  it('borra la sesión si el token venció', async () => {
    guardarSesion({ token: 'vencido' })
    simularApi({
      'GET /candidatos': { status: 401 },
    })

    await expect(pedir('/candidatos')).rejects.toThrow('Tu sesión expiró')
    expect(leerSesion()).toBeNull()
  })

  it('avisa cuando el rol no tiene permiso', async () => {
    simularApi({
      'GET /dashboard/resumen': { status: 403 },
    })

    await expect(pedir('/dashboard/resumen')).rejects.toThrow('No tienes permiso')
  })

  it('avisa cuando no puede conectarse con el backend', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    }))

    await expect(pedir('/candidatos')).rejects.toThrow(/no se pudo conectar/i)
  })
})
