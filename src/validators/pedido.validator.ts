import type {
  ActualizarEstadoPedidoInput,
  ActualizarPedidoInput,
  CrearPedidoInput,
  PedidoEstado,
  PedidoFilters,
} from '../types/pedido.types.js'
import { PEDIDO_ESTADOS } from '../types/pedido.types.js'

const PEDIDO_LIMIT_DEFAULT = 10
const PEDIDO_LIMIT_MAX = 100

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const parsePositiveInteger = (
  value: unknown,
  fieldName: string,
): number | string => {
  if (!Number.isInteger(value) || typeof value !== 'number' || value <= 0) {
    return `${fieldName} debe ser un número entero mayor a 0`
  }

  return value
}

const parsePositiveIntegerFromQuery = (
  value: unknown,
  fieldName: string,
): number | string | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return `${fieldName} debe ser un número entero mayor a 0`
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return `${fieldName} debe ser un número entero mayor a 0`
  }

  return parsed
}

const isPedidoEstado = (value: string): value is PedidoEstado => {
  return PEDIDO_ESTADOS.includes(value as PedidoEstado)
}

const isValidDateString = (value: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return false
  }

  const [, yearRaw, monthRaw, dayRaw] = match

  if (!yearRaw || !monthRaw || !dayRaw) {
    return false
  }

  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)

  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export const validateCreatePedidoInput = (
  body: unknown,
): { value?: CrearPedidoInput; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { error: 'Payload invalido' }
  }

  const { id_cliente, fecha_entrega, detalles } = body as Record<
    string,
    unknown
  >

  const parsedIdCliente = parsePositiveInteger(id_cliente, 'id_cliente')

  if (typeof parsedIdCliente === 'string') {
    return { error: parsedIdCliente }
  }

  const value: CrearPedidoInput = {
    id_cliente: parsedIdCliente,
    detalles: [],
  }

  if (fecha_entrega !== undefined) {
    if (!isNonEmptyString(fecha_entrega)) {
      return { error: 'fecha_entrega debe ser un texto no vacio' }
    }

    if (!isValidDateString(fecha_entrega.trim())) {
      return { error: 'fecha_entrega debe tener formato YYYY-MM-DD valido' }
    }

    value.fecha_entrega = fecha_entrega.trim()
  }

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return { error: 'detalles debe contener al menos un producto' }
  }

  const productosRepetidos = new Set<number>()

  for (const [index, detalle] of detalles.entries()) {
    if (!detalle || typeof detalle !== 'object') {
      return { error: `detalles[${index}] debe ser un objeto valido` }
    }

    const { id_producto, cantidad } = detalle as Record<string, unknown>

    const parsedIdProducto = parsePositiveInteger(
      id_producto,
      `detalles[${index}].id_producto`,
    )

    if (typeof parsedIdProducto === 'string') {
      return { error: parsedIdProducto }
    }

    const parsedCantidad = parsePositiveInteger(
      cantidad,
      `detalles[${index}].cantidad`,
    )

    if (typeof parsedCantidad === 'string') {
      return { error: parsedCantidad }
    }

    if (productosRepetidos.has(parsedIdProducto)) {
      return {
        error: `El producto con id ${parsedIdProducto} está repetido en el pedido`,
      }
    }

    productosRepetidos.add(parsedIdProducto)

    value.detalles.push({
      id_producto: parsedIdProducto,
      cantidad: parsedCantidad,
    })
  }

  return { value }
}

export const validateUpdatePedidoInput = (
  body: unknown,
): { value?: ActualizarPedidoInput; error?: string } => {
  const validation = validateCreatePedidoInput(body)

  if (!validation.value) {
    return {
      error: validation.error ?? 'Payload invalido',
    }
  }

  const value: ActualizarPedidoInput = {
    id_cliente: validation.value.id_cliente,
    detalles: validation.value.detalles,
  }

  if (validation.value.fecha_entrega !== undefined) {
    value.fecha_entrega = validation.value.fecha_entrega
  }

  return { value }
}

export const validateUpdatePedidoEstadoInput = (
  body: unknown,
): { value?: ActualizarEstadoPedidoInput; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { error: 'Payload invalido' }
  }

  const { estado } = body as Record<string, unknown>

  if (!isNonEmptyString(estado)) {
    return { error: 'estado es requerido' }
  }

  const cleanEstado = estado.trim()

  if (!isPedidoEstado(cleanEstado)) {
    return {
      error:
        'estado debe ser uno de: pendiente, produccion, finalizado, cancelado, entregado',
    }
  }

  return {
    value: {
      estado: cleanEstado,
    },
  }
}

export const validatePedidoFilters = (
  query: Record<string, unknown>,
): { value?: PedidoFilters; error?: string } => {
  const rawPage = query.page
  const rawLimit = query.limit
  const rawEstado = query.estado
  const rawIdCliente = query.idCliente
  const rawIdUsuario = query.idUsuario

  const page =
    typeof rawPage === 'string' && rawPage.trim() !== ''
      ? Number.parseInt(rawPage, 10)
      : 1

  const limit =
    typeof rawLimit === 'string' && rawLimit.trim() !== ''
      ? Number.parseInt(rawLimit, 10)
      : PEDIDO_LIMIT_DEFAULT

  if (!Number.isInteger(page) || page <= 0) {
    return { error: 'page debe ser un entero mayor a 0' }
  }

  if (!Number.isInteger(limit) || limit <= 0 || limit > PEDIDO_LIMIT_MAX) {
    return {
      error: `limit debe ser un entero entre 1 y ${PEDIDO_LIMIT_MAX}`,
    }
  }

  const value: PedidoFilters = {
    page,
    limit,
  }

  if (rawEstado !== undefined) {
    if (typeof rawEstado !== 'string' || rawEstado.trim() === '') {
      return { error: 'estado debe ser un texto no vacio' }
    }

    const cleanEstado = rawEstado.trim()

    if (!isPedidoEstado(cleanEstado)) {
      return {
        error:
          'estado debe ser uno de: pendiente, produccion, finalizado, cancelado, entregado',
      }
    }

    value.estado = cleanEstado
  }

  const idCliente = parsePositiveIntegerFromQuery(rawIdCliente, 'idCliente')

  if (typeof idCliente === 'string') {
    return { error: idCliente }
  }

  if (idCliente !== undefined) {
    value.idCliente = idCliente
  }

  const idUsuario = parsePositiveIntegerFromQuery(rawIdUsuario, 'idUsuario')

  if (typeof idUsuario === 'string') {
    return { error: idUsuario }
  }

  if (idUsuario !== undefined) {
    value.idUsuario = idUsuario
  }

  return { value }
}

export const validatePedidoId = (
  rawId: string,
): { value?: number; error?: string } => {
  const id = Number.parseInt(rawId, 10)

  if (!Number.isInteger(id) || id <= 0) {
    return { error: 'id invalido' }
  }

  return { value: id }
}
