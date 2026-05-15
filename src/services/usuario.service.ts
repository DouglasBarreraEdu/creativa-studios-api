import * as usuarioRepository from '../repositories/usuario.repository.js'

export const listInstaladores = async () => {
  return usuarioRepository.listInstaladores()
}
