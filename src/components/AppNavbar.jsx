import { Link, NavLink } from 'react-router-dom'
import { NOMBRES_ROL, ROLES } from '../data/roles'

// 1. Enlaces del menú. Usamos un arreglo para recorrerlo con map().
const enlaces = [
  { ruta: '/postulacion', texto: 'Mi postulación', rol: ROLES.POSTULANTE },
  { ruta: '/supervisor', texto: 'Reclutamiento', rol: ROLES.SUPERVISOR },
  { ruta: '/dashboard', texto: 'Dashboard', rol: ROLES.SUPERVISOR },
  { ruta: '/psicologo', texto: 'Evaluaciones', rol: ROLES.PSICOLOGO },
]

// Este componente contiene la navegación principal.
function AppNavbar({ rol }) {
  const enlacesVisibles = enlaces.filter((enlace) => enlace.rol === rol)

  return (
    <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          AquaFiles
        </Link>

        {/* 2. Este botón aparece cuando la pantalla es pequeña y abre/cierra el menú. */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuPrincipal"
          aria-controls="menuPrincipal"
          aria-expanded="false"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="menuPrincipal">
          <div className="navbar-nav ms-auto align-items-lg-center">
            <NavLink to="/" end className="nav-link">Inicio</NavLink>
            {enlacesVisibles.map((enlace) => (
              <NavLink key={enlace.ruta} to={enlace.ruta} end className="nav-link">
                {enlace.texto}
              </NavLink>
            ))}
            {rol && <span className="badge rounded-pill text-bg-light ms-lg-2">Rol: {NOMBRES_ROL[rol]}</span>}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AppNavbar