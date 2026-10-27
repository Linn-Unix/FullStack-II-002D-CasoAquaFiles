import { Link } from 'react-router-dom'

// Protege una página: solo la muestra si el rol actual tiene permiso.
// "children" es la página que va dentro de <RutaProtegida> ... </RutaProtegida>.
function RutaProtegida({ rolActual, rolesPermitidos, children }) {
  // 1. includes() revisa si el rol actual está en la lista de roles permitidos.
  if (rolesPermitidos.includes(rolActual)) {
    return children
  }

  // 2. Si no tiene permiso, mostramos un aviso en vez de la información.
  return (
    <main className="container py-5">
      <div className="empty-state">
        <i className="bi bi-shield-lock" />
        <h2>Acceso restringido</h2>
        <p>
          {rolActual
            ? 'Tu rol no tiene permiso para ver esta información.'
            : 'Debes iniciar sesión para ver esta información.'}
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <Link className="btn btn-aqua" to="/login">Iniciar sesión</Link>
          <Link className="btn btn-outline-secondary" to="/">Volver al inicio</Link>
        </div>
      </div>
    </main>
  )
}

export default RutaProtegida
