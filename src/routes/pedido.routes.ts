import { Router, type Router as RouterType } from 'express'

import {
  createPedido,
  getPedidoById,
  listPedido,
  updatePedidoEstado,
} from '../controllers/pedido.controller.js'
import { validateJWT } from '../middlewares/validate-jwt.middleware.js'
import { validateRole } from '../middlewares/validate-role.middleware.js'

const pedidoRouter: RouterType = Router()

pedidoRouter.post(
  '/',
  /* #swagger.tags = ['Pedido']
     #swagger.summary = 'Crear pedido'
     #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: {
         id_cliente: 1,
         fecha_entrega: '2026-05-20',
         detalles: [
           {
             id_producto: 1,
             cantidad: 2
           },
           {
             id_producto: 2,
             cantidad: 5
           }
         ]
       }
     }
  */

  validateJWT,
  validateRole('ADMIN', 'RECEPCION'),
  createPedido,
)

pedidoRouter.get(
  '/',
  /* #swagger.tags = ['Pedido']
     #swagger.summary = 'Listar pedidos'
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
     #swagger.parameters['estado'] = {
       in: 'query',
       description: 'Filtrar por estado del pedido',
       type: 'string',
       required: false,
       example: 'pendiente'
     }
     #swagger.parameters['idCliente'] = {
       in: 'query',
       description: 'Filtrar por cliente',
       type: 'integer',
       required: false,
       example: 1
     }
     #swagger.parameters['idUsuario'] = {
       in: 'query',
       description: 'Filtrar por usuario que creó el pedido',
       type: 'integer',
       required: false,
       example: 1
     }
  */

  validateJWT,
  validateRole('ADMIN', 'RECEPCION', 'PRODUCCION', 'INSTALADOR'),
  listPedido,
)

pedidoRouter.get(
  '/:id',
  /* #swagger.tags = ['Pedido']
     #swagger.summary = 'Obtener pedido por id con detalle'
  */

  validateJWT,
  validateRole('ADMIN', 'RECEPCION', 'PRODUCCION', 'INSTALADOR'),
  getPedidoById,
)

pedidoRouter.patch(
  '/:id/estado',
  /* #swagger.tags = ['Pedido']
     #swagger.summary = 'Actualizar estado del pedido'
     #swagger.description = 'Actualiza el estado del pedido según el flujo permitido del MVP. Al cambiar de pendiente a produccion, se descuenta inventario automáticamente y se registra un movimiento de salida. Al cambiar de produccion a cancelado, se devuelve el stock descontado y se registra un movimiento de entrada. Si el pedido pasa de pendiente a cancelado, no se afecta inventario.'
     #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       description: 'Nuevo estado del pedido. Estados permitidos: pendiente, produccion, finalizado, cancelado, entregado.',
       schema: {
         estado: 'cancelado'
       }
     }
     #swagger.responses[200] = {
       description: 'Estado del pedido actualizado correctamente'
     }
     #swagger.responses[400] = {
       description: 'Estado inválido o datos incorrectos'
     }
     #swagger.responses[403] = {
       description: 'No tiene permisos para cambiar a ese estado'
     }
     #swagger.responses[404] = {
       description: 'Pedido no encontrado'
     }
     #swagger.responses[409] = {
       description: 'Transición de estado no permitida o conflicto con inventario'
     }
  */

  validateJWT,
  validateRole('ADMIN', 'RECEPCION', 'PRODUCCION'),
  updatePedidoEstado,
)

export default pedidoRouter
