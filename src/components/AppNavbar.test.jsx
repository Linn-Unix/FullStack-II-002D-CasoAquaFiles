import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AppNavbar from './AppNavbar'
import { ROLES } from '../data/roles'

function mostrar(rol, nombreUsuario = '') {
  render(
    <MemoryRouter>
      <AppNavbar rol={rol} nombreUsuario={nombreUsuario} alCerrarSesion={() => {}} />
    </MemoryRouter>,
  )
}

describe('AppNavbar', () => {
  it('al postulante no le muestra rol ni "Cerrar sesión", porque no tiene cuenta', () => {
    mostrar(ROLES.POSTULANTE)
    expect(screen.getByRole('link', { name: 'Mi postulación' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Empleos' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Postulante')).not.toBeInTheDocument()
  })

  it('sin sesión también muestra "Mi postulación" y "Empleos", sin "Cerrar sesión"', () => {
    mostrar(null)
    expect(screen.getByRole('img', { name: 'Logo de AquaChile' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi postulación' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Empleos' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument()
  })

  it('al analista le muestra su nombre, su rol y "Cerrar sesión"', () => {
    mostrar(ROLES.SUPERVISOR, 'Rosa Martínez')
    expect(screen.getByText(/Rosa Martínez/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Empleos' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Mi postulación' })).not.toBeInTheDocument()
  })

  it('al evaluador también le muestra "Cerrar sesión"', () => {
    mostrar(ROLES.PSICOLOGO, 'Luis Herrera')
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
  })
})
