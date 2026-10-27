import { Link, NavLink, useNavigate } from 'react-router-dom'
import { NOMBRES_ROL, ROLES } from '../data/roles'

// 1. Enlaces del menú. Cada enlace indica qué rol lo puede ver.
const enlaces = [
  { ruta: '/postulacion', texto: 'Mi postulación', rol: ROLES.POSTULANTE },
  { ruta: '/supervisor', texto: 'Reclutamiento', rol: ROLES.SUPERVISOR },
  { ruta: '/dashboard', texto: 'Dashboard', rol: ROLES.SUPERVISOR },
  { ruta: '/psicologo', texto: 'Evaluaciones', rol: ROLES.PSICOLOGO },
]

// Navegación principal. Recibe por props el rol, el nombre del usuario y la función para salir.
function AppNavbar({ rol, nombreUsuario, alCerrarSesion }) {
  const navegar = useNavigate()

  // 2. filter() deja solo el enlace que corresponde al rol actual.
  const enlacesVisibles = enlaces.filter((enlace) => enlace.rol === rol)

  // 3. Al salir borramos la sesión en App y volvemos al inicio.
  function cerrarSesion() {
    alCerrarSesion()
    navegar('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-aqua" data-bs-theme="dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          AquaFiles
        </Link>

        {/* 4. Este botón aparece cuando la pantalla es pequeña y abre/cierra el menú. */}
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

            {/* 5. NavLink marca con la clase "active" el enlace de la página actual. */}
            {enlacesVisibles.map((enlace) => (
              <NavLink key={enlace.ruta} to={enlace.ruta} end className="nav-link">
                {enlace.texto}
              </NavLink>
            ))}

            {/* 6. Renderizado condicional: solo mostramos el usuario y "Cerrar sesión" si alguien entró. */}
            {rol && (
              <>
                <span className="badge rounded-pill text-bg-light ms-lg-2">
                  {nombreUsuario ? `${nombreUsuario} · ` : ''}{NOMBRES_ROL[rol]}
                </span>
                <button className="btn btn-outline-light btn-sm ms-lg-2 mt-2 mt-lg-0" type="button" onClick={cerrarSesion}>
                  <i className="bi bi-box-arrow-right" /> Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AppNavbar
