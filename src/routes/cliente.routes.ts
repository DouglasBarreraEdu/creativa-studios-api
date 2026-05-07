import { Router, type Router as RouterType } from 'express'

import {
  createCliente,
  deleteCliente,
  getClienteById,
  listCliente,
  updateCliente,
} from '../controllers/cliente.controller.js'
import { validateJWT } from '../middlewares/validate-jwt.middleware.js'
import { validateRole } from '../middlewares/validate-role.middleware.js'

const clienteRouter: RouterType = Router()

clienteRouter.post(
  '/',
  /* #swagger.tags = ['Cliente']
     #swagger.summary = 'Crear cliente'
     #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         nombre: 'Juan Perez',
         telefono: '77777777'
       }
     }
  */

  validateJWT,
  validateRole('ADMIN', 'RECEPCION'),
  createCliente,
)

clienteRouter.get(
  '/',
  /* #swagger.tags = ['Cliente']
     #swagger.summary = 'Listar clientes'
     #swagger.parameters['page'] = {
       in: 'query',
       description: 'Número de página a consultar',
       type: 'integer',
       required: false,
       example: 1
     }
     #swagger.parameters['limit'] = {
       in: 'query',
       description: 'Cantidad de registros por página',
       type: 'integer',
       required: false,
       example: 10
     }
     #swagger.parameters['search'] = {
       in: 'query',
       description: 'Texto para buscar por nombre o telefono',
       type: 'string',
       required: false,
       example: 'Juan'
     }
  */

  validateJWT,
  listCliente,
)

clienteRouter.get(
  '/:id',
  /* #swagger.tags = ['Cliente']
     #swagger.summary = 'Obtener cliente por id'
  */

  validateJWT,
  getClienteById,
)

clienteRouter.patch(
  '/:id',
  /* #swagger.tags = ['Cliente']
     #swagger.summary = 'Actualizar cliente'
     #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         nombre: 'Juan Perez',
         telefono: '77777777'
       }
     }
  */

  validateJWT,
  validateRole('ADMIN', 'RECEPCION'),
  updateCliente,
)

clienteRouter.delete(
  '/:id',
  /* #swagger.tags = ['Cliente']
     #swagger.summary = 'Eliminar cliente si no tiene pedidos asociados'
  */

  validateJWT,
  validateRole('ADMIN'),
  deleteCliente,
)

export default clienteRouter
