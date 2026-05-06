import { pool } from '../db.js'
import * as precioRepository from '../repositories/precio.repository.js'
import * as productoRepository from '../repositories/producto.repository.js'
import type {
  ActualizarPrecioInput,
  CrearPrecioInput,
} from '../types/precio.types.js'
import { PrecioError } from './precio.errors.js'

const calcularPrecioSugerido = (
  costoBase: number,
  margenGanancia: number,
): number => {
  return Number((costoBase * (1 + margenGanancia / 100)).toFixed(2))
}

export const createPrecio = async (payload: CrearPrecioInput) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const producto = await productoRepository.findProductoById(
      payload.id_producto,
      client,
    )

    if (!producto) {
      throw new PrecioError('Producto no encontrado', 404)
    }

    const existingPrecio = await precioRepository.findPrecioByProductoId(
      payload.id_producto,
      client,
    )

    if (existingPrecio) {
      throw new PrecioError('El producto ya tiene precio definido', 409)
    }

    const precioSugerido = calcularPrecioSugerido(
      Number(producto.costo_base),
      payload.margen_ganancia,
    )

    const precio = await precioRepository.createPrecio(
      {
        id_producto: payload.id_producto,
        margen_ganancia: payload.margen_ganancia,
        precio_sugerido: precioSugerido,
      },
      client,
    )

    await client.query('COMMIT')

    return precio
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const getPrecioByProducto = async (idProducto: number) => {
  const precio = await precioRepository.findPrecioByProductoId(idProducto)

  if (!precio) {
    throw new PrecioError('Precio no encontrado', 404)
  }

  return precio
}

export const updatePrecio = async (
  idProducto: number,
  payload: ActualizarPrecioInput,
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const producto = await productoRepository.findProductoById(
      idProducto,
      client,
    )

    if (!producto) {
      throw new PrecioError('Producto no encontrado', 404)
    }

    const currentPrecio = await precioRepository.findPrecioByProductoId(
      idProducto,
      client,
    )

    if (!currentPrecio) {
      throw new PrecioError('Precio no encontrado', 404)
    }

    const precioSugerido = calcularPrecioSugerido(
      Number(producto.costo_base),
      payload.margen_ganancia,
    )

    const precio = await precioRepository.updatePrecioByProductoId(
      idProducto,
      {
        margen_ganancia: payload.margen_ganancia,
        precio_sugerido: precioSugerido,
      },
      client,
    )

    await client.query('COMMIT')

    return precio
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
