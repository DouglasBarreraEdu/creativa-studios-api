import type { Request, Response } from 'express'

import { ProductoError } from '../services/producto.errors.js'
import * as productoService from '../services/producto.service.js'
import {
  validateCreateProductoInput,
  validateProductoFilters,
  validateProductoId,
  validateUpdateProductoInput,
} from '../validators/producto.validator.js'

const handleProductoError = (
  error: unknown,
  res: Response,
  fallback: string,
) => {
  if (error instanceof ProductoError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: null,
    })
  }

  console.error(error)

  return res.status(500).json({
    success: false,
    message: fallback,
    data: null,
  })
}

export const createProducto = async (req: Request, res: Response) => {
  try {
    const validation = validateCreateProductoInput(req.body)

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const producto = await productoService.createProducto(
      validation.value,
    )

    return res.status(201).json({
      success: true,
      message: 'Producto creado correctamente',
      data: producto,
    })
  } catch (error) {
    return handleProductoError(error, res, 'Error al crear producto')
  }
}

export const listProducto = async (req: Request, res: Response) => {
  try {
    const validation = validateProductoFilters(
      req.query as Record<string, unknown>,
    )

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const data = await productoService.listProducto(validation.value)

    return res.status(200).json({
      success: true,
      message: 'Producto obtenido correctamente',
      data,
    })
  } catch (error) {
    return handleProductoError(error, res, 'Error al listar producto')
  }
}

export const getProductoById = async (req: Request, res: Response) => {
  try {
    const validation = validateProductoId(String(req.params.id))

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const producto = await productoService.getProductoById(
      validation.value,
    )

    return res.status(200).json({
      success: true,
      message: 'Registro de producto obtenido correctamente',
      data: producto,
    })
  } catch (error) {
    return handleProductoError(error, res, 'Error al obtener producto')
  }
}

export const updateProducto = async (req: Request, res: Response) => {
  try {
    const idValidation = validateProductoId(String(req.params.id))

    if (!idValidation.value) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        data: null,
      })
    }

    const bodyValidation = validateUpdateProductoInput(req.body)

    if (!bodyValidation.value) {
      return res.status(400).json({
        success: false,
        message: bodyValidation.error,
        data: null,
      })
    }

    const producto = await productoService.updateProducto(
      idValidation.value,
      bodyValidation.value,
    )

    return res.status(200).json({
      success: true,
      message: 'Producto actualizado correctamente',
      data: producto,
    })
  } catch (error) {
    return handleProductoError(error, res, 'Error al actualizar producto')
  }
}

export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const validation = validateProductoId(String(req.params.id))

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    await productoService.deleteProducto(validation.value)

    return res.status(200).json({
      success: true,
      message: 'Producto eliminado correctamente',
      data: null,
    })
  } catch (error) {
    return handleProductoError(error, res, 'Error al eliminar producto')
  }
}
