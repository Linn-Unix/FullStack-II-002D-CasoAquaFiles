import { useMemo, useState } from 'react'
import './App.css'

const initialCandidates = [
  { id: 1, name: 'Gosman Radatz', position: 'Supervisor de Mantención', location: 'Puerto Montt', status: 'Informe enviado', technicalApproved: true },
  { id: 2, name: 'Marcos Fonseca', position: 'Jefe de Turno Centro', location: 'Puerto Natales', status: 'Entrevista realizada', technicalApproved: true },
  { id: 3, name: 'Valentina Ríos', position: 'Analista de Personas', location: 'Puerto Montt', status: 'Entrevista agendada', technicalApproved: true },
  { id: 4, name: 'Nicolás Vera', position: 'Técnico Acuícola', location: 'Chiloé', status: 'Evaluación recibida', technicalApproved: true },
]

const stages = ['Evaluación recibida', 'Entrevista agendada', 'Entrevista realizada', 'Informe enviado']

function App() {
  const [role, setRole] = useState(null)
  const [candidates, setCandidates] = useState(initialCandidates)
  const [selectedId, setSelectedId] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [psychologistNotified, setPsychologistNotified] = useState(false)
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedId) || candidates[0]

  if (!role) return <RoleSelection candidates={candidates} onSelectRole={setRole} onSelectCandidate={setSelectedId} />

  return <main className="container py-4">
    <RoleHeader role={role} onLogout={() => setRole(null)} />
    {role === 'supervisor' ? <SupervisorView candidates={candidates} selectedCandidate={selectedCandidate} selectedId={selectedId} setSelectedId={setSelectedId} search={search} setSearch={setSearch} showForm={showForm} setShowForm={setShowForm} setCandidates={setCandidates} psychologistNotified={psychologistNotified} setPsychologistNotified={setPsychologistNotified} /> : <CandidateView candidate={selectedCandidate} />}
  </main>
}

function RoleSelection({ candidates, onSelectRole, onSelectCandidate }) {
  function enterCandidate(event) {
    onSelectCandidate(Number(event.target.value))
    onSelectRole('candidate')
  }

  return <main className="role-screen"><section className="role-card"><p className="tag">Proyecto AquaFiles - FullStack II</p><h1>Gestión Laboral</h1><p className="lead">Ingresa a tu espacio de trabajo según tu rol en el proceso de selección.</p><div className="role-options"><button onClick={() => onSelectRole('supervisor')}><span className="role-icon"><i className="bi bi-shield-check" /></span><strong>Supervisor Técnico</strong><small>Gestionar candidatos, currículums, estados y derivaciones.</small><span className="role-action">Ingresar <i className="bi bi-arrow-right" /></span></button><label><span className="role-icon candidate-icon"><i className="bi bi-person-badge" /></span><strong>Postulante / Candidato</strong><small>Consultar mi currículum y el avance de mi proceso.</small><select defaultValue="" onChange={enterCandidate}><option value="" disabled>Seleccionar mi perfil</option>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></label></div><p className="role-note"><i className="bi bi-lock-fill" /> Cada rol solo accede a la información que le corresponde.</p></section></main>
}

function RoleHeader({ role, onLogout }) { return <header className="app-header"><div><p className="tag">Proyecto AquaFiles - FullStack II</p><h1>{role === 'supervisor' ? 'Panel del Supervisor' : 'Mi proceso de selección'}</h1><p>{role === 'supervisor' ? 'Gestión completa del proceso técnico y psicolaboral.' : 'Consulta segura de tus antecedentes y estado.'}</p></div><button className="btn btn-outline-secondary" onClick={onLogout}><i className="bi bi-box-arrow-right" /> Cambiar rol</button></header> }

function SupervisorView({ candidates, selectedCandidate, selectedId, setSelectedId, search, setSearch, showForm, setShowForm, setCandidates, psychologistNotified, setPsychologistNotified }) {
  const filteredCandidates = useMemo(() => candidates.filter((candidate) => `${candidate.name} ${candidate.position} ${candidate.location}`.toLowerCase().includes(search.toLowerCase())), [candidates, search])
  const technicalApproved = candidates.filter((candidate) => candidate.technicalApproved)
  const pending = candidates.filter((candidate) => candidate.status !== 'Informe enviado').length
  const completed = candidates.filter((candidate) => candidate.status === 'Informe enviado').length

  function advanceCandidate() {
    const currentStage = stages.indexOf(selectedCandidate.status)
    const nextStage = stages[Math.min(currentStage + 1, stages.length - 1)]
    setCandidates(candidates.map((candidate) => candidate.id === selectedCandidate.id ? { ...candidate, status: nextStage } : candidate))
  }

  function addCandidate(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const candidate = { id: Date.now(), name: form.get('name'), position: form.get('position'), location: form.get('location'), status: 'Evaluación recibida', technicalApproved: true }
    setCandidates([candidate, ...candidates])
    setSelectedId(candidate.id)
    setShowForm(false)
  }

  return <><div className="privilege-banner"><i className="bi bi-shield-check" /><div><strong>Acceso de Supervisor Técnico</strong><small>Puedes gestionar todos los candidatos y derivar los perfiles aprobados al psicólogo.</small></div><button className="btn btn-aqua" onClick={() => setShowForm(true)}><i className="bi bi-plus-lg" /> Nueva solicitud</button></div><section className="indicadores row g-3 mb-4"><Metric value={candidates.length} label="Candidatos" /><Metric value={pending} label="Pendientes" /><Metric value={candidates.length - pending} label="En proceso" /><Metric value={completed} label="Finalizados" /></section><section className="flujo mb-4"><h2>Flujo técnico → psicolaboral</h2><p>El supervisor aprueba técnicamente, resume los antecedentes y avisa al psicólogo para iniciar la evaluación.</p><div className="stage-list">{stages.map((stage, index) => <span key={stage} className={selectedCandidate.status === stage ? 'stage active' : 'stage'}>{index + 1}. {stage}</span>)}</div></section><section className="technical-summary mb-4"><div><p className="tag">DERIVACIÓN A PSICÓLOGO</p><h2>Resumen de aprobados técnicamente</h2><p>{technicalApproved.length} candidatos superaron el filtro técnico y están listos para evaluación psicolaboral.</p></div><button className="btn btn-aqua" onClick={() => setPsychologistNotified(true)} disabled={psychologistNotified}>{psychologistNotified ? 'Psicólogo avisado' : 'Avisar al psicólogo'} <i className={`bi ${psychologistNotified ? 'bi-check-lg' : 'bi-send'}`} /></button></section><section className="row g-4"><div className="col-lg-8"><div className="panel"><div className="panel-heading"><div><h2>Tabla gestora de candidatos</h2><p>Vista completa para administrar el proceso.</p></div><div className="search-control"><i className="bi bi-search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar candidato..." /></div></div><div className="table-responsive"><table className="table align-middle"><thead><tr><th>Candidato</th><th>Cargo</th><th>Ubicación</th><th>Estado</th></tr></thead><tbody>{filteredCandidates.map((candidate) => <tr key={candidate.id} className={candidate.id === selectedId ? 'selected' : ''} onClick={() => setSelectedId(candidate.id)}><td><strong>{candidate.name}</strong></td><td>{candidate.position}</td><td>{candidate.location}</td><td><span className="badge-status">{candidate.status}</span></td></tr>)}</tbody></table></div></div></div><div className="col-lg-4"><CandidateDetail candidate={selectedCandidate} onAdvance={advanceCandidate} canAdvance /></div></section>{showForm && <RequestForm onClose={() => setShowForm(false)} onSubmit={addCandidate} />}</>
}

function CandidateView({ candidate }) { return <><div className="candidate-welcome"><div><p className="tag">ESPACIO PERSONAL</p><h2>Hola, {candidate.name}</h2><p>Aquí puedes consultar únicamente tu información del proceso.</p></div><span className="private-badge"><i className="bi bi-lock-fill" /> Información privada</span></div><section className="row g-4"><div className="col-lg-7"><div className="panel personal-card"><p className="tag">MI CURRÍCULUM</p><div className="candidate-large"><div className="candidate-initials">{candidate.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div><div><h2>{candidate.name}</h2><p>{candidate.position}</p><p><i className="bi bi-geo-alt" /> {candidate.location}</p></div></div><hr /><div className="private-file"><i className="bi bi-file-earmark-pdf-fill" /><div><strong>Mi_Curriculum.pdf</strong><small>Documento registrado en AquaFiles</small></div><button className="btn btn-outline-secondary btn-sm"><i className="bi bi-download" /> Descargar</button></div></div></div><div className="col-lg-5"><div className="panel process-card"><p className="tag">ESTADO DEL PROCESO</p><span className="badge-status">{candidate.status}</span><h2>Seguimiento</h2>{stages.map((stage, index) => <div className={stages.indexOf(candidate.status) >= index ? 'process-step done' : 'process-step'} key={stage}><span>{stages.indexOf(candidate.status) >= index ? '✓' : index + 1}</span><div><strong>{stage}</strong><small>{stages.indexOf(candidate.status) >= index ? 'Completado o iniciado' : 'Pendiente'}</small></div></div>)}</div></div></section><div className="candidate-notice"><i className="bi bi-info-circle" /><span>Para proteger la confidencialidad, solo puedes ver tu currículum y el estado de tu propia postulación.</span></div></> }

function CandidateDetail({ candidate, onAdvance, canAdvance }) { return <div className="panel expediente"><p className="tag">EXPEDIENTE DEL CANDIDATO</p><div className="candidate-initials">{candidate.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div><h2>{candidate.name}</h2><p>{candidate.position}</p><hr /><p><i className="bi bi-geo-alt" /> {candidate.location}</p><p><i className="bi bi-file-earmark-pdf" /> CV_{candidate.name.replace(' ', '_')}.pdf</p><p><i className="bi bi-file-earmark-text" /> Descriptor_de_cargo.pdf</p>{canAdvance && <button className="btn btn-aqua w-100" onClick={onAdvance}>{candidate.status === 'Informe enviado' ? 'Proceso finalizado' : 'Avanzar de etapa'} <i className="bi bi-arrow-right" /></button>}</div> }
function RequestForm({ onClose, onSubmit }) { return <div className="modal-backdrop-custom"><form className="request-form" onSubmit={onSubmit}><div className="d-flex justify-content-between"><h2>Nueva solicitud</h2><button type="button" className="btn-close" onClick={onClose} /></div><p>Registra un candidato que aprobó el filtro técnico preliminar.</p><label>Nombre<input name="name" required placeholder="Ej. Andrea Muñoz" /></label><label>Cargo<input name="position" required placeholder="Ej. Técnico Acuícola" /></label><label>Ubicación<select name="location"><option>Puerto Montt</option><option>Puerto Natales</option><option>Chiloé</option></select></label><button className="btn btn-aqua w-100" type="submit">Crear solicitud</button></form></div> }
function Metric({ value, label }) { return <article className="col-6 col-md-3"><div className="metric"><strong>{value}</strong><span>{label}</span></div></article> }
export default App
