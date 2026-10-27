import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BotonTema from '../components/BotonTema'
import { RUTA_INICIAL } from '../data/usuarios'
import { validarCredenciales } from '../utils/autenticacion'

// Página de inicio de sesión (ruta "/login") para el personal de AquaChile.
// "alIniciarSesion" guarda en App el usuario que entró.
function LoginPage({ modoOscuro, alCambiarTema, alIniciarSesion }) {
  // 1. Estados del formulario: lo que se escribe y el mensaje de error.
  const [datos, setDatos] = useState({ usuario: '', clave: '' })
  const [error, setError] = useState('')

  // 2. useNavigate permite cambiar de página desde el código.
  const navegar = useNavigate()

  // 3. Cada cambio actualiza solo el campo que se está escribiendo.
  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setDatos((actual) => ({ ...actual, [name]: value }))
    setError('')
  }

  // 4. Al enviar: validamos los campos y luego el usuario y la contraseña.
  function enviar(evento) {
    evento.preventDefault()

    if (!datos.usuario.trim() || !datos.clave) {
      setError('Ingresa tu usuario y tu contraseña.')
      return
    }

    const usuarioEncontrado = validarCredenciales(datos.usuario, datos.clave)
    if (!usuarioEncontrado) {
      setError('Usuario o contraseña incorrectos.')
      return
    }

    // 5. Si los datos son correctos, guardamos el usuario y vamos a su panel.
    alIniciarSesion(usuarioEncontrado)
    navegar(RUTA_INICIAL[usuarioEncontrado.rol])
  }

  return (
    <main className="role-screen">
      <BotonTema className="role-theme-toggle" modoOscuro={modoOscuro} alCambiar={alCambiarTema} />
      <section className="role-card login-card">
        <p className="tag">AquaChile · Personal interno</p>
        <h1>Iniciar sesión</h1>
        <p className="lead">Acceso solo para el equipo de Reclutamiento y los profesionales evaluadores.</p>

        <form className="login-form" onSubmit={enviar} noValidate>
          <label className="form-label fw-bold w-100">
            Usuario
            <input name="usuario" className="form-control" value={datos.usuario} onChange={cambiarCampo} autoComplete="username" />
          </label>

          <label className="form-label fw-bold w-100">
            Contraseña
            <input name="clave" type="password" className="form-control" value={datos.clave} onChange={cambiarCampo} autoComplete="current-password" />
          </label>

          {/* 6. Renderizado condicional: el error solo aparece si existe. */}
          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

          <button className="btn btn-aqua w-100" type="submit">
            Ingresar <i className="bi bi-box-arrow-in-right" />
          </button>
        </form>

        {/* 7. Usuarios de prueba para la demo (datos ficticios). */}
        <p className="role-note">
          <i className="bi bi-info-circle" /> Demo: <strong>analista</strong> o <strong>evaluador</strong>, contraseña <strong>aqua123</strong>.
        </p>
        <Link className="d-inline-block mt-3" to="/">Volver al inicio</Link>
      </section>
    </main>
  )
}

export default LoginPage
