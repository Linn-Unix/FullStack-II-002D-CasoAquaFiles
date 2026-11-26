import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AgendarGoogleCalendar from './AgendarGoogleCalendar'

const candidato = { nombre: 'Tomás Fuentes', correo: 'tomas@correo.cl', cargo: 'Técnico Acuícola', fechaEntrevista: '2099-12-01' }

describe('AgendarGoogleCalendar', () => {
  it('avisa si Google Calendar no está configurado', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')
    render(<AgendarGoogleCalendar candidato={candidato} />)
    expect(screen.getByText(/no está configurado/i)).toBeInTheDocument()
  })

  it('crea el evento y muestra los enlaces de Calendar y Meet', async () => {
    const usuario = userEvent.setup()
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'id-de-prueba')
    window.google = { accounts: { oauth2: { initTokenClient: (config) => ({ requestAccessToken: () => config.callback({ access_token: 't' }) }) } } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ htmlLink: 'https://calendar/evento', hangoutLink: 'https://meet/abc' }) }))
    render(<AgendarGoogleCalendar candidato={candidato} />)

    expect(screen.getByLabelText(/fecha y hora/i)).toHaveValue('2099-12-01T10:00')
    expect(screen.getByText(/invitación a tomas@correo.cl/i)).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: /crear evento/i }))

    expect(await screen.findByRole('status')).toHaveTextContent('Entrevista creada en Google Calendar.')
    expect(screen.getByRole('link', { name: /entrar a google meet/i })).toHaveAttribute('href', 'https://meet/abc')
    delete window.google
  })

  it('muestra el error si Google no está disponible', async () => {
    const usuario = userEvent.setup()
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'id-de-prueba')
    render(<AgendarGoogleCalendar candidato={candidato} />)

    await usuario.click(screen.getByRole('button', { name: /crear evento/i }))
    expect(await screen.findByRole('status')).toHaveTextContent(/no se cargó google/i)
  })
})
