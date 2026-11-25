import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { simularApi } from '../test/simularApi'
import OfertasAdminPage from './OfertasAdminPage'

const borrador = {
  id: 1, cargo: 'Técnico Acuícola', familia: 'Operaciones', ubicacion: 'Puerto Montt', modalidad: 'PRESENCIAL',
  modalidadEtiqueta: 'Presencial', cupos: 2, descripcion: 'Apoyo en centros.', funciones: 'Monitorear jaulas.',
  requisitos: 'Título técnico.', beneficios: 'Seguro.', sueldoMinimo: 800000, sueldoMaximo: 1000000,
  publicada: false, fechaPublicacion: null,
}

describe('OfertasAdminPage', () => {
  it('lista las ofertas y publica una', async () => {
    const usuario = userEvent.setup()
    let publicada = false
    simularApi({
      'GET /ofertas': () => ({ cuerpo: [{ ...borrador, publicada, fechaPublicacion: publicada ? '2026-11-25' : null }] }),
      'PATCH /ofertas/1/publicar': () => { publicada = true; return { cuerpo: { ...borrador, publicada: true } } },
    })
    render(<OfertasAdminPage />)

    const fila = await screen.findByRole('row', { name: /técnico acuícola/i })
    expect(within(fila).getByText('Borrador')).toBeInTheDocument()

    await usuario.click(within(fila).getByRole('button', { name: 'Publicar' }))

    expect(await screen.findByText(/publicada en el portal/i)).toBeInTheDocument()
    expect(within(screen.getByRole('row', { name: /técnico acuícola/i })).getByText(/publicada · 25-11-2026/i)).toBeInTheDocument()
  })

  it('crea una oferta nueva con el formulario', async () => {
    const usuario = userEvent.setup()
    const fetchFalso = simularApi({
      'GET /ofertas': { cuerpo: [] },
      'POST /ofertas': { status: 201, cuerpo: { ...borrador, id: 2 } },
    })
    render(<OfertasAdminPage />)

    await usuario.click(await screen.findByRole('button', { name: /nueva oferta/i }))
    await usuario.click(screen.getByRole('button', { name: /guardar oferta/i }))
    expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Cargo'), 'Operario de Planta')
    await usuario.type(screen.getByLabelText('Sueldo mínimo'), '600000')
    await usuario.type(screen.getByLabelText('Sueldo máximo'), '750000')
    await usuario.type(screen.getByLabelText('Descripción'), 'Trabajo en planta de proceso.')
    await usuario.type(screen.getByLabelText('Funciones principales'), 'Clasificar producto.')
    await usuario.type(screen.getByLabelText('Requisitos'), 'Enseñanza media.')
    await usuario.type(screen.getByLabelText('Beneficios'), 'Casino.')
    await usuario.click(screen.getByRole('button', { name: /guardar oferta/i }))

    expect(await screen.findByText(/oferta "operario de planta" creada/i)).toBeInTheDocument()
    const envio = fetchFalso.mock.calls.find(([, opciones]) => opciones?.method === 'POST')
    expect(JSON.parse(envio[1].body)).toMatchObject({ cargo: 'Operario de Planta', cupos: 1, sueldoMinimo: 600000 })
  })

  it('edita, despublica y elimina', async () => {
    const usuario = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    simularApi({
      'GET /ofertas': { cuerpo: [{ ...borrador, publicada: true, fechaPublicacion: '2026-11-20' }] },
      'PUT /ofertas/1': { cuerpo: borrador },
      'PATCH /ofertas/1/despublicar': { cuerpo: borrador },
      'DELETE /ofertas/1': { status: 409, cuerpo: { mensaje: 'La oferta tiene postulaciones. Despublícala en vez de eliminarla.' } },
    })
    render(<OfertasAdminPage />)

    await usuario.click(await screen.findByRole('button', { name: /editar técnico acuícola/i }))
    expect(screen.getByLabelText('Cargo')).toHaveValue('Técnico Acuícola')
    await usuario.click(screen.getByRole('button', { name: /guardar oferta/i }))
    expect(await screen.findByText(/actualizada/i)).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Despublicar' }))
    expect(await screen.findByText(/ya no se muestra en el portal/i)).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /eliminar técnico acuícola/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/tiene postulaciones/i))
  })

  it('muestra un mensaje si no hay ofertas o si la API falla', async () => {
    simularApi({})
    render(<OfertasAdminPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/ruta no simulada/i)
    expect(screen.getByText(/todavía no hay ofertas/i)).toBeInTheDocument()
  })
})
