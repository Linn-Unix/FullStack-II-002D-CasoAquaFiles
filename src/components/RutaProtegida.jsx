import { Link } from 'react-router-dom'

function RutaProtegida({ rolActual, rolesPermitidos, children }) {
  if (rolesPermitidos.includes(rolActual)) return children

  return (
    <main className="container py-5">
      <div className="empty-state">
        <i className="bi bi-shield-lock" />
        <h2>Acceso restringido</h2>
        <p>{rolActual ? 'Tu rol no tiene permiso para ver esta información.' : 'Primero selecciona tu rol para ingresar.'}</p>
        <Link className="btn btn-aqua" to="/">Elegir rol</Link>
      </div>
    </main>
  )
}

export default RutaProtegida
