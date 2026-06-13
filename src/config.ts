// Acá se exportan las variables de entorno (.env)

// Credenciales de la base de datos
export const POSTGRES_USER = process.env.POSTGRES_USER
export const POSTGRES_HOST = process.env.POSTGRES_HOST
export const POSTGRES_DB = process.env.POSTGRES_DB
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD

// Puerto del servidor
export const PORT = process.env.PORT || 4000
