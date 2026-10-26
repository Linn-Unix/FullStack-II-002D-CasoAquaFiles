import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { candidatosIniciales } from '../data/candidatos'
import ConsultaPostulacion from './ConsultaPostulacion'

describe('ConsultaPostulacion', () => {
  it('avisa si el RUT no es válido', async () => {
    const usuario = userEvent.setup()
    const alEncontrar = vi.fn()
    render(<ConsultaPostulacion candidatos={candidatosIniciales} alEncontrar={alEncontrar} />)

    await usuario.type(screen.getByLabelText(/rut de tu postulación/i), '12.345.678-9')
    await usuario.click(screen.getByRole('button', { name: /consultar/i }))

    expect(screen.getByText(/ingresa un rut válido/i)).toBeInTheDocument()
    expect(alEncontrar).not.toHaveBeenCalled()
  })

  it('avisa si no existe una postulación con ese RUT', async () => {
    const usuario = userEvent.setup()
    render(<ConsultaPostulacion candidatos={candidatosIniciales} alEncontrar={vi.fn()} />)

    await usuario.type(screen.getByLabelText(/rut de tu postulación/i), '12.345.678-5')
    await usuario.click(screen.getByRole('button', { name: /consultar/i }))

    expect(screen.getByText(/no encontramos una postulación/i)).toBeInTheDocument()
  })

  it('encuentra la postulación aunque el RUT se escriba sin puntos ni guion', async () => {
    const usuario = userEvent.setup()
    const alEncontrar = vi.fn()
    render(<ConsultaPostulacion candidatos={candidatosIniciales} alEncontrar={alEncontrar} />)

    await usuario.type(screen.getByLabelText(/rut de tu postulación/i), '198765430')
    await usuario.click(screen.getByRole('button', { name: /consultar/i }))

    expect(alEncontrar).toHaveBeenCalledWith(4)
  })
})