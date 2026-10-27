// 1. Roles de la aplicación. Cada rol solo puede entrar a su propia pantalla.
export const ROLES = {
  POSTULANTE: 'postulante',
  SUPERVISOR: 'supervisor',
  PSICOLOGO: 'psicologo',
}

export const NOMBRES_ROL = {
  [ROLES.POSTULANTE]: 'Postulante',
  [ROLES.SUPERVISOR]: 'Analista de Reclutamiento',
  [ROLES.PSICOLOGO]: 'Profesional Evaluador',
}
