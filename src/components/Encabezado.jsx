import { Link } from 'react-router-dom'
import BotonTema from './BotonTema'

// Encabezado de cada panel. El título y el subtítulo llegan por props.
function Encabezado({ titulo, subtitulo, modoOscuro, alCambiarTema }) {
  return (
    <header className="app-header">
      <div>
        <p className="tag">Proyecto AquaFiles - FullStack II</p>
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>
      <div className="header-actions">
        <BotonTema modoOscuro={modoOscuro} alCambiar={alCambiarTema} />
        {/* Link vuelve a la selección de rol (ruta "/"). */}
        <Link className="btn btn-outline-secondary" to="/">
          <i className="bi bi-box-arrow-right" /> Cambiar rol
        </Link>
      </div>
    </header>
  )
}

export default Encabezado