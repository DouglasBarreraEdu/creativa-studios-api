import type {
  ActualizarPrecioInput,
  CrearPrecioInput,
} from '../types/precio.types.js'

const parsePositiveInteger = (
  value: unknown,
  fieldName: string,
): number | string => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return `${fieldName} debe ser un entero mayor a 0`
  }

  return value
}

const parseNonNegativeNumber = (
  value: unknown,
  fieldName: string,
): number | string => {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return `${fieldName} debe ser un número mayor o igual a 0`
  }

  return value
}

export const validateCreatePrecioInput = (
  body: unknown,
): { value?: CrearPrecioInput; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { error: 'Payload invalido' }
  }

  const { id_producto, margen_ganancia } = body as Record<string, unknown>

  const parsedProductoId = parsePositiveInteger(id_producto, 'id_producto')

  if (typeof parsedProductoId === 'string') {
    return { error: parsedProductoId }
  }

  const parsedMargenGanancia = parseNonNegativeNumber(
    margen_ganancia,
    'margen_ganancia',
  )

  if (typeof parsedMargenGanancia === 'string') {
    return { error: parsedMargenGanancia }
  }

  return {
    value: {
      id_producto: parsedProductoId,
      margen_ganancia: parsedMargenGanancia,
    },
  }
}

export const validateUpdatePrecioInput = (
  body: unknown,
): { value?: ActualizarPrecioInput; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { error: 'Payload invalido' }
  }

  const { margen_ganancia } = body as Record<string, unknown>

  const parsedMargenGanancia = parseNonNegativeNumber(
    margen_ganancia,
    'margen_ganancia',
  )

  if (typeof parsedMargenGanancia === 'string') {
    return { error: parsedMargenGanancia }
  }

  return {
    value: {
      margen_ganancia: parsedMargenGanancia,
    },
  }
}

export const validatePrecioProductoId = (
  rawId: string,
): { value?: number; error?: string } => {
  const id = Number.parseInt(rawId, 10)

  if (!Number.isInteger(id) || id <= 0) {
    return { error: 'id_producto invalido' }
  }

  return { value: id }
}
