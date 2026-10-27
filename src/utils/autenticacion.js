import { USUARIOS } from '../data/usuarios'

// 1. Busca un usuario con ese nombre de usuario y contraseña.
//    Devuelve el usuario encontrado o null si los datos no coinciden.
export function validarCredenciales(usuario, clave) {
  const nombreUsuario = usuario.trim().toLowerCase()
  return USUARIOS.find((item) => item.usuario === nombreUsuario && item.clave === clave) ?? null
}
