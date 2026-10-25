import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import CandidatoCard from './CandidatoCard'

it('muestra el nombre, cargo y estado recibidos por props', () => {
  render(<CandidatoCard nombre="Valentina Ríos" cargo="Analista de Personas" estado="Agendado" />)

  expect(screen.getByText('Valentina Ríos')).toBeInTheDocument()
  expect(screen.getByText('Analista de Personas')).toBeInTheDocument()
  expect(screen.getByText('Agendado')).toBeInTheDocument()
})