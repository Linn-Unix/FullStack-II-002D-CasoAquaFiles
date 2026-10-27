import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FormularioPostulacion from './FormularioPostulacion'

describe('FormularioPostulacion', () => {
  it('muestra errores y no envía si el formulario está vacío', async () => {
    const usuario = userEvent.setup()
    const alEnviar = vi.fn() // función falsa para saber si se llamó
    render(<FormularioPostulacion alEnviar={alEnviar} />)

    await usuario.click(screen.getByRole('button', { name: /enviar postulación/i }))

    expect(screen.getByText(/ingresa tu nombre completo/i)).toBeInTheDocument()
    expect(screen.getByText(/ingresa un rut válido/i)).toBeInTheDocument()
    expect(screen.getByText('Adjunta tu CV.')).toBeInTheDocument()
    expect(alEnviar).not.toHaveBeenCalled()
  })

  it('envía la postulación cuando los datos son válidos', async () => {
    const usuario = userEvent.setup()
    const alEnviar = vi.fn()
    render(<FormularioPostulacion alEnviar={alEnviar} />)

    await usuario.type(screen.getByLabelText(/nombre completo/i), 'Andrea Muñoz')
    await usuario.type(screen.getByLabelText(/rut/i), '12.345.678-5')
    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'andrea@correo.cl')
    await usuario.type(screen.getByLabelText(/teléfono/i), '+56 9 1234 5678')
    await usuario.type(screen.getByLabelText(/cargo al que postula/i), 'Técnico Acuícola')
    await usuario.upload(screen.getByLabelText(/adjuntar cv/i), new File(['cv'], 'cv_andrea.pdf', { type: 'application/pdf' }))
    await usuario.click(screen.getByRole('button', { name: /enviar postulación/i }))

    expect(alEnviar).toHaveBeenCalledTimes(1)
    expect(alEnviar.mock.calls[0][0]).toMatchObject({
      nombre: 'Andrea Muñoz',
      rut: '12.345.678-5',
      telefono: '+56 9 1234 5678',
      estado: 'En revisión técnica',
      nombreCv: 'cv_andrea.pdf',
      centroCosto: 'Cultivo y engorda',
    })
  })
})