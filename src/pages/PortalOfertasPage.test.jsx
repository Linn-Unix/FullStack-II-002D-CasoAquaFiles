import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ofertaAnalista, ofertaTecnico } from '../test/ofertasDePrueba'
import { simularApi } from '../test/simularApi'
import PortalOfertasPage from './PortalOfertasPage'

function renderizar() {
  return render(<MemoryRouter><PortalOfertasPage /></MemoryRouter>)
}

describe('PortalOfertasPage', () => {
  it('muestra las ofertas publicadas sin iniciar sesión', async () => {
    simularApi({ 'GET /portal/ofertas': { cuerpo: [ofertaTecnico, ofertaAnalista] } })
    renderizar()

    expect(await screen.findByText('2 oferta(s) encontrada(s)')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Técnico Acuícola' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver detalle de técnico acuícola/i })).toHaveAttribute('href', '/empleos/1')
  })

  it('filtra por categoría, modalidad y texto', async () => {
    const usuario = userEvent.setup()
    const fetchFalso = simularApi({
      'GET /portal/ofertas': (_opciones, url) => ({
        cuerpo: url.includes('familia=Producci') ? [ofertaAnalista] : [ofertaTecnico, ofertaAnalista],
      }),
    })
    renderizar()
    await screen.findByText('2 oferta(s) encontrada(s)')

    await usuario.click(screen.getByRole('button', { name: 'Producción' }))
    expect(await screen.findByText('1 oferta(s) encontrada(s)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Producción' })).toHaveAttribute('aria-pressed', 'true')

    await usuario.selectOptions(screen.getByLabelText('Modalidad'), 'HIBRIDA')
    await usuario.type(screen.getByLabelText(/buscar por cargo/i), 'datos')
    await usuario.click(screen.getByRole('button', { name: /buscar/i }))

    await waitFor(() => {
      const ultima = fetchFalso.mock.calls.at(-1)[0]
      expect(ultima).toContain('busqueda=datos')
      expect(ultima).toContain('modalidad=HIBRIDA')
    })
  })

  it('avisa cuando no hay resultados o la API falla', async () => {
    simularApi({ 'GET /portal/ofertas': { cuerpo: [] } })
    const { unmount } = renderizar()
    expect(await screen.findByText(/no hay ofertas con esos filtros/i)).toBeInTheDocument()
    unmount()

    simularApi({})
    renderizar()
    expect(await screen.findByRole('alert')).toHaveTextContent(/ruta no simulada/i)
  })
})
