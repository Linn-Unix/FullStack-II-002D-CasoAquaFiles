import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

// MemoryRouter simula el navegador en las pruebas y permite partir en cualquier ruta.
function renderizarApp(ruta = '/') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Navegación con React Router', () => {
  it('muestra los tres roles en el inicio', () => {
    renderizarApp('/')
    expect(screen.getByRole('link', { name: /postulante/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /supervisor técnico/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /psicólogo/i })).toBeInTheDocument()
  })

  it('navega al panel del supervisor', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/')
    await usuario.click(screen.getByRole('link', { name: /supervisor técnico/i }))
    expect(screen.getByRole('heading', { name: 'Panel del Supervisor' })).toBeInTheDocument()
  })

  it('navega desde el menú del navbar', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/')
    const menu = screen.getByRole('navigation')
    await usuario.click(within(menu).getByRole('link', { name: 'Psicología' }))
    expect(screen.getByRole('heading', { name: 'Panel Psicolaboral' })).toBeInTheDocument()
  })

  it('muestra la página 404 en una ruta que no existe', () => {
    renderizarApp('/no-existe')
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument()
  })
})

describe('Flujo del proceso', () => {
  it('el supervisor filtra por estado', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor')

    await usuario.selectOptions(screen.getByLabelText(/filtrar por estado/i), 'En revisión técnica')

    expect(screen.getByRole('row', { name: /nicolás vera/i })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /gosman radatz/i })).not.toBeInTheDocument()
    expect(screen.getByText('1 resultado(s)')).toBeInTheDocument()
  })

  it('el supervisor filtra por centro de costos', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor')

    await usuario.selectOptions(screen.getByLabelText(/filtrar por centro de costos/i), 'Mantención')

    expect(screen.getByRole('row', { name: /gosman radatz/i })).toBeInTheDocument()
    expect(screen.getByText('1 resultado(s)')).toBeInTheDocument()
  })

  it('el supervisor edita el cargo de un candidato', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor')

    await usuario.click(screen.getByRole('row', { name: /nicolás vera/i }))
    await usuario.click(screen.getByRole('button', { name: /editar datos/i }))
    await usuario.clear(screen.getByLabelText('Cargo'))
    await usuario.type(screen.getByLabelText('Cargo'), 'Jefe de Centro')
    await usuario.click(screen.getByRole('button', { name: /guardar cambios/i }))

    const fila = screen.getByRole('row', { name: /nicolás vera/i })
    expect(within(fila).getByText('Jefe de Centro')).toBeInTheDocument()
  })

  it('no guarda un cargo demasiado corto', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor')

    await usuario.click(screen.getByRole('row', { name: /nicolás vera/i }))
    await usuario.click(screen.getByRole('button', { name: /editar datos/i }))
    await usuario.clear(screen.getByLabelText('Cargo'))
    await usuario.type(screen.getByLabelText('Cargo'), 'AB')
    await usuario.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument()
  })

  it('el psicólogo ve las observaciones del supervisor', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor')

    await usuario.click(screen.getByRole('row', { name: /valentina ríos/i }))
    await usuario.type(screen.getByLabelText(/observaciones técnicas/i), 'Buen manejo de equipos')
    await usuario.click(screen.getByRole('button', { name: /guardar observaciones/i }))
    await usuario.click(screen.getByRole('button', { name: /derivar al psicólogo/i }))
    await usuario.click(screen.getByRole('link', { name: /cambiar rol/i }))
    await usuario.click(screen.getByRole('link', { name: /psicólogo/i }))
    await usuario.click(screen.getByRole('button', { name: /valentina ríos/i }))

    expect(screen.getByText('Buen manejo de equipos')).toBeInTheDocument()
  })

  it('el supervisor rechaza a un candidato en revisión', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor')

    await usuario.click(screen.getByRole('row', { name: /nicolás vera/i }))
    await usuario.click(screen.getByRole('button', { name: /rechazar/i }))

    expect(screen.getByText(/etapa técnica cerrada/i)).toBeInTheDocument()
  })

  it('el supervisor deriva un candidato y el psicólogo lo recibe', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor')

    await usuario.click(screen.getByRole('row', { name: /valentina ríos/i }))
    await usuario.click(screen.getByRole('button', { name: /derivar al psicólogo/i }))
    await usuario.click(screen.getByRole('link', { name: /cambiar rol/i }))
    await usuario.click(screen.getByRole('link', { name: /psicólogo/i }))

    expect(screen.getByRole('button', { name: /valentina ríos/i })).toBeInTheDocument()
  })
})