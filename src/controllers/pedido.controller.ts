import type { Response } from 'express'

import { PedidoError } from '../services/pedido.errors.js'
import * as pedidoService from '../services/pedido.service.js'
import type { AuthRequest } from '../types/auth.types.js'
import {
  validateCreatePedidoInput,
  validatePedidoFilters,
  validatePedidoId,
  validateUpdatePedidoEstadoInput,
} from '../validators/pedido.validator.js'

const handlePedidoError = (error: unknown, res: Response, fallback: string) => {
  if (error instanceof PedidoError) {
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

export const createPedido = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        data: null,
      })
    }

    const validation = validateCreatePedidoInput(req.body)

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const pedido = await pedidoService.createPedido(
      validation.value,
      req.user.id,
    )

    return res.status(201).json({
      success: true,
      message: 'Pedido creado correctamente',
      data: pedido,
    })
  } catch (error) {
    return handlePedidoError(error, res, 'Error al crear pedido')
  }
}

export const listPedido = async (req: AuthRequest, res: Response) => {
  try {
    const validation = validatePedidoFilters(
      req.query as Record<string, unknown>,
    )

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const data = await pedidoService.listPedido(validation.value)

    return res.status(200).json({
      success: true,
      message: 'Pedidos obtenidos correctamente',
      data,
    })
  } catch (error) {
    return handlePedidoError(error, res, 'Error al listar pedidos')
  }
}

export const getPedidoById = async (req: AuthRequest, res: Response) => {
  try {
    const validation = validatePedidoId(String(req.params.id))

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const pedido = await pedidoService.getPedidoById(validation.value)

    return res.status(200).json({
      success: true,
      message: 'Pedido obtenido correctamente',
      data: pedido,
    })
  } catch (error) {
    return handlePedidoError(error, res, 'Error al obtener pedido')
  }
}

export const updatePedidoEstado = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.role) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        data: null,
      })
    }

    const idValidation = validatePedidoId(String(req.params.id))

    if (!idValidation.value) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        data: null,
      })
    }

    const bodyValidation = validateUpdatePedidoEstadoInput(req.body)

    if (!bodyValidation.value) {
      return res.status(400).json({
        success: false,
        message: bodyValidation.error,
        data: null,
      })
    }

    const pedido = await pedidoService.updatePedidoEstado(
      idValidation.value,
      bodyValidation.value.estado,
      req.user.role,
    )

    return res.status(200).json({
      success: true,
      message: 'Estado del pedido actualizado correctamente',
      data: pedido,
    })
  } catch (error) {
    return handlePedidoError(
      error,
      res,
      'Error al actualizar estado del pedido',
    )
  }
}
