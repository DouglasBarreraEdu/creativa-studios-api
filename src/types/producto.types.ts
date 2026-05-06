export interface Producto {
  id: number
  nombre: string
  tipo: string
  costo_base: number
  codigo: string
  id_insumo_inventario: number
  created_at: Date
}

export interface CrearProductoInput {
  nombre: string
  tipo: string
  costo_base: number
  codigo: string
  id_insumo_inventario: number
}

export interface ActualizarProductoInput {
  nombre?: string
  tipo?: string
  costo_base?: number
  codigo?: string
  id_insumo_inventario?: number
}

export interface ProductoFilters {
  page: number
  limit: number
  search?: string
  codigo?: string
}

export interface ProductoListItem {
  id: number
  nombre: string
  tipo: string
  costo_base: number
  codigo: string
  id_insumo_inventario: number
  created_at: Date
}

export interface ProductoListResult {
  items: ProductoListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
