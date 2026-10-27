// Formatos de CV permitidos y tamaño máximo (5 MB).
const EXTENSIONES_CV = ['pdf', 'doc', 'docx']
const TAMANO_MAXIMO_CV = 5 * 1024 * 1024

// 0. Quita puntos, guion y espacios de un RUT. Ej: "12.345.678-5" → "123456785"
//    Sirve para comparar RUT escritos con o sin formato.
export function limpiarRut(rut) {
  return rut.replace(/[.\-\s]/g, '').toUpperCase()
}

// 1. Valida un RUT chileno con el algoritmo del dígito verificador (módulo 11).
export function esRutValido(rut) {
  // 1.1- Dejamos solo números y el dígito verificador.
  const valor = limpiarRut(rut)

  // 1.2- Debe tener 7 u 8 números seguidos de un dígito o K.
  if (!/^\d{7,8}[0-9K]$/.test(valor)) return false

  const cuerpo = valor.slice(0, -1) // números del RUT
  const digitoIngresado = valor.slice(-1) // dígito verificador escrito por el usuario

  // 1.3- Multiplicamos cada número (de derecha a izquierda) por 2, 3, 4, 5, 6, 7 y se repite.
  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  // 1.4- Calculamos el dígito esperado: 11 → "0", 10 → "K".
  const resultado = 11 - (suma % 11)
  const digitoEsperado = resultado === 11 ? '0' : resultado === 10 ? 'K' : String(resultado)

  return digitoIngresado === digitoEsperado
}

// 2. Revisa que el correo tenga el formato texto@texto.dominio
export function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
}

export function esTelefonoValido(telefono) {
  const valor = (telefono ?? '').replace(/\s/g, '')
  return /^\+56(?:9|2)\d{8}$/.test(valor)
}

// 3. Valida todo el formulario de postulación.
//    Devuelve un objeto con los errores. Si está vacío {}, el formulario es válido.
export function validarPostulacion(valores) {
  const errores = {}

  if (valores.nombre.trim().length < 3) {
    errores.nombre = 'Ingresa tu nombre completo (mínimo 3 caracteres).'
  }
  if (!esRutValido(valores.rut)) {
    errores.rut = 'Ingresa un RUT válido. Ej: 12.345.678-5'
  }
  if (!esCorreoValido(valores.correo)) {
    errores.correo = 'Ingresa un correo válido. Ej: nombre@correo.cl'
  }
  if (!esTelefonoValido(valores.telefono)) {
    errores.telefono = 'Ingresa un teléfono válido. Ej: +56 9 1234 5678'
  }
  if (valores.cargo.trim().length < 3) {
    errores.cargo = 'Indica el cargo al que postulas.'
  }

  // 3.1- El CV es obligatorio, debe ser PDF o Word y pesar máximo 5 MB.
  if (!valores.cv) {
    errores.cv = 'Adjunta tu CV.'
  } else {
    const extension = valores.cv.name.split('.').pop().toLowerCase()
    if (!EXTENSIONES_CV.includes(extension)) {
      errores.cv = 'El CV debe ser PDF o Word (.pdf, .doc, .docx).'
    } else if (valores.cv.size > TAMANO_MAXIMO_CV) {
      errores.cv = 'El CV no puede pesar más de 5 MB.'
    }
  }

  return errores
}