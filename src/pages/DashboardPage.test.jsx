import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { simularApi } from '../test/simularApi'
import DashboardPage from './DashboardPage'

const resumen = {
  total: 2,
  porEstado: { REVISION: 1, APROBADO: 0, RECHAZADO: 0, DERIVADO: 0, AGENDADO: 0, FINALIZADO: 1 },
  porFamilia: { Operaciones: 2 },
  porUbicacion: { 'Puerto Montt': 2 },
  promedioDiasHastaDerivacion: 2,
  promedioDiasHastaFinalizacion: null,
}
const candidatos = [
  { id: 1, nombre: 'Juanito Pérez', cargo: 'Técnico', estado: 'En revisión técnica', fechaSolicitud: '2026-11-20' },
  { id: 2, nombre: 'Camila Rojas', cargo: 'Técnico', estado: 'Proceso Finalizado', fechaSolicitud: '2026-11-21', responsable: 'Luis Herrera' },
]

describe('DashboardPage', () => {
  it('muestra los indicadores y pide el resumen una sola vez si los candidatos no cambian', async () => {
    const fetchFalso = simularApi({ 'GET /dashboard/resumen': { cuerpo: resumen } })
    const { rerender } = render(<DashboardPage candidatos={candidatos} />)

    expect(await screen.findByText('Pendientes')).toBeInTheDocument()
    expect(screen.getByText('Sin datos')).toBeInTheDocument()
    expect(screen.getByText('Luis Herrera')).toBeInTheDocument()

    // Una lista nueva con los mismos datos (como pasa al recargar desde la API) no repite la petición.
    rerender(<DashboardPage candidatos={candidatos.map((candidato) => ({ ...candidato }))} />)
    expect(fetchFalso).toHaveBeenCalledTimes(1)

    // Si cambia el estado de un candidato, sí se vuelve a pedir.
    rerender(<DashboardPage candidatos={[{ ...candidatos[0], estado: 'Aprobado técnicamente' }, candidatos[1]]} />)
    await screen.findByText('Pendientes')
    expect(fetchFalso).toHaveBeenCalledTimes(2)
  })

  it('muestra el error si la API falla', async () => {
    simularApi({})
    render(<DashboardPage candidatos={[]} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/ruta no simulada/i)
  })
})
