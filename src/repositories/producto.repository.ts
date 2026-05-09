import type { PoolClient, QueryResultRow } from 'pg'

import { pool } from '../db.js'
import type {
  ActualizarProductoInput,
  CrearProductoInput,
  Producto,
  ProductoFilters,
  ProductoListItem,
} from '../types/producto.types.js'

type Queryable = PoolClient | typeof pool

const mapProducto = <T extends QueryResultRow>(row: T): Producto => ({
  id: row.id,
  nombre: row.nombre,
  tipo: row.tipo,
  costo_base: row.costo_base,
  codigo: row.codigo,
  id_insumo_inventario: row.id_insumo_inventario,
  nombre_insumo_inventario: row.nombre_insumo_inventario ?? null,
  created_at: row.created_at,
})

export const findProductoById = async (
  id: number,
  db: Queryable = pool,
): Promise<Producto | null> => {
  const result = await db.query(
    `SELECT p.id,
            p.nombre,
            p.tipo,
            p.costo_base,
            p.codigo,
            p.id_insumo_inventario,
            i.nombre AS nombre_insumo_inventario,
            p.created_at
     FROM producto p
     LEFT JOIN inventario i ON i.id = p.id_insumo_inventario
     WHERE p.id = $1
     LIMIT 1`,
    [id],
  )

  return result.rows[0] ? mapProducto(result.rows[0]) : null
}

export const findProductoByNombre = async (
  nombre: string,
  db: Queryable = pool,
): Promise<Producto | null> => {
  const result = await db.query(
    `SELECT p.id,
            p.nombre,
            p.tipo,
            p.costo_base,
            p.codigo,
            p.id_insumo_inventario,
            i.nombre AS nombre_insumo_inventario,
            p.created_at
     FROM producto p
     LEFT JOIN inventario i ON i.id = p.id_insumo_inventario
     WHERE LOWER(p.nombre) = LOWER($1)
     LIMIT 1`,
    [nombre],
  )

  return result.rows[0] ? mapProducto(result.rows[0]) : null
}

export const createProducto = async (
  payload: CrearProductoInput,
  db: Queryable = pool,
): Promise<Producto> => {
  const result = await db.query(
    `WITH inserted AS (
       INSERT INTO producto (nombre, tipo, costo_base, codigo, id_insumo_inventario)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at
     )
     SELECT inserted.id,
            inserted.nombre,
            inserted.tipo,
            inserted.costo_base,
            inserted.codigo,
            inserted.id_insumo_inventario,
            i.nombre AS nombre_insumo_inventario,
            inserted.created_at
     FROM inserted
     LEFT JOIN inventario i ON i.id = inserted.id_insumo_inventario`,
    [
      payload.nombre,
      payload.tipo,
      payload.costo_base,
      payload.codigo,
      payload.id_insumo_inventario,
    ],
  )

  return mapProducto(result.rows[0])
}

export const updateProducto = async (
  id: number,
  payload: ActualizarProductoInput,
  db: Queryable = pool,
): Promise<Producto> => {
  const fields: string[] = []
  const values: Array<string | number> = []

  if (payload.nombre !== undefined) {
    values.push(payload.nombre)
    fields.push(`nombre = $${values.length}`)
  }

  if (payload.tipo !== undefined) {
    values.push(payload.tipo)
    fields.push(`tipo = $${values.length}`)
  }

  if (payload.costo_base !== undefined) {
    values.push(payload.costo_base)
    fields.push(`costo_base = $${values.length}`)
  }

  if (payload.codigo !== undefined) {
    values.push(payload.codigo)
    fields.push(`codigo = $${values.length}`)
  }

  if (payload.id_insumo_inventario !== undefined) {
    values.push(payload.id_insumo_inventario)
    fields.push(`id_insumo_inventario = $${values.length}`)
  }

  values.push(id)

  const result = await db.query(
    `WITH updated AS (
       UPDATE producto
       SET ${fields.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at
     )
     SELECT updated.id,
            updated.nombre,
            updated.tipo,
            updated.costo_base,
            updated.codigo,
            updated.id_insumo_inventario,
            i.nombre AS nombre_insumo_inventario,
            updated.created_at
     FROM updated
     LEFT JOIN inventario i ON i.id = updated.id_insumo_inventario`,
    values,
  )

  return mapProducto(result.rows[0])
}

export const listProducto = async (
  filters: ProductoFilters,
  db: Queryable = pool,
): Promise<{ items: ProductoListItem[]; total: number }> => {
  const conditions: string[] = []
  const qualifiedConditions: string[] = []
  const values: Array<string | number> = []

  if (filters.search) {
    values.push(`%${filters.search}%`)
    conditions.push(`nombre ILIKE $${values.length}`)
    qualifiedConditions.push(`p.nombre ILIKE $${values.length}`)
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const qualifiedWhereClause =
    qualifiedConditions.length > 0
      ? `WHERE ${qualifiedConditions.join(' AND ')}`
      : ''

  const countResult = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM producto
     ${whereClause}`,
    values,
  )

  values.push(filters.limit, (filters.page - 1) * filters.limit)

  const result = await db.query<ProductoListItem>(
    `SELECT
       p.id,
       p.nombre,
       p.tipo,
       p.costo_base,
       p.codigo,
       p.id_insumo_inventario,
       i.nombre AS nombre_insumo_inventario,
       p.created_at
     FROM producto p
     LEFT JOIN inventario i ON i.id = p.id_insumo_inventario
     ${qualifiedWhereClause}
     ORDER BY p.nombre ASC, p.id ASC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values,
  )

  return {
    items: result.rows,
    total: Number.parseInt(countResult.rows[0]?.total ?? '0', 10),
  }
}

export const getProductoReferences = async (
  id: number,
  db: Queryable = pool,
): Promise<{ productos: number; movimientos: number }> => {
  const result = await db.query<{
    productos: string
    movimientos: string
  }>(
    `SELECT
       (SELECT COUNT(*) FROM producto WHERE id_insumo_producto = $1) AS productos,
       (SELECT COUNT(*) FROM movimiento_producto WHERE id_producto = $1) AS movimientos`,
    [id],
  )

  return {
    productos: Number.parseInt(result.rows[0]?.productos ?? '0', 10),
    movimientos: Number.parseInt(result.rows[0]?.movimientos ?? '0', 10),
  }
}

export const deleteProductoById = async (
  id: number,
  db: Queryable = pool,
): Promise<void> => {
  await db.query('DELETE FROM producto WHERE id = $1', [id])
}
