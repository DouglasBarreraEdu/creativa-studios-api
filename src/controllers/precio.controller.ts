import type { Request, Response } from 'express'

import { PrecioError } from '../services/precio.errors.js'
import * as precioService from '../services/precio.service.js'
import {
  validateCreatePrecioInput,
  validatePrecioProductoId,
  validateUpdatePrecioInput,
} from '../validators/precio.validator.js'

const handlePrecioError = (error: unknown, res: Response, fallback: string) => {
  if (error instanceof PrecioError) {
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

export const createPrecio = async (req: Request, res: Response) => {
  try {
    const validation = validateCreatePrecioInput(req.body)

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const precio = await precioService.createPrecio(validation.value)

    return res.status(201).json({
      success: true,
      message: 'Precio creado correctamente',
      data: precio,
    })
  } catch (error) {
    return handlePrecioError(error, res, 'Error al crear precio')
  }
}

export const getPrecioByProducto = async (req: Request, res: Response) => {
  try {
    const validation = validatePrecioProductoId(String(req.params.idProducto))

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const precio = await precioService.getPrecioByProducto(validation.value)

    return res.status(200).json({
      success: true,
      message: 'Precio obtenido correctamente',
      data: precio,
    })
  } catch (error) {
    return handlePrecioError(error, res, 'Error al obtener precio')
  }
}

export const updatePrecio = async (req: Request, res: Response) => {
  try {
    const idValidation = validatePrecioProductoId(String(req.params.idProducto))

    if (!idValidation.value) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        data: null,
      })
    }

    const bodyValidation = validateUpdatePrecioInput(req.body)

    if (!bodyValidation.value) {
      return res.status(400).json({
        success: false,
        message: bodyValidation.error,
        data: null,
      })
    }

    const precio = await precioService.updatePrecio(
      idValidation.value,
      bodyValidation.value,
    )

    return res.status(200).json({
      success: true,
      message: 'Precio actualizado correctamente',
      data: precio,
    })
  } catch (error) {
    return handlePrecioError(error, res, 'Error al actualizar precio')
  }
}
