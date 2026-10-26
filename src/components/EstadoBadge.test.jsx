import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { ESTADOS } from '../data/candidatos'
import EstadoBadge from './EstadoBadge'

it('muestra el estado con el color que le corresponde', () => {
  render(<EstadoBadge estado={ESTADOS.APROBADO} />)

  const etiqueta = screen.getByText('Aprobado técnicamente')
  expect(etiqueta).toHaveClass('badge', 'text-bg-success')
})