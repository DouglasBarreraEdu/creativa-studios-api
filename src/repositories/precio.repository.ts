import type { PoolClient, QueryResultRow } from 'pg'

import { pool } from '../db.js'
import type { Precio, PrecioFilters } from '../types/precio.types.js'

type Queryable = PoolClient | typeof pool

const mapPrecio = <T extends QueryResultRow>(row: T): Precio => ({
  id: row.id,
  margen_ganancia: Number(row.margen_ganancia),
  precio_sugerido: Number(row.precio_sugerido),
  id_producto: row.id_producto,
  nombre_producto: row.nombre_producto ?? null,
})

export const findPrecioByProductoId = async (
  idProducto: number,
  db: Queryable = pool,
): Promise<Precio | null> => {
  const result = await db.query(
    `SELECT pr.id,
            pr.margen_ganancia,
            pr.precio_sugerido,
            pr.id_producto,
            p.nombre AS nombre_producto
     FROM precio pr
     LEFT JOIN producto p ON p.id = pr.id_producto
     WHERE pr.id_producto = $1
     LIMIT 1`,
    [idProducto],
  )

  return result.rows[0] ? mapPrecio(result.rows[0]) : null
}

export const listPrecio = async (
  filters: PrecioFilters,
  db: Queryable = pool,
): Promise<{ items: Precio[]; total: number }> => {
  const qualifiedConditions: string[] = []
  const values: Array<string | number> = []

  if (filters.search) {
    values.push(`%${filters.search}%`)
    qualifiedConditions.push(`p.nombre ILIKE $${values.length}`)
  }

  const qualifiedWhereClause =
    qualifiedConditions.length > 0
      ? `WHERE ${qualifiedConditions.join(' AND ')}`
      : ''

  const countResult = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM precio pr
     INNER JOIN producto p ON p.id = pr.id_producto
     ${qualifiedWhereClause}`,
    values,
  )

  values.push(filters.limit, (filters.page - 1) * filters.limit)

  const result = await db.query<Precio>(
    `SELECT pr.id,
            pr.margen_ganancia,
            pr.precio_sugerido,
            pr.id_producto,
            p.nombre AS nombre_producto
     FROM precio pr
     INNER JOIN producto p ON p.id = pr.id_producto
     ${qualifiedWhereClause}
     ORDER BY p.nombre ASC, pr.id ASC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values,
  )

  return {
    items: result.rows.map(mapPrecio),
    total: Number.parseInt(countResult.rows[0]?.total ?? '0', 10),
  }
}

export const createPrecio = async (
  payload: {
    margen_ganancia: number
    precio_sugerido: number
    id_producto: number
  },
  db: Queryable = pool,
): Promise<Precio> => {
  const result = await db.query(
    `WITH inserted AS (
       INSERT INTO precio (margen_ganancia, precio_sugerido, id_producto)
       VALUES ($1, $2, $3)
       RETURNING id, margen_ganancia, precio_sugerido, id_producto
     )
     SELECT inserted.id,
            inserted.margen_ganancia,
            inserted.precio_sugerido,
            inserted.id_producto,
            p.nombre AS nombre_producto
     FROM inserted
     LEFT JOIN producto p ON p.id = inserted.id_producto`,
    [payload.margen_ganancia, payload.precio_sugerido, payload.id_producto],
  )

  return mapPrecio(result.rows[0])
}

export const updatePrecioByProductoId = async (
  idProducto: number,
  payload: {
    margen_ganancia: number
    precio_sugerido: number
  },
  db: Queryable = pool,
): Promise<Precio> => {
  const result = await db.query(
    `WITH updated AS (
       UPDATE precio
       SET margen_ganancia = $1,
           precio_sugerido = $2
       WHERE id_producto = $3
       RETURNING id, margen_ganancia, precio_sugerido, id_producto
     )
     SELECT updated.id,
            updated.margen_ganancia,
            updated.precio_sugerido,
            updated.id_producto,
            p.nombre AS nombre_producto
     FROM updated
     LEFT JOIN producto p ON p.id = updated.id_producto`,
    [payload.margen_ganancia, payload.precio_sugerido, idProducto],
  )

  return mapPrecio(result.rows[0])
}
