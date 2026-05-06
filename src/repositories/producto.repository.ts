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
  created_at: row.created_at,
})

export const findProductoById = async (
  id: number,
  db: Queryable = pool,
): Promise<Producto | null> => {
  const result = await db.query(
    `SELECT id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at
     FROM producto
     WHERE id = $1
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
    `SELECT id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at
     FROM producto
     WHERE LOWER(nombre) = LOWER($1)
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
    `INSERT INTO producto (nombre, tipo, costo_base, codigo, id_insumo_inventario)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at`,
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
    `UPDATE producto
     SET ${fields.join(', ')}
     WHERE id = $${values.length}
     RETURNING id, nombre, tipo, costo_base, codigo, id_insumo_inventario, created_at`,
    values,
  )

  return mapProducto(result.rows[0])
}

export const listProducto = async (
  filters: ProductoFilters,
  db: Queryable = pool,
): Promise<{ items: ProductoListItem[]; total: number }> => {
  const conditions: string[] = []
  const values: Array<string | number> = []

  if (filters.search) {
    values.push(`%${filters.search}%`)
    conditions.push(`nombre ILIKE $${values.length}`)
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM producto
     ${whereClause}`,
    values,
  )

  values.push(filters.limit, (filters.page - 1) * filters.limit)

  const result = await db.query<ProductoListItem>(
    `SELECT
       id,
       nombre,
       tipo,
       costo_base,
       codigo,
       id_insumo_inventario,
       created_at
     FROM producto
     ${whereClause}
     ORDER BY nombre ASC, id ASC
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
