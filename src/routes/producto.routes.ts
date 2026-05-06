import { Router, type Router as RouterType } from 'express'

import {
  createProducto,
  deleteProducto,
  getProductoById,
  listProducto,
  updateProducto,
} from '../controllers/producto.controller.js'
import { validateJWT } from '../middlewares/validate-jwt.middleware.js'
import { validateRole } from '../middlewares/validate-role.middleware.js'

const productoRouter: RouterType = Router()

productoRouter.post(
  '/',
  /* #swagger.tags = ['Producto']
     #swagger.summary = 'Crear insumo/material de producto (ADMIN)'
     #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         nombre: 'Camisas Talla S blanco 100% algodón',
         tipo: 'insumo',
         costo_base: 5.25,
         codigo: '1234',
         id_insumo_inventario: 1
       }
     }
  */

  validateJWT,
  validateRole('ADMIN'),
  createProducto,
)

productoRouter.get(
  '/',
  /* #swagger.tags = ['Producto']
     #swagger.summary = 'Listar producto'
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
       example: 'camisas'
     }
  */

  validateJWT,
  listProducto,
)

productoRouter.get(
  '/:id',
  /* #swagger.tags = ['Producto']
     #swagger.summary = 'Obtener producto por id'
  */

  validateJWT,
  getProductoById,
)

productoRouter.patch(
  '/:id',
  /* #swagger.tags = ['Producto']
     #swagger.summary = 'Actualizar producto sin modificar stock_actual (ADMIN)'
     #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         nombre: 'Camisas Talla S blanco 100% algodón',
         tipo: 'insumo',
         costo_base: 5.25,
         codigo: '1234',
         id_insumo_inventario: 1
       }
     }
  */

  validateJWT,
  validateRole('ADMIN'),
  updateProducto,
)

productoRouter.delete(
  '/:id',
  /* #swagger.tags = ['Producto']
     #swagger.summary = 'Eliminar producto si no tiene referencias (ADMIN)'
  */

  validateJWT,
  validateRole('ADMIN'),
  deleteProducto,
)

export default productoRouter
