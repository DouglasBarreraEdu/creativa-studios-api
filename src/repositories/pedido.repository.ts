import type { PoolClient, QueryResultRow } from 'pg'

import { pool } from '../db.js'
import type {
  Pedido,
  PedidoDetalle,
  PedidoDetalleItem,
  PedidoEstado,
  PedidoFilters,
  PedidoInventarioDetalle,
  PedidoListItem,
  PedidoListProductoItem,
} from '../types/pedido.types.js'

type Queryable = PoolClient | typeof pool

interface CrearPedidoRepositoryInput {
  id_cliente: number
  id_usuario: number
  fecha_entrega?: string | null
  total_pedido: number
}

interface CrearDetallePedidoRepositoryInput {
  id_pedido: number
  id_producto: number
  cantidad: number
  precio_unitario: number
  subtotal: number
}

const mapPedido = <T extends QueryResultRow>(row: T): Pedido => ({
  id: row.id,
  estado: row.estado,
  fecha_creacion: row.fecha_creacion,
  fecha_entrega: row.fecha_entrega ?? null,
  total_pedido: Number(row.total_pedido ?? 0),
  id_cliente: row.id_cliente,
  id_usuario: row.id_usuario,
})

const parsePedidoListProductos = (
  productos: unknown,
): PedidoListProductoItem[] => {
  if (Array.isArray(productos)) {
    return productos.map((producto) => ({
      id_producto: Number(producto.id_producto),
      producto_nombre: String(producto.producto_nombre),
      cantidad: Number(producto.cantidad),
    }))
  }

  if (typeof productos === 'string') {
    try {
      const parsed = JSON.parse(productos)

      if (!Array.isArray(parsed)) {
        return []
      }

      return parsed.map((producto) => ({
        id_producto: Number(producto.id_producto),
        producto_nombre: String(producto.producto_nombre),
        cantidad: Number(producto.cantidad),
      }))
    } catch {
      return []
    }
  }

  return []
}

const mapPedidoListItem = <T extends QueryResultRow>(
  row: T,
): PedidoListItem => {
  const productos = parsePedidoListProductos(row.productos)

  const primerProducto = productos[0]?.producto_nombre ?? 'Sin productos'
  const productosExtra = productos.length - 1

  return {
    id: row.id,
    estado: row.estado,
    fecha_creacion: row.fecha_creacion,
    fecha_entrega: row.fecha_entrega ?? null,
    total_pedido: Number(row.total_pedido ?? 0),

    id_cliente: row.id_cliente,
    cliente_nombre: row.cliente_nombre_comercial,
    cliente_nombre_comercial: row.cliente_nombre_comercial,
    cliente_nombre_contacto: row.cliente_nombre_contacto,

    id_usuario: row.id_usuario,
    usuario_nombre: row.usuario_nombre,

    producto_resumen:
      productosExtra > 0
        ? `${primerProducto} + ${productosExtra} más`
        : primerProducto,
    total_items: Number(row.total_items ?? 0),
    productos,
  }
}

const mapDetallePedido = <T extends QueryResultRow>(
  row: T,
): PedidoDetalleItem => ({
  id: row.id,
  id_pedido: row.id_pedido,
  id_producto: row.id_producto,
  producto_nombre: row.producto_nombre,
  producto_codigo: row.producto_codigo,
  cantidad: row.cantidad,
  precio_unitario: Number(row.precio_unitario),
  subtotal: Number(row.subtotal),
})

export const createPedido = async (
  payload: CrearPedidoRepositoryInput,
  db: Queryable = pool,
): Promise<Pedido> => {
  const result = await db.query(
    `INSERT INTO pedido (
       fecha_entrega,
       total_pedido,
       id_cliente,
       id_usuario
     )
     VALUES ($1, $2, $3, $4)
     RETURNING
       id,
       estado,
       fecha_creacion,
       fecha_entrega,
       total_pedido,
       id_cliente,
       id_usuario`,
    [
      payload.fecha_entrega ?? null,
      payload.total_pedido,
      payload.id_cliente,
      payload.id_usuario,
    ],
  )

  return mapPedido(result.rows[0])
}

export const createDetallePedido = async (
  payload: CrearDetallePedidoRepositoryInput,
  db: Queryable = pool,
): Promise<PedidoDetalleItem> => {
  const result = await db.query(
    `INSERT INTO detalle_pedido (
       id_pedido,
       id_producto,
       cantidad,
       precio_unitario,
       subtotal
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
       id,
       id_pedido,
       id_producto,
       cantidad,
       precio_unitario,
       subtotal`,
    [
      payload.id_pedido,
      payload.id_producto,
      payload.cantidad,
      payload.precio_unitario,
      payload.subtotal,
    ],
  )

  return {
    id: result.rows[0].id,
    id_pedido: result.rows[0].id_pedido,
    id_producto: result.rows[0].id_producto,
    producto_nombre: '',
    producto_codigo: '',
    cantidad: result.rows[0].cantidad,
    precio_unitario: Number(result.rows[0].precio_unitario),
    subtotal: Number(result.rows[0].subtotal),
  }
}

export const findPedidoById = async (
  id: number,
  db: Queryable = pool,
): Promise<Pedido | null> => {
  const result = await db.query(
    `SELECT
       id,
       estado,
       fecha_creacion,
       fecha_entrega,
       total_pedido,
       id_cliente,
       id_usuario
     FROM pedido
     WHERE id = $1
     LIMIT 1`,
    [id],
  )

  return result.rows[0] ? mapPedido(result.rows[0]) : null
}

export const findPedidoByIdForUpdate = async (
  id: number,
  db: Queryable = pool,
): Promise<Pedido | null> => {
  const result = await db.query(
    `SELECT
       id,
       estado,
       fecha_creacion,
       fecha_entrega,
       total_pedido,
       id_cliente,
       id_usuario
     FROM pedido
     WHERE id = $1
     FOR UPDATE`,
    [id],
  )

  return result.rows[0] ? mapPedido(result.rows[0]) : null
}

export const findPedidoDetalleById = async (
  id: number,
  db: Queryable = pool,
): Promise<PedidoDetalle | null> => {
  const pedidoResult = await db.query(
    `SELECT
       p.id,
       p.estado,
       p.fecha_creacion,
       p.fecha_entrega,
       p.total_pedido,
       p.id_cliente,
       c.nombre_comercial AS cliente_nombre_comercial,
       c.nombre_contacto AS cliente_nombre_contacto,
       c.telefono AS cliente_telefono,
       p.id_usuario,
       u.nombre AS usuario_nombre,
       u.email AS usuario_email
     FROM pedido p
     INNER JOIN cliente c ON c.id = p.id_cliente
     INNER JOIN usuario u ON u.id = p.id_usuario
     WHERE p.id = $1
     LIMIT 1`,
    [id],
  )

  const pedidoRow = pedidoResult.rows[0]

  if (!pedidoRow) {
    return null
  }

  const detallesResult = await db.query(
    `SELECT
       dp.id,
       dp.id_pedido,
       dp.id_producto,
       pr.nombre AS producto_nombre,
       pr.codigo AS producto_codigo,
       dp.cantidad,
       dp.precio_unitario,
       dp.subtotal
     FROM detalle_pedido dp
     INNER JOIN producto pr ON pr.id = dp.id_producto
     WHERE dp.id_pedido = $1
     ORDER BY dp.id ASC`,
    [id],
  )

  return {
    id: pedidoRow.id,
    estado: pedidoRow.estado,
    fecha_creacion: pedidoRow.fecha_creacion,
    fecha_entrega: pedidoRow.fecha_entrega ?? null,
    total_pedido: Number(pedidoRow.total_pedido ?? 0),

    id_cliente: pedidoRow.id_cliente,
    cliente_nombre: pedidoRow.cliente_nombre_comercial,
    cliente_nombre_comercial: pedidoRow.cliente_nombre_comercial,
    cliente_nombre_contacto: pedidoRow.cliente_nombre_contacto,
    cliente_telefono: pedidoRow.cliente_telefono ?? null,

    id_usuario: pedidoRow.id_usuario,
    usuario_nombre: pedidoRow.usuario_nombre,
    usuario_email: pedidoRow.usuario_email,

    detalles: detallesResult.rows.map(mapDetallePedido),
  }
}

export const listPedido = async (
  filters: PedidoFilters,
  db: Queryable = pool,
): Promise<{ items: PedidoListItem[]; total: number }> => {
  const conditions: string[] = []
  const values: Array<string | number> = []

  if (filters.estado) {
    values.push(filters.estado)
    conditions.push(`p.estado = $${values.length}`)
  }

  if (filters.idCliente) {
    values.push(filters.idCliente)
    conditions.push(`p.id_cliente = $${values.length}`)
  }

  if (filters.idUsuario) {
    values.push(filters.idUsuario)
    conditions.push(`p.id_usuario = $${values.length}`)
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM pedido p
     ${whereClause}`,
    values,
  )

  values.push(filters.limit, (filters.page - 1) * filters.limit)

  const result = await db.query(
    `SELECT
       p.id,
       p.estado,
       p.fecha_creacion,
       p.fecha_entrega,
       p.total_pedido,
       p.id_cliente,
       c.nombre_comercial AS cliente_nombre_comercial,
       c.nombre_contacto AS cliente_nombre_contacto,
       p.id_usuario,
       u.nombre AS usuario_nombre,
       COALESCE(SUM(dp.cantidad), 0) AS total_items,
       COALESCE(
         json_agg(
           json_build_object(
             'id_producto', pr.id,
             'producto_nombre', pr.nombre,
             'cantidad', dp.cantidad
           )
           ORDER BY dp.id ASC
         ) FILTER (WHERE dp.id IS NOT NULL),
         '[]'
       ) AS productos
     FROM pedido p
     INNER JOIN cliente c ON c.id = p.id_cliente
     INNER JOIN usuario u ON u.id = p.id_usuario
     LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id
     LEFT JOIN producto pr ON pr.id = dp.id_producto
     ${whereClause}
     GROUP BY
       p.id,
       p.estado,
       p.fecha_creacion,
       p.fecha_entrega,
       p.total_pedido,
       p.id_cliente,
       c.nombre_comercial,
       c.nombre_contacto,
       p.id_usuario,
       u.nombre
     ORDER BY p.fecha_creacion DESC, p.id DESC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values,
  )

  return {
    items: result.rows.map(mapPedidoListItem),
    total: Number.parseInt(countResult.rows[0]?.total ?? '0', 10),
  }
}

export const updatePedidoEstado = async (
  id: number,
  estado: PedidoEstado,
  db: Queryable = pool,
): Promise<Pedido> => {
  const result = await db.query(
    `UPDATE pedido
     SET estado = $1
     WHERE id = $2
     RETURNING
       id,
       estado,
       fecha_creacion,
       fecha_entrega,
       total_pedido,
       id_cliente,
       id_usuario`,
    [estado, id],
  )

  return mapPedido(result.rows[0])
}

export const findDetallesForInventario = async (
  idPedido: number,
  db: Queryable = pool,
): Promise<PedidoInventarioDetalle[]> => {
  const result = await db.query(
    `SELECT
       dp.id AS id_detalle,
       dp.id_producto,
       pr.nombre AS producto_nombre,
       dp.cantidad,
       pr.id_insumo_inventario
     FROM detalle_pedido dp
     INNER JOIN producto pr ON pr.id = dp.id_producto
     WHERE dp.id_pedido = $1
     ORDER BY dp.id ASC`,
    [idPedido],
  )

  return result.rows.map((row) => ({
    id_detalle: row.id_detalle,
    id_producto: row.id_producto,
    producto_nombre: row.producto_nombre,
    cantidad: row.cantidad,
    id_insumo_inventario: row.id_insumo_inventario ?? null,
  }))
}
