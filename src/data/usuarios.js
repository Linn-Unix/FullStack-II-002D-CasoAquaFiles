import { ROLES } from './roles'

// 2. Página a la que llega cada rol después de iniciar sesión.
export const RUTA_INICIAL = {
  [ROLES.SUPERVISOR]: '/supervisor',
  [ROLES.PSICOLOGO]: '/psicologo',
}
