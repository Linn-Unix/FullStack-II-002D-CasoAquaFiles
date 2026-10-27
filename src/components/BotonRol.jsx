import { Link } from 'react-router-dom'

// Tarjeta de rol en la pantalla de inicio.
// "ruta" es la página a la que lleva y "alElegir" guarda el rol elegido en App.
function BotonRol({ icono, titulo, texto, ruta, alElegir }) {
  return (
    <Link to={ruta} onClick={alElegir}>
      <span className="role-icon">
        <i className={`bi ${icono}`} />
      </span>
      <strong>{titulo}</strong>
      <small>{texto}</small>
      <span className="role-action">
        Ingresar <i className="bi bi-arrow-right" />
      </span>
    </Link>
  )
}

export default BotonRol