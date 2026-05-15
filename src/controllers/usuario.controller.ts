import type { Request, Response } from 'express'

import * as usuarioService from '../services/usuario.service.js'

export const listInstaladores = async (_req: Request, res: Response) => {
  try {
    const instaladores = await usuarioService.listInstaladores()

    return res.status(200).json({
      success: true,
      message: 'Instaladores obtenidos correctamente',
      data: instaladores,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Error al listar instaladores',
      data: null,
    })
  }
}
