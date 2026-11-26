// Ofertas ficticias que usan las pruebas del portal y del panel de ofertas.
export const ofertaTecnico = {
  id: 1, cargo: 'Técnico Acuícola', familia: 'Operaciones', ubicacion: 'Puerto Montt', modalidad: 'PRESENCIAL',
  modalidadEtiqueta: 'Presencial', cupos: 3, descripcion: 'Apoyo en centros de cultivo.',
  funciones: 'Monitorear jaulas. Registrar alimentación.', requisitos: 'Título técnico.',
  beneficios: 'Seguro complementario.', sueldoMinimo: 850000, sueldoMaximo: 1100000,
  publicada: true, fechaPublicacion: '2026-11-20',
}

export const ofertaAnalista = {
  ...ofertaTecnico, id: 2, cargo: 'Analista de Datos', familia: 'Producción', modalidad: 'HIBRIDA', modalidadEtiqueta: 'Híbrida',
}
