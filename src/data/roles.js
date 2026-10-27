// 1. Roles de la aplicación. Cada rol solo puede entrar a su propia pantalla.
export const ROLES = {
  POSTULANTE: 'postulante',
  SUPERVISOR: 'supervisor',
  PSICOLOGO: 'psicologo',
}

// 2. Nombre que se muestra en el menú para cada rol.
export const NOMBRES_ROL = {
  [ROLES.POSTULANTE]: 'Postulante',
  [ROLES.SUPERVISOR]: 'Supervisor Técnico',
  [ROLES.PSICOLOGO]: 'Psicólogo/a',
}