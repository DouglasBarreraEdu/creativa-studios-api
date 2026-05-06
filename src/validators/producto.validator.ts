import type {
  ActualizarProductoInput,
  CrearProductoInput,
  ProductoFilters,
} from '../types/producto.types.js'

const PRODUCTO_LIMIT_DEFAULT = 10
const PRODUCTO_LIMIT_MAX = 100

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const parseNonNegativeInteger = (
  value: unknown,
  fieldName: string,
): number | string => {
  if (typeof value !== 'number' || value < 0) {
    return `${fieldName} debe ser un número mayor o igual a 0`
  }

  return value
}

export const validateCreateProductoInput = (
  body: unknown,
): { value?: CrearProductoInput; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { error: 'Payload invalido' }
  }

  const {
    nombre,
    tipo,
    costo_base = 0,
    codigo,
    id_insumo_inventario,
  } = body as Record<string, unknown>

  if (!isNonEmptyString(nombre)) {
    return { error: 'nombre es requerido' }
  }

  if (!isNonEmptyString(tipo)) {
    return { error: 'tipo es requerido' }
  }

  const parsedcosto_base = parseNonNegativeInteger(costo_base, 'costo_base')

  if (typeof parsedcosto_base === 'string') {
    return { error: parsedcosto_base }
  }

  if (!isNonEmptyString(codigo)) {
    return { error: 'tipo es requerido' }
  }

  const parsedid_insumo_inventario = parseNonNegativeInteger(
    id_insumo_inventario,
    'id_insumo_inventario',
  )

  if (typeof parsedid_insumo_inventario === 'string') {
    return { error: parsedid_insumo_inventario }
  }

  return {
    value: {
      nombre: nombre.trim(),
      tipo: tipo.trim(),
      costo_base: parsedcosto_base,
      codigo: codigo.trim(),
      id_insumo_inventario: parsedid_insumo_inventario,
    },
  }
}

export const validateUpdateProductoInput = (
  body: unknown,
): { value?: ActualizarProductoInput; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { error: 'Payload invalido' }
  }

  const { nombre, tipo, costo_base, codigo, id_insumo_inventario } =
    body as Record<string, unknown>

  const value: ActualizarProductoInput = {}

  if (nombre !== undefined) {
    if (!isNonEmptyString(nombre)) {
      return { error: 'nombre debe ser un texto no vacio' }
    }
    value.nombre = nombre.trim()
  }

  if (tipo !== undefined) {
    if (!isNonEmptyString(tipo)) {
      return { error: 'tipo debe ser un texto no vacio' }
    }
    value.tipo = tipo.trim()
  }

  if (costo_base !== undefined) {
    const parsedcosto_base = parseNonNegativeInteger(costo_base, 'costo_base')
    if (typeof parsedcosto_base === 'string') {
      return { error: parsedcosto_base }
    }
    value.costo_base = parsedcosto_base
  }

  if (codigo !== undefined) {
    if (!isNonEmptyString(codigo)) {
      return { error: 'codigo debe ser un texto no vacio' }
    }
    value.codigo = codigo.trim()
  }

  if (id_insumo_inventario !== undefined) {
    const parsedid_insumo_inventario = parseNonNegativeInteger(
      id_insumo_inventario,
      'id_insumo_inventario',
    )
    if (typeof parsedid_insumo_inventario === 'string') {
      return { error: parsedid_insumo_inventario }
    }
    value.id_insumo_inventario = parsedid_insumo_inventario
  }

  if (Object.keys(value).length === 0) {
    return { error: 'Debe enviar al menos un campo valido para actualizar' }
  }

  return { value }
}

export const validateProductoFilters = (
  query: Record<string, unknown>,
): { value?: ProductoFilters; error?: string } => {
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
      : PRODUCTO_LIMIT_DEFAULT

  if (!Number.isInteger(page) || page <= 0) {
    return { error: 'page debe ser un entero mayor a 0' }
  }

  if (!Number.isInteger(limit) || limit <= 0 || limit > PRODUCTO_LIMIT_MAX) {
    return {
      error: `limit debe ser un entero entre 1 y ${PRODUCTO_LIMIT_MAX}`,
    }
  }

  if (
    rawSearch !== undefined &&
    (typeof rawSearch !== 'string' || rawSearch.trim() === '')
  ) {
    return { error: 'search debe ser un texto no vacio' }
  }

  const value: ProductoFilters = {
    page,
    limit,
  }

  if (typeof rawSearch === 'string' && rawSearch.trim() !== '') {
    value.search = rawSearch.trim()
  }

  return { value }
}

export const validateProductoId = (
  rawId: string,
): { value?: number; error?: string } => {
  const id = Number.parseInt(rawId, 10)

  if (!Number.isInteger(id) || id <= 0) {
    return { error: 'id invalido' }
  }

  return { value: id }
}
