import { apiFetch } from './client.js'

export function compararRuta({ origen, destino }) {
  const params = new URLSearchParams({ origen, destino })
  return apiFetch(`/api/rutas/comparar/?${params.toString()}`)
}
