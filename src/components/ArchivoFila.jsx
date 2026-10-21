// Muestra un archivo del candidato (CV o informe). Recibe el nombre y el ícono por props.
function ArchivoFila({ nombre, icono }) {
  return (
    <div className="private-file">
      <i className={`bi ${icono}`} />
      <div>
        <strong>{nombre}</strong>
        <small>Documento registrado en AquaFiles</small>
      </div>
    </div>
  )
}

export default ArchivoFila