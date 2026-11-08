import { apiFetch } from './client.js'

export function obtenerDashboard() {
  return apiFetch('/api/dashboard/')
}
