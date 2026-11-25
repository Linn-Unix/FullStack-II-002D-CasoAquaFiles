import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ofertaTecnico } from '../test/ofertasDePrueba'
import { simularApi } from '../test/simularApi'
import DetalleOfertaPage from './DetalleOfertaPage'

function renderizar(ruta = '/empleos/1') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes><Route path="/empleos/:id" element={<DetalleOfertaPage />} /></Routes>
    </MemoryRouter>,
  )
}

async function completarFormulario(usuario) {
  await usuario.type(screen.getByLabelText(/nombre completo/i), 'Tomás Fuentes')
  await usuario.type(screen.getByLabelText(/^rut$/i), '12.345.678-5')
  await usuario.type(screen.getByLabelText(/correo electrónico/i), 'tomas@correo.cl')
  await usuario.type(screen.getByLabelText(/teléfono/i), '+56 9 1111 2222')
  await usuario.upload(screen.getByLabelText(/adjuntar cv/i), new File(['cv'], 'cv_tomas.pdf', { type: 'application/pdf' }))
}

describe('DetalleOfertaPage', () => {
  it('muestra todos los antecedentes de la oferta', async () => {
    simularApi({ 'GET /portal/ofertas/1': { cuerpo: ofertaTecnico } })
    renderizar()

    expect(await screen.findByRole('heading', { name: 'Técnico Acuícola' })).toBeInTheDocument()
    expect(screen.getByText('Registrar alimentación')).toBeInTheDocument()
    expect(screen.getByText('$850.000 – $1.100.000')).toBeInTheDocument()
    expect(screen.getByText(/publicada el 20-11-2026/i)).toBeInTheDocument()
  })

  it('postula a la oferta y sube el CV', async () => {
    const usuario = userEvent.setup()
    const fetchFalso = simularApi({
      'GET /portal/ofertas/1': { cuerpo: ofertaTecnico },
      'POST /postulaciones': { status: 201, cuerpo: { id: 5, nombre: 'Tomás Fuentes', estado: 'REVISION' } },
      'POST /postulaciones/5/cv': { status: 201, cuerpo: { id: 9 } },
    })
    renderizar()

    await usuario.click(await screen.findByRole('button', { name: /postular/i }))
    // El cargo viene de la oferta, así que no se pide.
    expect(screen.queryByLabelText(/cargo al que postula/i)).not.toBeInTheDocument()
    await completarFormulario(usuario)
    await usuario.click(screen.getByRole('button', { name: /enviar postulación/i }))

    expect(await screen.findByText(/postulación enviada/i)).toBeInTheDocument()
    const envio = fetchFalso.mock.calls.find(([url, opciones]) => url.endsWith('/postulaciones') && opciones.method === 'POST')
    expect(JSON.parse(envio[1].body)).toMatchObject({ ofertaId: 1, cargo: 'Técnico Acuícola', rut: '12.345.678-5' })
    expect(fetchFalso.mock.calls.some(([url]) => url.endsWith('/postulaciones/5/cv'))).toBe(true)
  })

  it('muestra el error si la postulación es rechazada', async () => {
    const usuario = userEvent.setup()
    simularApi({
      'GET /portal/ofertas/1': { cuerpo: ofertaTecnico },
      'POST /postulaciones': { status: 409, cuerpo: { mensaje: 'Ya existe una postulación con el RUT 12.345.678-5.' } },
    })
    renderizar()

    await usuario.click(await screen.findByRole('button', { name: /postular/i }))
    await completarFormulario(usuario)
    await usuario.click(screen.getByRole('button', { name: /enviar postulación/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/ya existe una postulación/i)
  })

  it('avisa si la oferta no está publicada', async () => {
    simularApi({ 'GET /portal/ofertas/7': { status: 404, cuerpo: { mensaje: 'La oferta 7 no existe o ya no está publicada.' } } })
    renderizar('/empleos/7')

    expect(await screen.findByRole('heading', { name: /oferta no disponible/i })).toBeInTheDocument()
    expect(screen.getByText(/ya no está publicada/i)).toBeInTheDocument()
  })
})
