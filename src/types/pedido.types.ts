export const PEDIDO_ESTADOS = [
  'pendiente',
  'produccion',
  'finalizado',
  'cancelado',
  'entregado',
] as const

export type PedidoEstado = (typeof PEDIDO_ESTADOS)[number]

export interface Pedido {
  id: number
  estado: PedidoEstado
  fecha_creacion: Date
  fecha_entrega: Date | string | null
  total_pedido: number
  id_cliente: number
  id_usuario: number
}

export interface DetallePedidoInput {
  id_producto: number
  cantidad: number
}

export interface CrearPedidoInput {
  id_cliente: number
  fecha_entrega?: string
  detalles: DetallePedidoInput[]
}

export interface ActualizarPedidoInput {
  id_cliente: number
  fecha_entrega?: string
  detalles: DetallePedidoInput[]
}

export interface ActualizarEstadoPedidoInput {
  estado: PedidoEstado
}

export interface PedidoFilters {
  page: number
  limit: number
  estado?: PedidoEstado
  idCliente?: number
  idUsuario?: number
}

export interface PedidoListProductoItem {
  id_producto: number
  producto_nombre: string
  cantidad: number
}

export interface PedidoListItem {
  id: number
  estado: PedidoEstado
  fecha_creacion: Date
  fecha_entrega: Date | string | null
  total_pedido: number

  id_cliente: number
  cliente_nombre: string
  cliente_nombre_comercial: string
  cliente_nombre_contacto: string

  id_usuario: number
  usuario_nombre: string

  producto_resumen: string
  total_items: number
  productos: PedidoListProductoItem[]
}

export interface PedidoDetalleItem {
  id: number
  id_pedido: number
  id_producto: number
  producto_nombre: string
  producto_codigo: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface PedidoDetalle {
  id: number
  estado: PedidoEstado
  fecha_creacion: Date
  fecha_entrega: Date | string | null
  total_pedido: number

  id_cliente: number
  cliente_nombre: string
  cliente_nombre_comercial: string
  cliente_nombre_contacto: string
  cliente_telefono: string | null

  id_usuario: number
  usuario_nombre: string
  usuario_email: string

  detalles: PedidoDetalleItem[]
}

export interface PedidoListResult {
  items: PedidoListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PedidoInventarioDetalle {
  id_detalle: number
  id_producto: number
  producto_nombre: string
  cantidad: number
  id_insumo_inventario: number | null
}
