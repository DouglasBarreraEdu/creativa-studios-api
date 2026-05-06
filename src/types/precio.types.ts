export interface Precio {
  id: number
  margen_ganancia: number
  precio_sugerido: number
  id_producto: number
}

export interface CrearPrecioInput {
  id_producto: number
  margen_ganancia: number
}

export interface ActualizarPrecioInput {
  margen_ganancia: number
}
