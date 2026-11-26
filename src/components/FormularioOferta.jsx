import { useState } from 'react'
import { FAMILIAS, UBICACIONES } from '../data/candidatos'
import { MODALIDADES } from '../data/ofertas'
import { ofertaVacia, prepararOferta, validarOferta } from '../utils/ofertas'

// Formulario para crear o editar una oferta.
// "oferta" trae los datos al editar; si no viene, el formulario parte vacío.
function FormularioOferta({ oferta, alGuardar, alCancelar, guardando = false }) {
  // 1. Al editar copiamos los datos de la oferta. Los números se guardan como texto en los inputs.
  const [valores, setValores] = useState(() =>
    oferta
      ? { ...ofertaVacia, ...oferta, cupos: String(oferta.cupos), sueldoMinimo: String(oferta.sueldoMinimo), sueldoMaximo: String(oferta.sueldoMaximo) }
      : ofertaVacia,
  )
  const [errores, setErrores] = useState({})

  function cambiar(evento) {
    const { name, value } = evento.target
    setValores((actual) => ({ ...actual, [name]: value }))
    setErrores((actual) => ({ ...actual, [name]: undefined }))
  }

  function enviar(evento) {
    evento.preventDefault()
    const nuevosErrores = validarOferta(valores)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return
    alGuardar(prepararOferta(valores))
  }

  // 2. Campo de texto largo reutilizable (descripción, funciones, requisitos y beneficios).
  function areaTexto(nombre, etiqueta, ayuda) {
    return (
      <div className="col-12">
        <label className="form-label fw-bold w-100">
          {etiqueta}
          <textarea name={nombre} rows="3" className={errores[nombre] ? 'form-control is-invalid' : 'form-control'} value={valores[nombre]} onChange={cambiar} placeholder={ayuda} />
        </label>
        {errores[nombre] && <span className="field-error">{errores[nombre]}</span>}
      </div>
    )
  }

  return (
    <form className="panel p-3 mb-4" onSubmit={enviar} noValidate>
      <h2 className="h5">{oferta ? 'Editar oferta' : 'Nueva oferta'}</h2>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-bold w-100">
            Cargo
            <input name="cargo" className={errores.cargo ? 'form-control is-invalid' : 'form-control'} value={valores.cargo} onChange={cambiar} placeholder="Ej. Técnico Acuícola" />
          </label>
          {errores.cargo && <span className="field-error">{errores.cargo}</span>}
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label fw-bold w-100">
            Categoría
            <select name="familia" className="form-select" value={valores.familia} onChange={cambiar}>
              {FAMILIAS.map((familia) => <option key={familia}>{familia}</option>)}
            </select>
          </label>
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label fw-bold w-100">
            Ubicación
            <select name="ubicacion" className="form-select" value={valores.ubicacion} onChange={cambiar}>
              {UBICACIONES.map((ubicacion) => <option key={ubicacion}>{ubicacion}</option>)}
            </select>
          </label>
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label fw-bold w-100">
            Modalidad
            <select name="modalidad" className="form-select" value={valores.modalidad} onChange={cambiar}>
              {MODALIDADES.map((modalidad) => <option key={modalidad.valor} value={modalidad.valor}>{modalidad.texto}</option>)}
            </select>
          </label>
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label fw-bold w-100">
            Cupos
            <input name="cupos" type="number" min="1" className={errores.cupos ? 'form-control is-invalid' : 'form-control'} value={valores.cupos} onChange={cambiar} />
          </label>
          {errores.cupos && <span className="field-error">{errores.cupos}</span>}
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label fw-bold w-100">
            Sueldo mínimo
            <input name="sueldoMinimo" type="number" min="0" className={errores.sueldoMinimo ? 'form-control is-invalid' : 'form-control'} value={valores.sueldoMinimo} onChange={cambiar} placeholder="850000" />
          </label>
          {errores.sueldoMinimo && <span className="field-error">{errores.sueldoMinimo}</span>}
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label fw-bold w-100">
            Sueldo máximo
            <input name="sueldoMaximo" type="number" min="0" className={errores.sueldoMaximo ? 'form-control is-invalid' : 'form-control'} value={valores.sueldoMaximo} onChange={cambiar} placeholder="1100000" />
          </label>
          {errores.sueldoMaximo && <span className="field-error">{errores.sueldoMaximo}</span>}
        </div>
        {areaTexto('descripcion', 'Descripción', 'Resumen del cargo y del equipo.')}
        {areaTexto('funciones', 'Funciones principales', 'Una por línea o separadas por punto.')}
        {areaTexto('requisitos', 'Requisitos', 'Estudios, experiencia y licencias.')}
        {areaTexto('beneficios', 'Beneficios', 'Seguros, bonos, turnos, etc.')}
      </div>
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-aqua" type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar oferta'}
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  )
}

export default FormularioOferta
