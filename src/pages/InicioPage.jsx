import BotonRol from '../components/BotonRol'
import BotonTema from '../components/BotonTema'
import { ROLES } from '../data/roles'

// 1. Datos de cada rol. Se recorren con map() para crear las tarjetas.
const roles = [
  { rol: ROLES.POSTULANTE, ruta: '/postulacion', icono: 'bi-person-badge', titulo: 'Postulante / Candidato', texto: 'Registrar mis datos, adjuntar CV y consultar mi postulación.' },
  { rol: ROLES.SUPERVISOR, ruta: '/supervisor', icono: 'bi-shield-check', titulo: 'Supervisor Técnico', texto: 'Gestionar candidatos, filtro técnico y derivaciones.' },
  { rol: ROLES.PSICOLOGO, ruta: '/psicologo', icono: 'bi-clipboard2-pulse', titulo: 'Psicólogo/a', texto: 'Recibir dossiers, agendar entrevistas y cerrar informes.' },
]

// Página de inicio (ruta "/"): selección de rol.
function InicioPage({ modoOscuro, alCambiarTema, alElegirRol }) {
  return (
    <main className="role-screen">
      <BotonTema className="role-theme-toggle" modoOscuro={modoOscuro} alCambiar={alCambiarTema} />
      <section className="role-card">
        <p className="tag">Proyecto AquaFiles - FullStack II</p>
        <h1>Gestión Laboral</h1>
        <p className="lead">Selecciona tu rol para ingresar a la pantalla correspondiente.</p>
        <div className="role-options three-roles">
          {/* 2. {...rol} envía todas las propiedades del objeto como props. */}
          {roles.map(({ rol, ...datos }) => (
            <BotonRol key={rol} {...datos} alElegir={() => alElegirRol(rol)} />
          ))}
        </div>
        <p className="role-note">
          <i className="bi bi-lock-fill" /> Cada rol solo accede a la información que le corresponde.
        </p>
      </section>
    </main>
  )
}

export default InicioPage