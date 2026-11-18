import { ROLES } from '../data/roles'
import { pedir } from './api'
import { guardarSesion } from './sesion'

export const ROL_DESDE_API = {
  ANALISTA: ROLES.SUPERVISOR,
  EVALUADOR: ROLES.PSICOLOGO,
}

export async function iniciarSesionApi(usuario, clave) {
  const datos = await pedir('/auth/login', {
    metodo: 'POST',
    cuerpo: { usuario: usuario.trim(), clave },
  })
  const rol = ROL_DESDE_API[datos?.rol]

  if (!datos?.token || !rol) {
    throw new Error('La respuesta del servidor no contiene una sesión válida.')
  }

  const sesion = {
    token: datos.token,
    usuario: datos.usuario,
    nombre: datos.nombre,
    rol,
  }
  guardarSesion(sesion)
  return sesion
}
