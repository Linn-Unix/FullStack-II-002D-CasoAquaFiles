import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { guardarSesion } from '../services/sesion'
import { simularApi } from '../test/simularApi'
import ApoyoIa from './ApoyoIa'

const sugerencia = {
  candidatoId: 5, puntaje: 82, resumen: 'Perfil técnico adecuado.', fortalezas: ['4 años en centros de cultivo'],
  brechas: ['No indica licencia de conducir'], preguntas: ['¿Qué parámetros del agua monitoreaba?'],
  criterios: ['Cumple el título técnico'], cvAnalizado: false, modelo: 'grok-3-mini',
  advertencia: 'Sugerencia generada por IA (Grok). Es orientativa.',
}

describe('ApoyoIa', () => {
  it('no aparece sin sesión', () => {
    const { container } = render(<ApoyoIa candidatoId={5} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra la sugerencia con criterios, preguntas y la advertencia de revisión humana', async () => {
    const usuario = userEvent.setup()
    guardarSesion({ token: 'token-de-prueba', rol: 'supervisor' })
    const fetchFalso = simularApi({ 'POST /ia/candidatos/5/analisis': { cuerpo: sugerencia } })
    render(<ApoyoIa candidatoId={5} />)

    expect(screen.getByText(/sin nombre, rut, correo ni teléfono/i)).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: /analizar cv con ia/i }))

    expect(await screen.findByText('82/100')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: /puntuación orientativa/i })).toHaveAttribute('aria-valuenow', '82')
    expect(screen.getByText('¿Qué parámetros del agua monitoreaba?')).toBeInTheDocument()
    expect(screen.getByText('Cumple el título técnico')).toBeInTheDocument()
    expect(screen.getByText(/revisión humana obligatoria/i)).toBeInTheDocument()
    expect(screen.getByText(/no se pudo leer el cv/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /volver a analizar/i })).toBeInTheDocument()
    expect(fetchFalso.mock.calls[0][1].method).toBe('POST')
  })

  it('muestra el aviso si la IA no está configurada', async () => {
    const usuario = userEvent.setup()
    guardarSesion({ token: 'token-de-prueba', rol: 'supervisor' })
    simularApi({ 'POST /ia/candidatos/5/analisis': { status: 503, cuerpo: { mensaje: 'El apoyo de IA no está configurado (falta GROK_API_KEY en el backend).' } } })
    render(<ApoyoIa candidatoId={5} />)

    await usuario.click(screen.getByRole('button', { name: /analizar cv con ia/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/GROK_API_KEY/)
  })
})
