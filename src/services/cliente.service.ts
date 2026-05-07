import { pool } from '../db.js'
import * as clienteRepository from '../repositories/cliente.repository.js'
import type {
  ActualizarClienteInput,
  ClienteFilters,
  ClienteListResult,
  CrearClienteInput,
} from '../types/cliente.types.js'
import { ClienteError } from './cliente.errors.js'

export const createCliente = async (payload: CrearClienteInput) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (payload.telefono) {
      const existingCliente = await clienteRepository.findClienteByTelefono(
        payload.telefono,
        client,
      )

      if (existingCliente) {
        throw new ClienteError('Ya existe un cliente con ese telefono', 409)
      }
    }

    const cliente = await clienteRepository.createCliente(payload, client)

    await client.query('COMMIT')

    return cliente
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const listCliente = async (
  filters: ClienteFilters,
): Promise<ClienteListResult> => {
  const { items, total } = await clienteRepository.listCliente(filters)

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

export const getClienteById = async (id: number) => {
  const cliente = await clienteRepository.findClienteById(id)

  if (!cliente) {
    throw new ClienteError('Cliente no encontrado', 404)
  }

  return cliente
}

export const updateCliente = async (
  id: number,
  payload: ActualizarClienteInput,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const currentCliente = await clienteRepository.findClienteById(id, client)

    if (!currentCliente) {
      throw new ClienteError('Cliente no encontrado', 404)
    }

    if (payload.telefono && payload.telefono !== currentCliente.telefono) {
      const existingCliente = await clienteRepository.findClienteByTelefono(
        payload.telefono,
        client,
      )

      if (existingCliente && existingCliente.id !== id) {
        throw new ClienteError('Ya existe un cliente con ese telefono', 409)
      }
    }

    const updatedCliente = await clienteRepository.updateCliente(
      id,
      payload,
      client,
    )

    await client.query('COMMIT')

    return updatedCliente
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const deleteCliente = async (id: number) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const currentCliente = await clienteRepository.findClienteById(id, client)

    if (!currentCliente) {
      throw new ClienteError('Cliente no encontrado', 404)
    }

    const pedidosAsociados = await clienteRepository.countPedidosByClienteId(
      id,
      client,
    )

    if (pedidosAsociados > 0) {
      throw new ClienteError(
        'No se puede eliminar el cliente porque tiene pedidos asociados',
        409,
      )
    }

    await clienteRepository.deleteClienteById(id, client)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
