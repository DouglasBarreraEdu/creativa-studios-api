import pg from 'pg'
import {
  POSTGRES_DB,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  POSTGRES_HOST,
} from './config.js'

// Conexión a la base de datos
export const pool = new pg.Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST || 'localhost',
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: 5432,
})
