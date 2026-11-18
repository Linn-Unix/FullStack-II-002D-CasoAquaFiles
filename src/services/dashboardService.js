import { pedir } from './api'

export function obtenerResumen() {
  return pedir('/dashboard/resumen')
}