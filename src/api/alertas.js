import { apiFetch } from './client.js'

export function listarAlertas() {
  return apiFetch('/api/alertas/')
}

export function crearAlerta({ vueloId, umbralRiesgo }) {
  return apiFetch('/api/alertas/', {
    method: 'POST',
    body: {
      vuelo_id: vueloId,
      umbral_riesgo: umbralRiesgo,
    },
  })
}

export function eliminarAlerta(id) {
  return apiFetch(`/api/alertas/${id}/`, { method: 'DELETE' })
}
