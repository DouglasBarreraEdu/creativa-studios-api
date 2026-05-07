import type { PoolClient, QueryResultRow } from 'pg'

import { pool } from '../db.js'
import type {
  ActualizarClienteInput,
  Cliente,
  ClienteFilters,
  CrearClienteInput,
} from '../types/cliente.types.js'

type Queryable = PoolClient | typeof pool

const mapCliente = <T extends QueryResultRow>(row: T): Cliente => ({
  id: row.id,
  nombre: row.nombre,
  telefono: row.telefono ?? null,
})

export const findClienteById = async (
  id: number,
  db: Queryable = pool,
): Promise<Cliente | null> => {
  const result = await db.query(
    `SELECT id, nombre, telefono
     FROM cliente
     WHERE id = $1
     LIMIT 1`,
    [id],
  )

  return result.rows[0] ? mapCliente(result.rows[0]) : null
}

export const findClienteByTelefono = async (
  telefono: string,
  db: Queryable = pool,
): Promise<Cliente | null> => {
  const result = await db.query(
    `SELECT id, nombre, telefono
     FROM cliente
     WHERE telefono = $1
     LIMIT 1`,
    [telefono],
  )

  return result.rows[0] ? mapCliente(result.rows[0]) : null
}

export const createCliente = async (
  payload: CrearClienteInput,
  db: Queryable = pool,
): Promise<Cliente> => {
  const result = await db.query(
    `INSERT INTO cliente (nombre, telefono)
     VALUES ($1, $2)
     RETURNING id, nombre, telefono`,
    [payload.nombre, payload.telefono ?? null],
  )

  return mapCliente(result.rows[0])
}

export const listCliente = async (
  filters: ClienteFilters,
  db: Queryable = pool,
): Promise<{ items: Cliente[]; total: number }> => {
  const conditions: string[] = []
  const values: Array<string | number> = []

  if (filters.search) {
    values.push(`%${filters.search}%`)
    conditions.push(
      `(nombre ILIKE $${values.length} OR telefono ILIKE $${values.length})`,
    )
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM cliente
     ${whereClause}`,
    values,
  )

  values.push(filters.limit, (filters.page - 1) * filters.limit)

  const result = await db.query(
    `SELECT id, nombre, telefono
     FROM cliente
     ${whereClause}
     ORDER BY id DESC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values,
  )

  return {
    items: result.rows.map(mapCliente),
    total: Number.parseInt(countResult.rows[0]?.total ?? '0', 10),
  }
}

export const updateCliente = async (
  id: number,
  payload: ActualizarClienteInput,
  db: Queryable = pool,
): Promise<Cliente> => {
  const fields: string[] = []
  const values: Array<string | number> = []

  if (payload.nombre !== undefined) {
    values.push(payload.nombre)
    fields.push(`nombre = $${values.length}`)
  }

  if (payload.telefono !== undefined) {
    values.push(payload.telefono)
    fields.push(`telefono = $${values.length}`)
  }

  values.push(id)

  const result = await db.query(
    `UPDATE cliente
     SET ${fields.join(', ')}
     WHERE id = $${values.length}
     RETURNING id, nombre, telefono`,
    values,
  )

  return mapCliente(result.rows[0])
}

export const countPedidosByClienteId = async (
  id: number,
  db: Queryable = pool,
): Promise<number> => {
  const result = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM pedido
     WHERE id_cliente = $1`,
    [id],
  )

  return Number.parseInt(result.rows[0]?.total ?? '0', 10)
}

export const deleteClienteById = async (
  id: number,
  db: Queryable = pool,
): Promise<void> => {
  await db.query(
    `DELETE FROM cliente
     WHERE id = $1`,
    [id],
  )
}
