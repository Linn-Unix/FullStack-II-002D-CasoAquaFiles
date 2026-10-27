// 1. Estados posibles de un candidato dentro del proceso de selección.
//    Usamos un objeto para no escribir los textos a mano en cada archivo.
export const ESTADOS = {
  REVISION: 'En revisión técnica',
  APROBADO: 'Aprobado técnicamente',
  RECHAZADO: 'Rechazado técnicamente',
  DERIVADO: 'Derivado a psicólogo',
  AGENDADO: 'Agendado',
  FINALIZADO: 'Proceso Finalizado',
}

// 2. Object.values() convierte el objeto en un arreglo. Se usa para el filtro por estado.
export const LISTA_ESTADOS = Object.values(ESTADOS)

// 3. Opciones de los select del formulario.
export const FAMILIAS = ['Operaciones', 'Producción', 'Personas']
export const UBICACIONES = ['Puerto Montt', 'Puerto Natales', 'Chiloé']

export const EVALUADORES = ['Ps. Ana Fuentes', 'Ps. Luis Morales']
export const RESULTADOS = ['Recomendable', 'Recomendable con observaciones', 'No recomendable']

// Centros de costos de ejemplo. Deben confirmarse con AquaChile.
export const CENTROS_COSTO = ['Cultivo y engorda', 'Planta de proceso', 'Mantención', 'Administración y personas']

// 4. Datos simulados (todavía no hay backend ni base de datos).
export const candidatosIniciales = [
  {
    id: 1,
    nombre: 'Juanito Pérez',
    rut: '15.678.432-K',
    correo: 'juanito.perez@ejemplo.cl',
    cargo: 'Supervisor de Mantención',
    familia: 'Operaciones',
    ubicacion: 'Puerto Montt',
    centroCosto: 'Mantención',
    estado: ESTADOS.FINALIZADO,
    nombreCv: 'CV_Juanito_Perez.pdf',
    fechaEntrevista: '2026-09-24',
    informe: 'Informe_psicolaboral.pdf',
    observaciones: 'Experiencia sólida en mantención de equipos.',
    resultado: 'Recomendable',
    observacionesEvaluacion: 'Buena tolerancia a la presión y trabajo en equipo.',
  },
  {
    id: 2,
    nombre: 'María González',
    rut: '18.923.456-2',
    correo: 'maria.gonzalez@ejemplo.cl',
    cargo: 'Jefe de Turno Centro',
    familia: 'Operaciones',
    ubicacion: 'Puerto Natales',
    centroCosto: 'Cultivo y engorda',
    estado: ESTADOS.AGENDADO,
    nombreCv: 'CV_Maria_Gonzalez.pdf',
    fechaEntrevista: '2026-10-28',
    informe: '',
    observaciones: '',
    resultado: '',
    observacionesEvaluacion: '',
  },
  {
    id: 3,
    nombre: 'Pedro Soto',
    rut: '20.456.789-1',
    correo: 'pedro.soto@ejemplo.cl',
    cargo: 'Analista de Personas',
    familia: 'Personas',
    ubicacion: 'Puerto Montt',
    centroCosto: 'Administración y personas',
    estado: ESTADOS.APROBADO,
    nombreCv: 'CV_Pedro_Soto.pdf',
    fechaEntrevista: '',
    informe: '',
    observaciones: '',
    resultado: '',
    observacionesEvaluacion: '',
  },
  {
    id: 4,
    nombre: 'Camila Rojas',
    rut: '19.876.543-0',
    correo: 'camila.rojas@ejemplo.cl',
    cargo: 'Técnico Acuícola',
    familia: 'Producción',
    ubicacion: 'Chiloé',
    centroCosto: 'Cultivo y engorda',
    estado: ESTADOS.REVISION,
    nombreCv: 'CV_Camila_Rojas.pdf',
    fechaEntrevista: '',
    informe: '',
    observaciones: '',
    resultado: '',
    observacionesEvaluacion: '',
  },
]