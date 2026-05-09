import type {
  ActualizarPrecioInput,
  CrearPrecioInput,
  PrecioFilters,
} from '../types/precio.types.js'

const PRECIO_LIMIT_DEFAULT = 10
const PRECIO_LIMIT_MAX = 100

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

export const validatePrecioFilters = (
  query: Record<string, unknown>,
): { value?: PrecioFilters; error?: string } => {
  const rawPage = query.page
  const rawLimit = query.limit
  const rawSearch = query.search

  const page =
    typeof rawPage === 'string' && rawPage.trim() !== ''
      ? Number.parseInt(rawPage, 10)
      : 1
  const limit =
    typeof rawLimit === 'string' && rawLimit.trim() !== ''
      ? Number.parseInt(rawLimit, 10)
      : PRECIO_LIMIT_DEFAULT

  if (!Number.isInteger(page) || page <= 0) {
    return { error: 'page debe ser un entero mayor a 0' }
  }

  if (!Number.isInteger(limit) || limit <= 0 || limit > PRECIO_LIMIT_MAX) {
    return {
      error: `limit debe ser un entero entre 1 y ${PRECIO_LIMIT_MAX}`,
    }
  }

  if (
    rawSearch !== undefined &&
    (typeof rawSearch !== 'string' || rawSearch.trim() === '')
  ) {
    return { error: 'search debe ser un texto no vacio' }
  }

  const value: PrecioFilters = {
    page,
    limit,
  }

  if (typeof rawSearch === 'string' && rawSearch.trim() !== '') {
    value.search = rawSearch.trim()
  }

  return { value }
}
