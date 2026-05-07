import type {
  ActualizarClienteInput,
  ClienteFilters,
  CrearClienteInput,
} from '../types/cliente.types.js'

const CLIENTE_LIMIT_DEFAULT = 10
const CLIENTE_LIMIT_MAX = 100

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

export const validateCreateClienteInput = (
  body: unknown,
): { value?: CrearClienteInput; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { error: 'Payload invalido' }
  }

  const { nombre, telefono } = body as Record<string, unknown>

  if (!isNonEmptyString(nombre)) {
    return { error: 'nombre es requerido' }
  }

  if (nombre.trim().length > 100) {
    return { error: 'nombre no debe exceder los 100 caracteres' }
  }

  const value: CrearClienteInput = {
    nombre: nombre.trim(),
  }

  if (telefono !== undefined) {
    if (!isNonEmptyString(telefono)) {
      return { error: 'telefono debe ser un texto no vacio' }
    }

    if (telefono.trim().length > 20) {
      return { error: 'telefono no debe exceder los 20 caracteres' }
    }

    value.telefono = telefono.trim()
  }

  return { value }
}

export const validateUpdateClienteInput = (
  body: unknown,
): { value?: ActualizarClienteInput; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { error: 'Payload invalido' }
  }

  const { nombre, telefono } = body as Record<string, unknown>

  const value: ActualizarClienteInput = {}

  if (nombre !== undefined) {
    if (!isNonEmptyString(nombre)) {
      return { error: 'nombre debe ser un texto no vacio' }
    }

    if (nombre.trim().length > 100) {
      return { error: 'nombre no debe exceder los 100 caracteres' }
    }

    value.nombre = nombre.trim()
  }

  if (telefono !== undefined) {
    if (!isNonEmptyString(telefono)) {
      return { error: 'telefono debe ser un texto no vacio' }
    }

    if (telefono.trim().length > 20) {
      return { error: 'telefono no debe exceder los 20 caracteres' }
    }

    value.telefono = telefono.trim()
  }

  if (Object.keys(value).length === 0) {
    return { error: 'Debe enviar al menos un campo valido para actualizar' }
  }

  return { value }
}

export const validateClienteFilters = (
  query: Record<string, unknown>,
): { value?: ClienteFilters; error?: string } => {
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
      : CLIENTE_LIMIT_DEFAULT

  if (!Number.isInteger(page) || page <= 0) {
    return { error: 'page debe ser un entero mayor a 0' }
  }

  if (!Number.isInteger(limit) || limit <= 0 || limit > CLIENTE_LIMIT_MAX) {
    return {
      error: `limit debe ser un entero entre 1 y ${CLIENTE_LIMIT_MAX}`,
    }
  }

  if (
    rawSearch !== undefined &&
    (typeof rawSearch !== 'string' || rawSearch.trim() === '')
  ) {
    return { error: 'search debe ser un texto no vacio' }
  }

  const value: ClienteFilters = {
    page,
    limit,
  }

  if (typeof rawSearch === 'string' && rawSearch.trim() !== '') {
    value.search = rawSearch.trim()
  }

  return { value }
}

export const validateClienteId = (
  rawId: string,
): { value?: number; error?: string } => {
  const id = Number.parseInt(rawId, 10)

  if (!Number.isInteger(id) || id <= 0) {
    return { error: 'id invalido' }
  }

  return { value: id }
}
