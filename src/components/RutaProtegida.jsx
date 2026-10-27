import { Link } from 'react-router-dom'

// Protege una página: solo la muestra si el rol actual tiene permiso.
// "children" es la página que va dentro de <RutaProtegida> ... </RutaProtegida>.
function RutaProtegida({ rolActual, rolesPermitidos, children }) {
  // 1. includes() revisa si el rol actual está en la lista de roles permitidos.
  if (rolesPermitidos.includes(rolActual)) {
    return children
  }
  // 2. Si no tiene permiso, mostramos un aviso en vez de la información.
  // 2. Si no tiene permiso, mostramos un aviso en vez de la información.
  return (
    <main className="container py-5">
      <div className="empty-state">
        <i className="bi bi-shield-lock" />
        <h2>Acceso restringido</h2>
        <p>
          {rolActual
            ? 'Tu rol no tiene permiso para ver esta información.'
            : 'Primero selecciona tu rol para ingresar.'}
        </p>
        <Link className="btn btn-aqua" to="/">Elegir rol</Link>
      </div>
    </main>
  )
}

export default RutaProtegida
