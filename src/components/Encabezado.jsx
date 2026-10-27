import BotonTema from './BotonTema'

// Encabezado de cada panel. El título y el subtítulo llegan por props.
// Para salir se usa el botón "Cerrar sesión" del menú.
function Encabezado({ titulo, subtitulo, modoOscuro, alCambiarTema }) {
  return (
    <header className="app-header">
      <div>
        <p className="tag">AquaChile · Gestión Laboral</p>
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>
      <div className="header-actions">
        <BotonTema modoOscuro={modoOscuro} alCambiar={alCambiarTema} />
      </div>
    </header>
  )
}

export default Encabezado
