﻿// 1. Estados posibles de un candidato dentro del proceso de selección.
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

// Centros de costos de ejemplo. Deben confirmarse con AquaChile.
export const CENTROS_COSTO = ['Cultivo y engorda', 'Planta de proceso', 'Mantención', 'Administración y personas']

// 4. Datos simulados (todavía no hay backend ni base de datos).
export const candidatosIniciales = [
  {
    id: 1,
    nombre: 'Gosman Radatz',
    rut: '15.678.432-K',
    correo: 'gosman@correo.cl',
    cargo: 'Supervisor de Mantención',
    familia: 'Operaciones',
    ubicacion: 'Puerto Montt',
    centroCosto: 'Mantención',
    estado: ESTADOS.FINALIZADO,
    nombreCv: 'CV_Gosman_Radatz.pdf',
    fechaEntrevista: '2026-09-24',
    informe: 'Informe_psicolaboral.pdf',
    observaciones: 'Experiencia sólida en mantención de equipos.',
  },
  {
    id: 2,
    nombre: 'Marcos Fonseca',
    rut: '18.923.456-2',
    correo: 'marcos@correo.cl',
    cargo: 'Jefe de Turno Centro',
    familia: 'Operaciones',
    ubicacion: 'Puerto Natales',
    centroCosto: 'Cultivo y engorda',
    estado: ESTADOS.AGENDADO,
    nombreCv: 'CV_Marcos_Fonseca.pdf',
    fechaEntrevista: '2026-10-28',
    informe: '',
    observaciones: '',
  },
  {
    id: 3,
    nombre: 'Valentina Ríos',
    rut: '20.456.789-1',
    correo: 'valentina@correo.cl',
    cargo: 'Analista de Personas',
    familia: 'Personas',
    ubicacion: 'Puerto Montt',
    centroCosto: 'Administración y personas',
    estado: ESTADOS.APROBADO,
    nombreCv: 'CV_Valentina_Rios.pdf',
    fechaEntrevista: '',
    informe: '',
    observaciones: '',
  },
  {
    id: 4,
    nombre: 'Nicolás Vera',
    rut: '19.876.543-0',
    correo: 'nicolas@correo.cl',
    cargo: 'Técnico Acuícola',
    familia: 'Producción',
    ubicacion: 'Chiloé',
    centroCosto: 'Cultivo y engorda',
    estado: ESTADOS.REVISION,
    nombreCv: 'CV_Nicolas_Vera.pdf',
    fechaEntrevista: '',
    informe: '',
    observaciones: '',
  },
]