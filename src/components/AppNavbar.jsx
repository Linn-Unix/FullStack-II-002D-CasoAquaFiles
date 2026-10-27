import { Link, NavLink } from 'react-router-dom'
import { NOMBRES_ROL, ROLES } from '../data/roles'

// 1. Enlaces del menú. Cada enlace indica qué rol lo puede ver.
const enlaces = [
  { ruta: '/postulacion', texto: 'Mi postulación', rol: ROLES.POSTULANTE },
  { ruta: '/supervisor', texto: 'Panel supervisor', rol: ROLES.SUPERVISOR },
  { ruta: '/psicologo', texto: 'Panel psicolaboral', rol: ROLES.PSICOLOGO },
]

// Navegación principal. Recibe por props el rol actual.
function AppNavbar({ rol }) {
  // 2. filter() deja solo el enlace que corresponde al rol actual.
  const enlacesVisibles = enlaces.filter((enlace) => enlace.rol === rol)

  return (
    <nav className="navbar navbar-expand-lg navbar-aqua" data-bs-theme="dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          AquaFiles
        </Link>

        {/* 3. Este botón aparece cuando la pantalla es pequeña y abre/cierra el menú. */}
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

            {/* 4. NavLink marca con la clase "active" el enlace de la página actual. */}
            {enlacesVisibles.map((enlace) => (
              <NavLink key={enlace.ruta} to={enlace.ruta} end className="nav-link">
                {enlace.texto}
              </NavLink>
            ))}

            {/* 5. Renderizado condicional: solo mostramos el rol si hay uno elegido. */}
            {rol && <span className="badge rounded-pill text-bg-light ms-lg-2">Rol: {NOMBRES_ROL[rol]}</span>}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AppNavbar
