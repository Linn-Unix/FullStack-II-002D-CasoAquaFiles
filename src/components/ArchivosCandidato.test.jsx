import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { guardarSesion } from '../services/sesion'
import { simularApi } from '../test/simularApi'
import ArchivosCandidato from './ArchivosCandidato'

const cv = { id: 9, nombreOriginal: 'cv_tomas.pdf', categoria: 'CV', carpeta: 'tomas-fuentes-5' }

describe('ArchivosCandidato', () => {
  it('sin sesión solo muestra el nombre del CV', () => {
    render(<ArchivosCandidato candidatoId={5} nombreCv="cv_demo.pdf" />)
    expect(screen.getByText('cv_demo.pdf')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /descargar/i })).not.toBeInTheDocument()
  })

  it('muestra la carpeta del postulante y descarga el CV con el token', async () => {
    const usuario = userEvent.setup()
    guardarSesion({ token: 'token-de-prueba', rol: 'supervisor' })
    const fetchFalso = simularApi({ 'GET /candidatos/5/archivos': { cuerpo: [cv, { ...cv, id: 10, nombreOriginal: 'informe.pdf', categoria: 'INFORME' }] } })
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:cv'), revokeObjectURL: vi.fn() })
    render(<ArchivosCandidato candidatoId={5} nombreCv="cv_tomas.pdf" />)

    expect(await screen.findAllByText(/carpeta tomas-fuentes-5/i)).toHaveLength(2)
    expect(screen.getByText(/informe psicolaboral/i)).toBeInTheDocument()

    fetchFalso.mockResolvedValueOnce({ ok: true, status: 200, blob: async () => new Blob(['pdf']) })
    await usuario.click(screen.getByRole('button', { name: /descargar cv_tomas.pdf/i }))

    const [url, opciones] = fetchFalso.mock.calls.at(-1)
    expect(url).toMatch(/\/archivos\/9\/descargar$/)
    expect(opciones.headers.Authorization).toBe('Bearer token-de-prueba')
  })

  it('avisa si la descarga falla', async () => {
    const usuario = userEvent.setup()
    guardarSesion({ token: 'token-de-prueba', rol: 'supervisor' })
    const fetchFalso = simularApi({ 'GET /candidatos/5/archivos': { cuerpo: [cv] } })
    render(<ArchivosCandidato candidatoId={5} nombreCv="cv_tomas.pdf" />)
    await screen.findByText(/carpeta tomas-fuentes-5/i)

    fetchFalso.mockResolvedValueOnce({ ok: false, status: 403 })
    await usuario.click(screen.getByRole('button', { name: /descargar/i }))
    expect(await screen.findByText(/no tienes permiso/i)).toBeInTheDocument()

    fetchFalso.mockRejectedValueOnce(new Error('red'))
    await usuario.click(screen.getByRole('button', { name: /descargar/i }))
    expect(await screen.findByText(/no se pudo conectar/i)).toBeInTheDocument()
  })
})
