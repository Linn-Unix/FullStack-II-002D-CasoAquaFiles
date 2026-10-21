import { Link, NavLink } from 'react-router-dom'

// 1. Enlaces del menú. Usamos un arreglo para recorrerlo con map().
const enlaces = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/postulacion', texto: 'Postulación' },
  { ruta: '/supervisor', texto: 'Supervisor' },
  { ruta: '/psicologo', texto: 'Psicología' },
]

// Este componente contiene la navegación principal.
function AppNavbar() {
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
          <div className="navbar-nav ms-auto">
            {/* 3. NavLink marca con la clase "active" el enlace de la página actual. */}
            {enlaces.map((enlace) => (
              <NavLink key={enlace.ruta} to={enlace.ruta} end className="nav-link">
                {enlace.texto}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AppNavbar