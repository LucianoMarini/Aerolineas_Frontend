import { apiFetch } from './client.js'

export function listarUsuarios() {
  return apiFetch('/api/usuarios/')
}

export function cambiarRol(usuarioId, rol) {
  return apiFetch(`/api/usuarios/${usuarioId}/rol/`, {
    method: 'POST',
    body: { rol },
  })
}
