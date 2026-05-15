import { Router, type Router as RouterType } from 'express'

import { listInstaladores } from '../controllers/usuario.controller.js'
import { validateJWT } from '../middlewares/validate-jwt.middleware.js'
import { validateRole } from '../middlewares/validate-role.middleware.js'

const usuarioRouter: RouterType = Router()

usuarioRouter.get(
  '/instaladores',
  /* #swagger.tags = ['Usuario']
     #swagger.summary = 'Listar instaladores'
     #swagger.description = 'Obtiene usuarios activos del sistema con rol INSTALADOR para asignarlos a instalaciones.'
  */

  validateJWT,
  validateRole('ADMIN', 'RECEPCION'),
  listInstaladores,
)

export default usuarioRouter
