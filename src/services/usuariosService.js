import { pedir } from './api'

// Nombres de los profesionales evaluadores activos (solo analista).
export function listarEvaluadores() {
  return pedir('/usuarios/evaluadores')
}
