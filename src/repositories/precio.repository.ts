import type { PoolClient, QueryResultRow } from 'pg'

import { pool } from '../db.js'
import type { Precio } from '../types/precio.types.js'

type Queryable = PoolClient | typeof pool

const mapPrecio = <T extends QueryResultRow>(row: T): Precio => ({
  id: row.id,
  margen_ganancia: Number(row.margen_ganancia),
  precio_sugerido: Number(row.precio_sugerido),
  id_producto: row.id_producto,
})

export const findPrecioByProductoId = async (
  idProducto: number,
  db: Queryable = pool,
): Promise<Precio | null> => {
  const result = await db.query(
    `SELECT id, margen_ganancia, precio_sugerido, id_producto
     FROM precio
     WHERE id_producto = $1
     LIMIT 1`,
    [idProducto],
  )

  return result.rows[0] ? mapPrecio(result.rows[0]) : null
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
    `INSERT INTO precio (margen_ganancia, precio_sugerido, id_producto)
     VALUES ($1, $2, $3)
     RETURNING id, margen_ganancia, precio_sugerido, id_producto`,
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
    `UPDATE precio
     SET margen_ganancia = $1,
         precio_sugerido = $2
     WHERE id_producto = $3
     RETURNING id, margen_ganancia, precio_sugerido, id_producto`,
    [payload.margen_ganancia, payload.precio_sugerido, idProducto],
  )

  return mapPrecio(result.rows[0])
}
