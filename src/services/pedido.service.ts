import type { PoolClient } from 'pg'

import { pool } from '../db.js'
import * as clienteRepository from '../repositories/cliente.repository.js'
import * as movimientoInventarioRepository from '../repositories/movimiento-inventario.repository.js'
import * as pedidoRepository from '../repositories/pedido.repository.js'
import * as precioRepository from '../repositories/precio.repository.js'
import * as productoRepository from '../repositories/producto.repository.js'
import type {
  ActualizarPedidoInput,
  CrearPedidoInput,
  PedidoEstado,
  PedidoFilters,
  PedidoListResult,
} from '../types/pedido.types.js'
import { PedidoError } from './pedido.errors.js'

const TRANSICIONES_PERMITIDAS: Record<PedidoEstado, PedidoEstado[]> = {
  pendiente: ['produccion', 'cancelado'],
  produccion: ['finalizado', 'cancelado'],
  finalizado: ['entregado'],
  cancelado: [],
  entregado: [],
}

type DetallePedidoCalculado = {
  id_producto: number
  cantidad: number
  precio_unitario: number
  subtotal: number
}

const getPedidoCodigo = (idPedido: number) =>
  `PED-${String(idPedido).padStart(4, '0')}`

const validateEstadoTransition = (
  estadoActual: PedidoEstado,
  nuevoEstado: PedidoEstado,
) => {
  if (estadoActual === nuevoEstado) {
    throw new PedidoError(
      `El pedido ya se encuentra en estado ${nuevoEstado}`,
      409,
    )
  }

  const transiciones = TRANSICIONES_PERMITIDAS[estadoActual]

  if (!transiciones.includes(nuevoEstado)) {
    throw new PedidoError(
      `No se puede cambiar el pedido de ${estadoActual} a ${nuevoEstado}`,
      409,
    )
  }
}

const validateRoleForEstado = (role: string, nuevoEstado: PedidoEstado) => {
  if (role === 'ADMIN') {
    return
  }

  if (
    role === 'RECEPCION' &&
    ['produccion', 'cancelado', 'entregado'].includes(nuevoEstado)
  ) {
    return
  }

  if (
    role === 'PRODUCCION' &&
    ['produccion', 'finalizado'].includes(nuevoEstado)
  ) {
    return
  }

  throw new PedidoError('No tiene permisos para cambiar a ese estado', 403)
}

const calcularDetallesPedido = async (
  detalles: CrearPedidoInput['detalles'],
  client: PoolClient,
): Promise<DetallePedidoCalculado[]> => {
  const detallesCalculados: DetallePedidoCalculado[] = []

  for (const detalle of detalles) {
    const producto = await productoRepository.findProductoById(
      detalle.id_producto,
      client,
    )

    if (!producto) {
      throw new PedidoError(
        `Producto con id ${detalle.id_producto} no encontrado`,
        404,
      )
    }

    const precio = await precioRepository.findPrecioByProductoId(
      detalle.id_producto,
      client,
    )

    if (!precio) {
      throw new PedidoError(
        `El producto ${producto.nombre} no tiene precio definido`,
        409,
      )
    }

    const precioUnitario = Number(precio.precio_sugerido)
    const subtotal = Number((precioUnitario * detalle.cantidad).toFixed(2))

    detallesCalculados.push({
      id_producto: detalle.id_producto,
      cantidad: detalle.cantidad,
      precio_unitario: precioUnitario,
      subtotal,
    })
  }

  return detallesCalculados
}

const calcularTotalPedido = (detalles: DetallePedidoCalculado[]) =>
  Number(
    detalles.reduce((total, detalle) => total + detalle.subtotal, 0).toFixed(2),
  )

const descontarInventarioPedido = async (
  idPedido: number,
  client: PoolClient,
) => {
  const detalles = await pedidoRepository.findDetallesForInventario(
    idPedido,
    client,
  )

  if (detalles.length === 0) {
    throw new PedidoError('El pedido no tiene detalles registrados', 409)
  }

  for (const detalle of detalles) {
    if (!detalle.id_insumo_inventario) {
      throw new PedidoError(
        `El producto ${detalle.producto_nombre} no tiene insumo de inventario asociado`,
        409,
      )
    }

    const inventario =
      await movimientoInventarioRepository.findInventarioByIdForUpdate(
        detalle.id_insumo_inventario,
        client,
      )

    if (!inventario) {
      throw new PedidoError(
        `Inventario asociado al producto ${detalle.producto_nombre} no encontrado`,
        404,
      )
    }

    const nuevoStock = inventario.stock_actual - detalle.cantidad

    if (nuevoStock < 0) {
      throw new PedidoError(
        `Stock insuficiente para el producto ${detalle.producto_nombre}`,
        409,
      )
    }

    await movimientoInventarioRepository.createMovimientoInventario(
      {
        tipo: 'salida',
        cantidad: detalle.cantidad,
        id_inventario: detalle.id_insumo_inventario,
        comentario: `Consumo por pedido ${getPedidoCodigo(idPedido)}`,
      },
      client,
    )

    await movimientoInventarioRepository.updateInventarioStock(
      inventario.id,
      nuevoStock,
      client,
    )
  }
}

const devolverInventarioPedido = async (
  idPedido: number,
  client: PoolClient,
) => {
  const detalles = await pedidoRepository.findDetallesForInventario(
    idPedido,
    client,
  )

  if (detalles.length === 0) {
    throw new PedidoError('El pedido no tiene detalles registrados', 409)
  }

  for (const detalle of detalles) {
    if (!detalle.id_insumo_inventario) {
      throw new PedidoError(
        `El producto ${detalle.producto_nombre} no tiene insumo de inventario asociado`,
        409,
      )
    }

    const inventario =
      await movimientoInventarioRepository.findInventarioByIdForUpdate(
        detalle.id_insumo_inventario,
        client,
      )

    if (!inventario) {
      throw new PedidoError(
        `Inventario asociado al producto ${detalle.producto_nombre} no encontrado`,
        404,
      )
    }

    const nuevoStock = inventario.stock_actual + detalle.cantidad

    await movimientoInventarioRepository.createMovimientoInventario(
      {
        tipo: 'entrada',
        cantidad: detalle.cantidad,
        id_inventario: detalle.id_insumo_inventario,
        comentario: `Reversión por cancelación de pedido ${getPedidoCodigo(idPedido)}`,
      },
      client,
    )

    await movimientoInventarioRepository.updateInventarioStock(
      inventario.id,
      nuevoStock,
      client,
    )
  }
}

export const createPedido = async (
  payload: CrearPedidoInput,
  idUsuario: number,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const cliente = await clienteRepository.findClienteById(
      payload.id_cliente,
      client,
    )

    if (!cliente) {
      throw new PedidoError('Cliente no encontrado', 404)
    }

    const detallesCalculados = await calcularDetallesPedido(
      payload.detalles,
      client,
    )

    const totalPedido = calcularTotalPedido(detallesCalculados)

    const pedido = await pedidoRepository.createPedido(
      {
        id_cliente: payload.id_cliente,
        id_usuario: idUsuario,
        fecha_entrega: payload.fecha_entrega ?? null,
        total_pedido: totalPedido,
      },
      client,
    )

    for (const detalle of detallesCalculados) {
      await pedidoRepository.createDetallePedido(
        {
          id_pedido: pedido.id,
          id_producto: detalle.id_producto,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.subtotal,
        },
        client,
      )
    }

    const pedidoDetalle = await pedidoRepository.findPedidoDetalleById(
      pedido.id,
      client,
    )

    if (!pedidoDetalle) {
      throw new PedidoError('No se pudo obtener el pedido creado', 500)
    }

    await client.query('COMMIT')

    return pedidoDetalle
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const updatePedido = async (
  id: number,
  payload: ActualizarPedidoInput,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const currentPedido = await pedidoRepository.findPedidoByIdForUpdate(
      id,
      client,
    )

    if (!currentPedido) {
      throw new PedidoError('Pedido no encontrado', 404)
    }

    if (currentPedido.estado !== 'pendiente') {
      throw new PedidoError('Solo se pueden editar pedidos pendientes', 409)
    }

    const cliente = await clienteRepository.findClienteById(
      payload.id_cliente,
      client,
    )

    if (!cliente) {
      throw new PedidoError('Cliente no encontrado', 404)
    }

    const detallesCalculados = await calcularDetallesPedido(
      payload.detalles,
      client,
    )

    const totalPedido = calcularTotalPedido(detallesCalculados)

    await pedidoRepository.updatePedido(
      id,
      {
        id_cliente: payload.id_cliente,
        fecha_entrega: payload.fecha_entrega ?? null,
        total_pedido: totalPedido,
      },
      client,
    )

    await pedidoRepository.deleteDetallesPedidoByPedidoId(id, client)

    for (const detalle of detallesCalculados) {
      await pedidoRepository.createDetallePedido(
        {
          id_pedido: id,
          id_producto: detalle.id_producto,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.subtotal,
        },
        client,
      )
    }

    const pedidoDetalle = await pedidoRepository.findPedidoDetalleById(
      id,
      client,
    )

    if (!pedidoDetalle) {
      throw new PedidoError('No se pudo obtener el pedido actualizado', 500)
    }

    await client.query('COMMIT')

    return pedidoDetalle
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const listPedido = async (
  filters: PedidoFilters,
): Promise<PedidoListResult> => {
  const { items, total } = await pedidoRepository.listPedido(filters)

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

export const getPedidoById = async (id: number) => {
  const pedido = await pedidoRepository.findPedidoDetalleById(id)

  if (!pedido) {
    throw new PedidoError('Pedido no encontrado', 404)
  }

  return pedido
}

export const updatePedidoEstado = async (
  id: number,
  nuevoEstado: PedidoEstado,
  userRole: string,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    validateRoleForEstado(userRole, nuevoEstado)

    const currentPedido = await pedidoRepository.findPedidoByIdForUpdate(
      id,
      client,
    )

    if (!currentPedido) {
      throw new PedidoError('Pedido no encontrado', 404)
    }

    validateEstadoTransition(currentPedido.estado, nuevoEstado)

    if (currentPedido.estado === 'pendiente' && nuevoEstado === 'produccion') {
      await descontarInventarioPedido(id, client)
    }

    if (currentPedido.estado === 'produccion' && nuevoEstado === 'cancelado') {
      await devolverInventarioPedido(id, client)
    }

    await pedidoRepository.updatePedidoEstado(id, nuevoEstado, client)

    const pedidoDetalle = await pedidoRepository.findPedidoDetalleById(
      id,
      client,
    )

    if (!pedidoDetalle) {
      throw new PedidoError('No se pudo obtener el pedido actualizado', 500)
    }

    await client.query('COMMIT')

    return pedidoDetalle
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
