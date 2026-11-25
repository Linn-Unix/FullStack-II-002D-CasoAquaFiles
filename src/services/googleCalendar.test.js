import { afterEach, describe, expect, it, vi } from 'vitest'
import { armarEvento, crearEventoEntrevista, googleConfigurado } from './googleCalendar'

// Simula la biblioteca de Google: llama al callback con el token (o con un error).
function simularGoogle({ token = 'token-google', cancelar = false } = {}) {
  const requestAccessToken = vi.fn()
  const initTokenClient = vi.fn((config) => {
    requestAccessToken.mockImplementation(() => (cancelar ? config.error_callback() : config.callback({ access_token: token })))
    return { requestAccessToken }
  })
  window.google = { accounts: { oauth2: { initTokenClient } } }
  return initTokenClient
}

const manana = new Date(Date.now() + 24 * 60 * 60 * 1000)
const datos = { nombre: 'Tomás Fuentes', correo: 'tomas@correo.cl', cargo: 'Técnico Acuícola', inicio: manana }

afterEach(() => {
  delete window.google
})

describe('googleCalendar', () => {
  it('sabe si falta el Client ID', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')
    expect(googleConfigurado()).toBe(false)
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'id-de-prueba')
    expect(googleConfigurado()).toBe(true)
  })

  it('arma un evento de 30 minutos con Google Meet e invitado', () => {
    const evento = armarEvento(datos)
    expect(evento.summary).toBe('Entrevista psicolaboral - Tomás Fuentes')
    expect(new Date(evento.end.dateTime) - new Date(evento.start.dateTime)).toBe(30 * 60 * 1000)
    expect(evento.attendees).toEqual([{ email: 'tomas@correo.cl' }])
    expect(evento.conferenceData.createRequest.conferenceSolutionKey.type).toBe('hangoutsMeet')
    expect(armarEvento({ ...datos, correo: '' }).attendees).toEqual([])
  })

  it('crea el evento con el token que entrega Google', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'id-de-prueba')
    const initTokenClient = simularGoogle()
    const fetchFalso = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ htmlLink: 'https://calendar', hangoutLink: 'https://meet' }) })
    vi.stubGlobal('fetch', fetchFalso)

    const evento = await crearEventoEntrevista(datos)

    expect(evento.hangoutLink).toBe('https://meet')
    expect(initTokenClient.mock.calls[0][0]).toMatchObject({ client_id: 'id-de-prueba', scope: expect.stringContaining('calendar.events') })
    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe('Bearer token-google')
  })

  it('rechaza fechas pasadas, falta de Google, cancelación y errores de la API', async () => {
    await expect(crearEventoEntrevista({ ...datos, inicio: new Date('2020-01-01') })).rejects.toThrow(/fecha y hora futura/)
    await expect(crearEventoEntrevista(datos)).rejects.toThrow(/no se cargó google/i)

    simularGoogle({ cancelar: true })
    await expect(crearEventoEntrevista(datos)).rejects.toThrow(/cancelada/)

    simularGoogle({ token: '' })
    await expect(crearEventoEntrevista(datos)).rejects.toThrow(/denegado/)

    simularGoogle()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: { message: 'Calendario no encontrado' } }) }))
    await expect(crearEventoEntrevista(datos)).rejects.toThrow('Calendario no encontrado')
  })
})
