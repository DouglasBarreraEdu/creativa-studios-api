export interface Precio {
  id: number
  margen_ganancia: number
  precio_sugerido: number
  id_producto: number
  nombre_producto: string | null
}

export interface PrecioFilters {
  page: number
  limit: number
  search?: string
}

export interface PrecioListResult {
  items: Precio[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CrearPrecioInput {
  id_producto: number
  margen_ganancia: number
}

export interface ActualizarPrecioInput {
  margen_ganancia: number
}
