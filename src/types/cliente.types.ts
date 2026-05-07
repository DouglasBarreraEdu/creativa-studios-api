export interface Cliente {
  id: number
  nombre: string
  telefono: string | null
}

export interface CrearClienteInput {
  nombre: string
  telefono?: string
}

export interface ActualizarClienteInput {
  nombre?: string
  telefono?: string
}

export interface ClienteFilters {
  page: number
  limit: number
  search?: string
}

export interface ClienteListItem {
  id: number
  nombre: string
  telefono: string | null
}

export interface ClienteListResult {
  items: ClienteListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
