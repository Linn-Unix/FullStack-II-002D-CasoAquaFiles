import { Link } from 'react-router-dom'

// Página que se muestra cuando la ruta no existe (ruta "*").
function NoEncontradaPage() {
  return (
    <main className="container py-5">
      <div className="empty-state">
        <i className="bi bi-signpost-split" />
        <h2>Página no encontrada</h2>
        <p>La dirección que buscas no existe en AquaFiles.</p>
        <Link className="btn btn-aqua" to="/">Volver al inicio</Link>
      </div>
    </main>
  )
}

export default NoEncontradaPage