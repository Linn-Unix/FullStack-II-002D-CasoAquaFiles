import { useState } from 'react'
import { esRutValido, limpiarRut } from '../utils/validaciones'

// Permite al postulante volver a ver su postulación ingresando su RUT.
// Recibe la lista de candidatos y la función que se llama al encontrarlo.
function ConsultaPostulacion({ candidatos, alEncontrar }) {
  // 1. Estados: el RUT escrito y el mensaje de error.
  const [rut, setRut] = useState('')
  const [mensaje, setMensaje] = useState('')

  // 2. Al enviar, validamos el RUT y lo buscamos en la lista.
  function consultar(evento) {
    evento.preventDefault()

    if (!esRutValido(rut)) {
      setMensaje('Ingresa un RUT válido. Ej: 12.345.678-5')
      return
    }

    // 2.1- find() devuelve el primer candidato con ese RUT (o undefined si no existe).
    //      Comparamos los RUT sin puntos ni guion para aceptar ambos formatos.
    const encontrado = candidatos.find((candidato) => limpiarRut(candidato.rut) === limpiarRut(rut))

    if (!encontrado) {
      setMensaje('No encontramos una postulación con ese RUT.')
      return
    }

    setMensaje('')
    alEncontrar(encontrado.id)
  }

  return (
    <section className="application-card mb-4">
      <p className="tag">¿YA POSTULASTE?</p>
      <h2>Consulta el estado de tu postulación</h2>
      <form onSubmit={consultar} className="d-flex flex-column flex-md-row gap-2 mt-3" noValidate>
        <label className="visually-hidden" htmlFor="rut-consulta">RUT de tu postulación</label>
        <input
          id="rut-consulta"
          className={mensaje ? 'form-control is-invalid' : 'form-control'}
          value={rut}
          onChange={(evento) => setRut(evento.target.value)}
          placeholder="12.345.678-5"
        />
        <button className="btn btn-aqua text-nowrap" type="submit">
          Consultar <i className="bi bi-search" />
        </button>
      </form>
      {/* 3. Renderizado condicional: el mensaje solo aparece si hay un error. */}
      {mensaje && <span className="field-error mt-2">{mensaje}</span>}
    </section>
  )
}

export default ConsultaPostulacion