// useState permite guardar información que cambia mientras el usuario usa el formulario.
import { useState } from 'react'
import { CENTROS_COSTO, ESTADOS, FAMILIAS, UBICACIONES } from '../data/candidatos'
import { validarPostulacion } from '../utils/validaciones'

// Valores iniciales del formulario (vacío).
const formularioVacio = {
  nombre: '',
  rut: '',
  correo: '',
  familia: FAMILIAS[0],
  ubicacion: UBICACIONES[0],
  centroCosto: CENTROS_COSTO[0],
  cargo: '',
  cv: null,
}

// Recibe por props la función alEnviar, que viene del componente padre (App).
function FormularioPostulacion({ alEnviar }) {
  // 1. "valores" guarda lo que escribe el usuario en cada campo.
  const [valores, setValores] = useState(formularioVacio)

  // 2. "errores" guarda los mensajes de error de cada campo.
  const [errores, setErrores] = useState({})

  // 3. Evento onChange: se ejecuta cada vez que el usuario escribe o elige algo.
  function manejarCambio(evento) {
    const { name, value, files } = evento.target

    // 3.1- Copiamos los valores anteriores (...actual) y cambiamos solo el campo modificado.
    //      Si el campo es de archivo (files), guardamos el archivo. Si no, el texto.
    setValores((actual) => ({ ...actual, [name]: files ? files[0] ?? null : value }))

    // 3.2- Al corregir un campo, borramos su mensaje de error.
    setErrores((actual) => ({ ...actual, [name]: undefined }))
  }

  // 4. Evento onSubmit: se ejecuta al presionar "Enviar postulación".
  function manejarEnvio(evento) {
    // 4.1- Evita que la página se recargue (comportamiento normal de un form).
    evento.preventDefault()

    // 4.2- Validamos. Si hay errores, los mostramos y no enviamos.
    const nuevosErrores = validarPostulacion(valores)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    // 4.3- Si todo está bien, creamos el candidato y se lo enviamos al padre.
    alEnviar({
      id: Date.now(), // id único usando la fecha actual
      nombre: valores.nombre.trim(),
      rut: valores.rut.trim(),
      correo: valores.correo.trim(),
      cargo: valores.cargo.trim(),
      familia: valores.familia,
      ubicacion: valores.ubicacion,
      centroCosto: valores.centroCosto,
      estado: ESTADOS.REVISION, // toda postulación nueva parte en revisión técnica
      nombreCv: valores.cv.name,
      fechaEntrevista: '',
      informe: '',
    })
  }

  return (
    <section className="application-card">
      <p className="tag">POSTULACIÓN</p>
      <h2>Ingresa tus antecedentes</h2>
      <p>Completa tus datos y adjunta tu CV para iniciar la revisión técnica.</p>

      {/* noValidate desactiva la validación del navegador para usar la nuestra. */}
      <form onSubmit={manejarEnvio} className="application-form" noValidate>
        {/* 5. Inputs controlados: su valor viene del estado "valores". */}
        <label>
          Nombre completo
          <input name="nombre" value={valores.nombre} onChange={manejarCambio} className={errores.nombre ? 'is-invalid' : ''} placeholder="Ej. Andrea Muñoz" />
        </label>
        {/* 6. Renderizado condicional: el error solo aparece si existe. */}
        {errores.nombre && <span className="field-error">{errores.nombre}</span>}

        <div className="form-row">
          <label>
            RUT
            <input name="rut" value={valores.rut} onChange={manejarCambio} className={errores.rut ? 'is-invalid' : ''} placeholder="12.345.678-5" />
          </label>
          {errores.rut && <span className="field-error">{errores.rut}</span>}

          <label>
            Correo electrónico
            <input name="correo" type="email" value={valores.correo} onChange={manejarCambio} className={errores.correo ? 'is-invalid' : ''} placeholder="andrea@correo.cl" />
          </label>
          {errores.correo && <span className="field-error">{errores.correo}</span>}
        </div>

        <div className="form-row">
          <label>
            Familia de cargo
            <select name="familia" value={valores.familia} onChange={manejarCambio}>
              {/* 7. map() crea una opción por cada familia de cargo. */}
              {FAMILIAS.map((familia) => (
                <option key={familia}>{familia}</option>
              ))}
            </select>
          </label>
          <label>
            Ubicación
            <select name="ubicacion" value={valores.ubicacion} onChange={manejarCambio}>
              {UBICACIONES.map((ubicacion) => (
                <option key={ubicacion}>{ubicacion}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Centro de costos
          <select name="centroCosto" value={valores.centroCosto} onChange={manejarCambio}>
            {CENTROS_COSTO.map((centro) => (
              <option key={centro}>{centro}</option>
            ))}
          </select>
        </label>

        <label>
          Cargo al que postula
          <input name="cargo" value={valores.cargo} onChange={manejarCambio} className={errores.cargo ? 'is-invalid' : ''} placeholder="Ej. Técnico Acuícola" />
        </label>
        {errores.cargo && <span className="field-error">{errores.cargo}</span>}

        <label className={errores.cv ? 'upload-field is-invalid' : 'upload-field'}>
          <i className="bi bi-cloud-arrow-up" />{' '}
          {/* Si ya eligió un archivo, mostramos su nombre. */}
          {valores.cv ? valores.cv.name : 'Adjuntar CV (PDF o Word, máx. 5 MB)'}
          <input name="cv" type="file" accept=".pdf,.doc,.docx" onChange={manejarCambio} />
        </label>
        {errores.cv && <span className="field-error">{errores.cv}</span>}

        <button className="btn btn-aqua mt-3" type="submit">
          Enviar postulación <i className="bi bi-send" />
        </button>
      </form>
    </section>
  )
}

export default FormularioPostulacion