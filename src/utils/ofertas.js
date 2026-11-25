import { FAMILIAS, UBICACIONES } from '../data/candidatos'

// 1. Oferta vacía para el formulario de "Nueva oferta".
export const ofertaVacia = {
  cargo: '',
  familia: FAMILIAS[0],
  ubicacion: UBICACIONES[0],
  modalidad: 'PRESENCIAL',
  cupos: '1',
  descripcion: '',
  funciones: '',
  requisitos: '',
  beneficios: '',
  sueldoMinimo: '',
  sueldoMaximo: '',
}

// 2. Valida la oferta y devuelve un objeto con un mensaje por cada campo con error.
export function validarOferta(valores) {
  const errores = {}
  const cupos = Number(valores.cupos)
  const minimo = Number(valores.sueldoMinimo)
  const maximo = Number(valores.sueldoMaximo)

  if (valores.cargo.trim().length < 3) errores.cargo = 'El cargo debe tener al menos 3 caracteres.'
  if (!Number.isInteger(cupos) || cupos < 1 || cupos > 100) errores.cupos = 'Ingresa entre 1 y 100 cupos.'
  if (!valores.descripcion.trim()) errores.descripcion = 'Escribe una descripción.'
  if (!valores.funciones.trim()) errores.funciones = 'Escribe las funciones principales.'
  if (!valores.requisitos.trim()) errores.requisitos = 'Escribe los requisitos.'
  if (!valores.beneficios.trim()) errores.beneficios = 'Escribe los beneficios.'
  if (valores.sueldoMinimo === '' || minimo < 0) errores.sueldoMinimo = 'Ingresa el sueldo mínimo.'
  if (valores.sueldoMaximo === '' || maximo < 0) {
    errores.sueldoMaximo = 'Ingresa el sueldo máximo.'
  } else if (maximo < minimo) {
    errores.sueldoMaximo = 'El sueldo máximo no puede ser menor que el mínimo.'
  }

  return errores
}

// 3. Convierte los valores del formulario al formato que recibe el backend.
export function prepararOferta(valores) {
  return {
    ...valores,
    cargo: valores.cargo.trim(),
    cupos: Number(valores.cupos),
    sueldoMinimo: Number(valores.sueldoMinimo),
    sueldoMaximo: Number(valores.sueldoMaximo),
  }
}

// 4. Ej: 850000 y 1100000 → "$850.000 – $1.100.000"
export function formatearSueldo(minimo, maximo) {
  const formato = (valor) => `$${Number(valor).toLocaleString('es-CL')}`
  return minimo === maximo ? formato(minimo) : `${formato(minimo)} – ${formato(maximo)}`
}

// 5. Separa un texto en líneas o frases para mostrarlo como lista.
//    Ej: "Revisar jaulas. Registrar datos." → ["Revisar jaulas", "Registrar datos"]
export function separarEnLista(texto) {
  return (texto ?? '')
    .split(/\n|\.\s+/)
    .map((parte) => parte.replace(/\.$/, '').trim())
    .filter(Boolean)
}
