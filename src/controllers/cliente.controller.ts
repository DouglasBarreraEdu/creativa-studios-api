import type { Request, Response } from 'express'

import { ClienteError } from '../services/cliente.errors.js'
import * as clienteService from '../services/cliente.service.js'
import {
  validateClienteFilters,
  validateClienteId,
  validateCreateClienteInput,
  validateUpdateClienteInput,
} from '../validators/cliente.validator.js'

const handleClienteError = (
  error: unknown,
  res: Response,
  fallback: string,
) => {
  if (error instanceof ClienteError) {
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

export const createCliente = async (req: Request, res: Response) => {
  try {
    const validation = validateCreateClienteInput(req.body)

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const cliente = await clienteService.createCliente(validation.value)

    return res.status(201).json({
      success: true,
      message: 'Cliente creado correctamente',
      data: cliente,
    })
  } catch (error) {
    return handleClienteError(error, res, 'Error al crear cliente')
  }
}

export const listCliente = async (req: Request, res: Response) => {
  try {
    const validation = validateClienteFilters(
      req.query as Record<string, unknown>,
    )

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const data = await clienteService.listCliente(validation.value)

    return res.status(200).json({
      success: true,
      message: 'Clientes obtenidos correctamente',
      data,
    })
  } catch (error) {
    return handleClienteError(error, res, 'Error al listar clientes')
  }
}

export const getClienteById = async (req: Request, res: Response) => {
  try {
    const validation = validateClienteId(String(req.params.id))

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    const cliente = await clienteService.getClienteById(validation.value)

    return res.status(200).json({
      success: true,
      message: 'Cliente obtenido correctamente',
      data: cliente,
    })
  } catch (error) {
    return handleClienteError(error, res, 'Error al obtener cliente')
  }
}

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const idValidation = validateClienteId(String(req.params.id))

    if (!idValidation.value) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        data: null,
      })
    }

    const bodyValidation = validateUpdateClienteInput(req.body)

    if (!bodyValidation.value) {
      return res.status(400).json({
        success: false,
        message: bodyValidation.error,
        data: null,
      })
    }

    const cliente = await clienteService.updateCliente(
      idValidation.value,
      bodyValidation.value,
    )

    return res.status(200).json({
      success: true,
      message: 'Cliente actualizado correctamente',
      data: cliente,
    })
  } catch (error) {
    return handleClienteError(error, res, 'Error al actualizar cliente')
  }
}

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const validation = validateClienteId(String(req.params.id))

    if (!validation.value) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        data: null,
      })
    }

    await clienteService.deleteCliente(validation.value)

    return res.status(200).json({
      success: true,
      message: 'Cliente eliminado correctamente',
      data: null,
    })
  } catch (error) {
    return handleClienteError(error, res, 'Error al eliminar cliente')
  }
}
