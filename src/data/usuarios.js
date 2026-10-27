import { ROLES } from './roles'

// 1. Usuarios internos de prueba (datos ficticios).
//    Solo el personal de AquaChile inicia sesión. El postulante entra sin cuenta.
//    En el Hito 2 estos usuarios vendrán del backend y las contraseñas no estarán en el código.
export const USUARIOS = [
  { usuario: 'analista', clave: 'aqua123', nombre: 'Rosa Martínez', rol: ROLES.SUPERVISOR },
  { usuario: 'evaluador', clave: 'aqua123', nombre: 'Luis Herrera', rol: ROLES.PSICOLOGO },
]

// 2. Página a la que llega cada rol después de iniciar sesión.
export const RUTA_INICIAL = {
  [ROLES.SUPERVISOR]: '/supervisor',
  [ROLES.PSICOLOGO]: '/psicologo',
}
