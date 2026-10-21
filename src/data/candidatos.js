export const STATUS = {
  REVIEW: 'En revisión técnica',
  APPROVED: 'Aprobado técnicamente',
  REJECTED: 'Rechazado técnicamente',
  DERIVED: 'Derivado a psicólogo',
  SCHEDULED: 'Agendado',
  FINISHED: 'Proceso Finalizado',
}

export const STATUS_LIST = Object.values(STATUS)

export const FAMILIES = ['Operaciones', 'Producción', 'Personas']

export const LOCATIONS = ['Puerto Montt', 'Puerto Natales', 'Chiloé']

export const initialCandidates = [
  {
    id: 1,
    name: 'Gosman Radatz',
    rut: '15.678.432-K',
    email: 'gosman@correo.cl',
    position: 'Supervisor de Mantención',
    family: 'Operaciones',
    location: 'Puerto Montt',
    status: STATUS.FINISHED,
    cvName: 'CV_Gosman_Radatz.pdf',
    interviewDate: '2026-09-24',
    reportName: 'Informe_psicolaboral.pdf',
  },
  {
    id: 2,
    name: 'Marcos Fonseca',
    rut: '18.923.456-2',
    email: 'marcos@correo.cl',
    position: 'Jefe de Turno Centro',
    family: 'Operaciones',
    location: 'Puerto Natales',
    status: STATUS.SCHEDULED,
    cvName: 'CV_Marcos_Fonseca.pdf',
    interviewDate: '2026-10-28',
    reportName: '',
  },
  {
    id: 3,
    name: 'Valentina Ríos',
    rut: '20.456.789-1',
    email: 'valentina@correo.cl',
    position: 'Analista de Personas',
    family: 'Personas',
    location: 'Puerto Montt',
    status: STATUS.APPROVED,
    cvName: 'CV_Valentina_Rios.pdf',
    interviewDate: '',
    reportName: '',
  },
  {
    id: 4,
    name: 'Nicolás Vera',
    rut: '19.876.543-0',
    email: 'nicolas@correo.cl',
    position: 'Técnico Acuícola',
    family: 'Producción',
    location: 'Chiloé',
    status: STATUS.REVIEW,
    cvName: 'CV_Nicolas_Vera.pdf',
    interviewDate: '',
    reportName: '',
  },
]