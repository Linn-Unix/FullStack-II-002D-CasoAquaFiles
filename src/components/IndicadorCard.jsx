// Tarjeta de indicador. Recibe por props el número (valor) y su descripción (titulo).
function IndicadorCard({ valor, titulo }) {
  return (
    <div className="col-6 col-md-3">
      <div className="metric">
        <strong>{valor}</strong>
        <span>{titulo}</span>
      </div>
    </div>
  )
}

export default IndicadorCard