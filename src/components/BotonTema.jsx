// Botón para cambiar entre modo claro y oscuro.
// Recibe por props el estado actual (modoOscuro) y la función que lo cambia (alCambiar).
function BotonTema({ modoOscuro, alCambiar, className = '' }) {
  return (
    <button className={`theme-toggle ${className}`} type="button" onClick={alCambiar}>
      {/* Renderizado condicional: cambia el ícono y el texto según el modo. */}
      <i className={`bi ${modoOscuro ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`} />{' '}
      {modoOscuro ? 'Modo claro' : 'Modo oscuro'}
    </button>
  )
}

export default BotonTema