import type { QueryResultRow } from 'pg'

import { pool } from '../db.js'
import type { UsuarioInstalador } from '../types/usuario.types.js'

const mapUsuarioInstalador = <T extends QueryResultRow>(
  row: T,
): UsuarioInstalador => ({
  id: row.id,
  nombre: row.nombre,
})

export const listInstaladores = async (): Promise<UsuarioInstalador[]> => {
  const result = await pool.query(
    `SELECT u.id,
            u.nombre
     FROM usuario u
     INNER JOIN rol r ON r.id = u.id_rol
     WHERE r.nombre = 'INSTALADOR'
     ORDER BY u.nombre ASC, u.id ASC`,
  )

  return result.rows.map(mapUsuarioInstalador)
}
