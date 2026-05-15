import { pool } from '../db.js'
import * as instalacionRepository from '../repositories/instalacion.repository.js'
import * as pedidoRepository from '../repositories/pedido.repository.js'
import type {
  ActualizarEstadoInstalacionInput,
  AsignarInstaladorInput,
  CrearInstalacionInput,
  InstalacionEstado,
  InstalacionFilters,
  InstalacionListResult,
  ReprogramarInstalacionInput,
} from '../types/instalacion.types.js'
import type { TokenInfo } from '../types/auth.types.js'
import { InstalacionError } from './instalacion.errors.js'

const TRANSICIONES_INSTALACION: Record<InstalacionEstado, InstalacionEstado[]> =
  {
    pendiente: ['asignada', 'cancelada'],
    asignada: ['en_proceso', 'no_realizada', 'cancelada'],
    en_proceso: ['completada', 'no_realizada', 'cancelada'],
    no_realizada: ['asignada', 'cancelada'],
    completada: [],
    cancelada: [],
  }

const validateInstalacionTransition = (
  estadoActual: InstalacionEstado,
  nuevoEstado: InstalacionEstado,
) => {
  if (estadoActual === nuevoEstado) {
    throw new InstalacionError(
      `La instalación ya se encuentra en estado ${nuevoEstado}`,
      409,
    )
  }

  const transiciones = TRANSICIONES_INSTALACION[estadoActual]

  if (!transiciones.includes(nuevoEstado)) {
    throw new InstalacionError(
      `No se puede cambiar la instalación de ${estadoActual} a ${nuevoEstado}`,
      409,
    )
  }
}

const validateRoleForEstado = (
  role: string,
  nuevoEstado: InstalacionEstado,
) => {
  if (role === 'ADMIN' || role === 'RECEPCION') {
    return
  }

  if (
    role === 'INSTALADOR' &&
    ['en_proceso', 'completada', 'no_realizada'].includes(nuevoEstado)
  ) {
    return
  }

  throw new InstalacionError(
    'No tiene permisos para cambiar a ese estado de instalación',
    403,
  )
}

const validateInstaladorAsignado = async (
  idInstalador: number,
  client: Parameters<typeof instalacionRepository.findUsuarioInstaladorById>[1],
) => {
  const instalador = await instalacionRepository.findUsuarioInstaladorById(
    idInstalador,
    client,
  )

  if (!instalador) {
    throw new InstalacionError(
      'El usuario asignado no existe o no tiene rol INSTALADOR',
      404,
    )
  }
}

const buildPedidoNoFinalizadoMessage = (
  accion: 'iniciar' | 'completar',
  estadoPedido: string,
) => {
  if (estadoPedido === 'pendiente') {
    return `No se puede ${accion} la instalación porque el pedido está pendiente. Primero debe cambiar el estado del pedido a finalizado.`
  }

  if (estadoPedido === 'produccion') {
    return `No se puede ${accion} la instalación porque el pedido está en producción. Primero debe cambiar el estado del pedido a finalizado.`
  }

  return `No se puede ${accion} la instalación porque el pedido no está finalizado. Estado actual del pedido: ${estadoPedido}.`
}

export const createInstalacionForPedido = async (
  idPedido: number,
  payload: CrearInstalacionInput,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const pedido =
      await instalacionRepository.findPedidoForInstalacionByIdForUpdate(
        idPedido,
        client,
      )

    if (!pedido) {
      throw new InstalacionError('Pedido no encontrado', 404)
    }

    if (pedido.estado === 'cancelado') {
      throw new InstalacionError(
        'No se puede crear instalación para un pedido cancelado',
        409,
      )
    }

    if (pedido.estado === 'entregado') {
      throw new InstalacionError(
        'No se puede crear instalación para un pedido entregado',
        409,
      )
    }

    const existing = await instalacionRepository.findInstalacionByPedidoId(
      idPedido,
      client,
    )

    if (existing) {
      throw new InstalacionError(
        'El pedido ya tiene una instalación registrada',
        409,
      )
    }

    if (payload.id_instalador) {
      await validateInstaladorAsignado(payload.id_instalador, client)
    }

    const direccionInstalacion =
      payload.direccion_instalacion ?? pedido.direccion_cliente

    if (!direccionInstalacion) {
      throw new InstalacionError(
        'La dirección de instalación es requerida',
        400,
      )
    }

    const instalacion = await instalacionRepository.createInstalacion(
      {
        id_pedido: idPedido,
        id_instalador: payload.id_instalador ?? null,
        estado: payload.id_instalador ? 'asignada' : 'pendiente',
        fecha_programada: payload.fecha_programada ?? null,
        direccion_instalacion: direccionInstalacion,
        observaciones: payload.observaciones ?? null,
      },
      client,
    )

    await client.query('COMMIT')

    return instalacion
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const listInstalaciones = async (
  filters: InstalacionFilters,
): Promise<InstalacionListResult> => {
  const { items, total } =
    await instalacionRepository.listInstalaciones(filters)

  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / filters.limit),
    },
  }
}

export const listMisInstalaciones = async (
  idInstalador: number,
  filters: InstalacionFilters,
): Promise<InstalacionListResult> => {
  const { items, total } = await instalacionRepository.listInstalaciones({
    ...filters,
    idInstalador,
  })

  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / filters.limit),
    },
  }
}

export const getInstalacionById = async (id: number, user: TokenInfo) => {
  const instalacion = await instalacionRepository.findInstalacionById(id)

  if (!instalacion) {
    throw new InstalacionError('Instalación no encontrada', 404)
  }

  if (user.role === 'INSTALADOR' && instalacion.id_instalador !== user.id) {
    throw new InstalacionError(
      'No tiene permisos para consultar esta instalación',
      403,
    )
  }

  return instalacion
}

export const asignarInstalador = async (
  id: number,
  payload: AsignarInstaladorInput,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const instalacion =
      await instalacionRepository.findInstalacionByIdForUpdate(id, client)

    if (!instalacion) {
      throw new InstalacionError('Instalación no encontrada', 404)
    }

    if (
      ['en_proceso', 'completada', 'cancelada'].includes(instalacion.estado)
    ) {
      throw new InstalacionError(
        'No se puede reasignar una instalación en proceso, completada o cancelada',
        409,
      )
    }

    await validateInstaladorAsignado(payload.id_instalador, client)

    await instalacionRepository.updateInstalacionInstalador(
      id,
      payload.id_instalador,
      client,
    )

    const updated = await instalacionRepository.findInstalacionById(id, client)

    if (!updated) {
      throw new InstalacionError(
        'No se pudo obtener la instalación actualizada',
        500,
      )
    }

    await client.query('COMMIT')

    return updated
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const updateEstadoInstalacion = async (
  id: number,
  payload: ActualizarEstadoInstalacionInput,
  user: TokenInfo,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    validateRoleForEstado(user.role, payload.estado)

    const instalacion =
      await instalacionRepository.findInstalacionByIdForUpdate(id, client)

    if (!instalacion) {
      throw new InstalacionError('Instalación no encontrada', 404)
    }

    if (user.role === 'INSTALADOR' && instalacion.id_instalador !== user.id) {
      throw new InstalacionError(
        'No tiene permisos para actualizar esta instalación',
        403,
      )
    }

    validateInstalacionTransition(instalacion.estado, payload.estado)

    if (payload.estado === 'asignada' && !instalacion.id_instalador) {
      throw new InstalacionError(
        'No se puede asignar estado asignada sin instalador',
        409,
      )
    }

    if (payload.estado === 'en_proceso') {
      if (!instalacion.id_instalador) {
        throw new InstalacionError(
          'No se puede iniciar una instalación sin instalador asignado',
          409,
        )
      }

      if (instalacion.pedido_estado !== 'finalizado') {
        throw new InstalacionError(
          buildPedidoNoFinalizadoMessage('iniciar', instalacion.pedido_estado),
          409,
        )
      }
    }

    if (payload.estado === 'completada') {
      if (instalacion.pedido_estado !== 'finalizado') {
        throw new InstalacionError(
          buildPedidoNoFinalizadoMessage(
            'completar',
            instalacion.pedido_estado,
          ),
          409,
        )
      }
    }

    await instalacionRepository.updateInstalacionEstado(
      id,
      payload.estado,
      payload.observaciones,
      client,
    )

    if (payload.estado === 'completada') {
      await pedidoRepository.updatePedidoEstado(
        instalacion.id_pedido,
        'entregado',
        client,
      )
    }

    const updated = await instalacionRepository.findInstalacionById(id, client)

    if (!updated) {
      throw new InstalacionError(
        'No se pudo obtener la instalación actualizada',
        500,
      )
    }

    await client.query('COMMIT')

    return updated
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const reprogramarInstalacion = async (
  id: number,
  payload: ReprogramarInstalacionInput,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const instalacion =
      await instalacionRepository.findInstalacionByIdForUpdate(id, client)

    if (!instalacion) {
      throw new InstalacionError('Instalación no encontrada', 404)
    }

    if (
      ['en_proceso', 'completada', 'cancelada'].includes(instalacion.estado)
    ) {
      throw new InstalacionError(
        'No se puede reprogramar una instalación en proceso, completada o cancelada',
        409,
      )
    }

    await instalacionRepository.reprogramarInstalacion(
      id,
      payload.fecha_programada,
      payload.observaciones,
      client,
    )

    const updated = await instalacionRepository.findInstalacionById(id, client)

    if (!updated) {
      throw new InstalacionError(
        'No se pudo obtener la instalación actualizada',
        500,
      )
    }

    await client.query('COMMIT')

    return updated
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
