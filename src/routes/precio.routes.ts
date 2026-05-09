import { Router, type Router as RouterType } from 'express'

import {
  createPrecio,
  getPrecioByProducto,
  listPrecio,
  updatePrecio,
} from '../controllers/precio.controller.js'
import { validateJWT } from '../middlewares/validate-jwt.middleware.js'
import { validateRole } from '../middlewares/validate-role.middleware.js'

const precioRouter: RouterType = Router()

precioRouter.post(
  '/',
  /* #swagger.tags = ['Precio']
     #swagger.summary = 'Crear precio para producto (ADMIN)'
     #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         id_producto: 1,
         margen_ganancia: 30
       }
     }
  */

  validateJWT,
  validateRole('ADMIN'),
  createPrecio,
)

precioRouter.get(
  '/',
  /* #swagger.tags = ['Precio']
     #swagger.summary = 'Listar precios'
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
       description: 'Texto para buscar por nombre de producto',
       type: 'string',
       required: false,
       example: 'camisa'
     }
  */

  validateJWT,
  listPrecio,
)

precioRouter.get(
  '/producto/:idProducto',
  /* #swagger.tags = ['Precio']
     #swagger.summary = 'Obtener precio por producto'
  */

  validateJWT,
  getPrecioByProducto,
)

precioRouter.patch(
  '/producto/:idProducto',
  /* #swagger.tags = ['Precio']
     #swagger.summary = 'Actualizar margen de ganancia de un producto (ADMIN)'
     #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         margen_ganancia: 35
       }
     }
  */

  validateJWT,
  validateRole('ADMIN'),
  updatePrecio,
)

export default precioRouter
