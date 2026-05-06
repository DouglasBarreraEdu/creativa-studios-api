import { pool } from '../db.js'
import * as productoRepository from '../repositories/producto.repository.js'
import { ProductoError } from './producto.errors.js'
import type {
  ActualizarProductoInput,
  CrearProductoInput,
  ProductoFilters,
  ProductoListResult,
} from '../types/producto.types.js'

export const createProducto = async (payload: CrearProductoInput) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const existingProducto = await productoRepository.findProductoByNombre(
      payload.nombre,
      client,
    )

    if (existingProducto) {
      throw new ProductoError('Ya existe un insumo con ese nombre', 409)
    }

    const producto = await productoRepository.createProducto(payload, client)

    await client.query('COMMIT')

    return producto
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const listProducto = async (
  filters: ProductoFilters,
): Promise<ProductoListResult> => {
  const { items, total } = await productoRepository.listProducto(filters)

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

export const getProductoById = async (id: number) => {
  const producto = await productoRepository.findProductoById(id)

  if (!producto) {
    throw new ProductoError('Registro de producto no encontrado', 404)
  }

  return producto
}

export const updateProducto = async (
  id: number,
  payload: ActualizarProductoInput,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const currentProducto = await productoRepository.findProductoById(
      id,
      client,
    )

    if (!currentProducto) {
      throw new ProductoError('Registro de producto no encontrado', 404)
    }

    if (
      payload.nombre &&
      payload.nombre.toLowerCase() !== currentProducto.nombre.toLowerCase()
    ) {
      const existingProducto = await productoRepository.findProductoByNombre(
        payload.nombre,
        client,
      )

      if (existingProducto && existingProducto.id !== id) {
        throw new ProductoError('Ya existe un insumo con ese nombre', 409)
      }
    }

    const updatedProducto = await productoRepository.updateProducto(
      id,
      payload,
      client,
    )

    await client.query('COMMIT')

    return updatedProducto
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const deleteProducto = async (id: number) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const currentProducto = await productoRepository.findProductoById(
      id,
      client,
    )

    if (!currentProducto) {
      throw new ProductoError('Registro de producto no encontrado', 404)
    }

    await productoRepository.deleteProductoById(id, client)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
