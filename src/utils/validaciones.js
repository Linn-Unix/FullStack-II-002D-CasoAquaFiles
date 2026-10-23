// Formatos de CV permitidos y tamaño máximo (5 MB).
const ALLOWED_CV_EXTENSIONS = ['pdf', 'doc', 'docx']
const MAX_CV_SIZE = 5 * 1024 * 1024

// 1. Valida un RUT chileno con el algoritmo del dígito verificador (módulo 11).
export function isValidRut(rut) {
  // 1.1- Quitamos puntos, guion y espacios. Ej: "12.345.678-5" → "123456785"
  const value = rut.replace(/[.\-\s]/g, '').toUpperCase()

  // 1.2- Debe tener 7 u 8 números seguidos de un dígito o K.
  if (!/^\d{7,8}[0-9K]$/.test(value)) return false

  const body = value.slice(0, -1) // números del RUT
  const verifier = value.slice(-1) // dígito verificador ingresado

  // 1.3- Multiplicamos cada número (de derecha a izquierda) por 2, 3, 4, 5, 6, 7 y se repite.
  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  // 1.4- Calculamos el dígito esperado: 11 → "0", 10 → "K".
  const result = 11 - (sum % 11)
  const expected = result === 11 ? '0' : result === 10 ? 'K' : String(result)

  return verifier === expected
}

// 2. Revisa que el correo tenga el formato texto@texto.dominio
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// 3. Valida todo el formulario de postulación.
//    Devuelve un objeto con los errores. Si está vacío {}, el formulario es válido.
export function validateApplication(values) {
  const errors = {}

  if (values.name.trim().length < 3) {
    errors.name = 'Ingresa tu nombre completo (mínimo 3 caracteres).'
  }
  if (!isValidRut(values.rut)) {
    errors.rut = 'Ingresa un RUT válido. Ej: 12.345.678-5'
  }
  if (!isValidEmail(values.email)) {
    errors.email = 'Ingresa un correo válido. Ej: nombre@correo.cl'
  }
  if (values.position.trim().length < 3) {
    errors.position = 'Indica el cargo al que postulas.'
  }

  // 3.1- El CV es obligatorio, debe ser PDF o Word y pesar máximo 5 MB.
  if (!values.cv) {
    errors.cv = 'Adjunta tu CV.'
  } else {
    const extension = values.cv.name.split('.').pop().toLowerCase()
    if (!ALLOWED_CV_EXTENSIONS.includes(extension)) {
      errors.cv = 'El CV debe ser PDF o Word (.pdf, .doc, .docx).'
    } else if (values.cv.size > MAX_CV_SIZE) {
      errors.cv = 'El CV no puede pesar más de 5 MB.'
    }
  }

  return errors
}

export function validarPostulacion(valores) {
  return validateApplication({
    name: valores.nombre,
    rut: valores.rut,
    email: valores.correo,
    position: valores.cargo,
    cv: valores.cv,
  })
}