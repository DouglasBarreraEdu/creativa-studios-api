import { Router, type Router as RouterType } from 'express'

import {
  createPrecio,
  getPrecioByProducto,
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
