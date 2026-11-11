import { apiFetch } from './client.js'

export function obtenerEstadoRecoleccion() {
  return apiFetch('/api/recoleccion/estado/')
}

export function forzarRecoleccion({ aerolinea, horas } = {}) {
  return apiFetch('/api/recoleccion/forzar/', {
    method: 'POST',
    body: {
      aerolinea: aerolinea || null,
      horas: horas || null,
    },
  })
}

export function actualizarRecoleccionAutomatica(activa) {
  return apiFetch('/api/recoleccion/automatica/', {
    method: 'PUT',
    body: { activa },
  })
}

export function obtenerHistorialRecoleccion() {
  return apiFetch('/api/recoleccion/historial/')
}

export function reentrenarPredictor() {
  return apiFetch('/api/recoleccion/reentrenar/', { method: 'POST' })
}

export function notificarAlertas() {
  return apiFetch('/api/alertas/notificar/', { method: 'POST' })
}

export function actualizarClima() {
  return apiFetch('/api/clima/actualizar/', { method: 'POST' })
}
