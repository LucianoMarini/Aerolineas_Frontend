import { apiFetch } from './client.js'

function query(params) {
  const busqueda = new URLSearchParams()
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
      busqueda.set(clave, String(valor).trim())
    }
  })
  const texto = busqueda.toString()
  return texto ? `?${texto}` : ''
}

export function listarVuelos({ limit = 20, offset = 0, ...filtros } = {}) {
  return apiFetch(
    `/api/vuelos/${query({ limit, offset, ...filtros })}`,
    { auth: false },
  )
}

export function buscarVuelo({ aerolinea, fecha, hora }) {
  return apiFetch(
    `/api/vuelos/buscar/${query({ aerolinea, fecha, hora })}`,
    { auth: false },
  )
}

export function topAerolineasRiesgo() {
  return apiFetch('/api/aerolineas/top-riesgo/', { auth: false })
}
