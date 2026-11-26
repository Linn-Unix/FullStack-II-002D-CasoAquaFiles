import { useEffect, useState } from 'react'
import { descargarArchivo, listarArchivos } from '../services/archivosService'
import { leerSesion } from '../services/sesion'
import ArchivoFila from './ArchivoFila'

// Archivos privados de un candidato, con la carpeta donde quedaron y un botón para descargarlos.
// Sin sesión (modo demostración) solo muestra el nombre del CV.
function ArchivosCandidato({ candidatoId, nombreCv }) {
  const conSesion = Boolean(leerSesion()?.token) && Number.isInteger(candidatoId)
  const [archivos, setArchivos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!conSesion) return
    let vigente = true
    listarArchivos(candidatoId)
      .then((datos) => vigente && setArchivos(datos))
      .catch((errorApi) => vigente && setError(errorApi.message))
    return () => {
      vigente = false
    }
  }, [candidatoId, conSesion])

  async function descargar(archivo) {
    setError('')
    try {
      await descargarArchivo(archivo)
    } catch (errorApi) {
      setError(errorApi.message)
    }
  }

  if (!conSesion || (archivos.length === 0 && !error)) {
    return <ArchivoFila nombre={nombreCv || 'Sin CV adjunto'} icono="bi-file-earmark-pdf" />
  }

  return (
    <div>
      {error && <small className="d-block text-danger mb-2">{error}</small>}
      {archivos.map((archivo) => (
        <div key={archivo.id} className="private-file justify-content-between">
          <div className="d-flex gap-2">
            <i className={`bi ${archivo.categoria === 'INFORME' ? 'bi-file-earmark-text' : 'bi-file-earmark-pdf'}`} />
            <div>
              <strong>{archivo.nombreOriginal}</strong>
              <small>{archivo.categoria === 'INFORME' ? 'Informe psicolaboral' : 'CV'}{archivo.carpeta ? ` · Carpeta ${archivo.carpeta}` : ''}</small>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => descargar(archivo)}>
            <i className="bi bi-download" /> Descargar <span className="visually-hidden">{archivo.nombreOriginal}</span>
          </button>
        </div>
      ))}
    </div>
  )
}

export default ArchivosCandidato
