import { apiUrl } from './config.js'

const ACCESS_KEY = 'vuelos_eze_access'
const REFRESH_KEY = 'vuelos_eze_refresh'
const TIEMPO_MAX_MS = 30000

const MENSAJES_POR_ESTADO = {
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión venció. Volvé a iniciar sesión.',
  403: 'No tenés permisos para realizar esta acción.',
  404: 'No encontramos lo que buscabas.',
  429: 'Se alcanzó el límite de consultas de la API. Probá más tarde.',
  503: 'El servicio externo no está disponible en este momento.',
}

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

function primerMensaje(data) {
  if (!data || typeof data !== 'object') return null
  if (typeof data.detail === 'string') return data.detail
  for (const valor of Object.values(data)) {
    if (Array.isArray(valor) && valor.length > 0) return String(valor[0])
    if (typeof valor === 'string') return valor
  }
  return null
}

export function mensajeDeError(status, data) {
  return (
    primerMensaje(data) ||
    MENSAJES_POR_ESTADO[status] ||
    (status >= 500
      ? 'Ocurrió un error en el servidor. Probá de nuevo en unos instantes.'
      : 'Ocurrió un error inesperado.')
  )
}

function expirarSesion(redirigir) {
  clearTokens()
  window.dispatchEvent(new Event('auth:logout'))
  if (!redirigir) return

  const ruta = window.location.pathname
  if (ruta === '/login' || ruta === '/registro') return

  const destino = `${ruta}${window.location.search}`
  window.location.assign(`/login?next=${encodeURIComponent(destino)}`)
}

function parsearRespuesta(respuesta) {
  if (respuesta.status === 204) return null
  const tipo = respuesta.headers.get('content-type') || ''
  if (tipo.includes('application/json')) {
    return respuesta.json().catch(() => null)
  }
  return respuesta.text().then((texto) => texto || null)
}

let refrescoEnCurso = null

async function renovarAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return null

  if (!refrescoEnCurso) {
    refrescoEnCurso = (async () => {
      try {
        const respuesta = await fetch(apiUrl('/api/auth/refresh/'), {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh }),
        })
        if (!respuesta.ok) return null
        const data = await respuesta.json().catch(() => null)
        if (!data?.access) return null
        localStorage.setItem(ACCESS_KEY, data.access)
        return data.access
      } catch {
        return null
      } finally {
        refrescoEnCurso = null
      }
    })()
  }

  return refrescoEnCurso
}

function construirBody(body) {
  if (body === undefined || body === null) return undefined
  if (body instanceof FormData) return body
  return JSON.stringify(body)
}

/**
 * Cliente único de la API.
 *
 * - Agrega el header Authorization cuando `auth` es true.
 * - Ante un 401 intenta renovar el access token y reintenta una sola vez.
 * - Si la renovación falla, limpia la sesión y (en rutas protegidas)
 *   redirige a /login.
 */
export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    redirigirSiFalla = true,
    signal,
  } = options

  const hacerPedido = async (token) => {
    const cabeceras = { Accept: 'application/json', ...headers }
    const cuerpo = construirBody(body)
    if (cuerpo !== undefined && !(cuerpo instanceof FormData)) {
      cabeceras['Content-Type'] = cabeceras['Content-Type'] || 'application/json'
    }
    if (token) cabeceras.Authorization = `Bearer ${token}`

    const controlador = new AbortController()
    let demoroDemasiado = false
    const temporizador = setTimeout(() => {
      demoroDemasiado = true
      controlador.abort()
    }, TIEMPO_MAX_MS)

    const abortarExterno = () => controlador.abort()
    if (signal) {
      if (signal.aborted) controlador.abort()
      else signal.addEventListener('abort', abortarExterno)
    }

    try {
      return await fetch(apiUrl(path), {
        method,
        headers: cabeceras,
        body: cuerpo,
        signal: controlador.signal,
      })
    } catch (error) {
      if (demoroDemasiado) {
        throw new ApiError(
          'El servidor tardó demasiado en responder. Probá de nuevo en unos instantes.',
          0,
          null,
        )
      }
      if (error.name === 'AbortError') throw error
      throw new ApiError(
        'No pudimos conectarnos con el servidor. Revisá tu conexión o que el backend esté corriendo.',
        0,
        null,
      )
    } finally {
      clearTimeout(temporizador)
      if (signal) signal.removeEventListener('abort', abortarExterno)
    }
  }

  let token = auth ? getAccessToken() : null
  let respuesta = await hacerPedido(token)

  if (respuesta.status === 401 && auth && getRefreshToken()) {
    const nuevoAccess = await renovarAccessToken()
    if (nuevoAccess) {
      token = nuevoAccess
      respuesta = await hacerPedido(token)
    }

    if (!nuevoAccess || respuesta.status === 401) {
      expirarSesion(redirigirSiFalla)
      throw new ApiError(
        'Tu sesión venció. Volvé a iniciar sesión.',
        401,
        null,
      )
    }
  } else if (respuesta.status === 401 && auth) {
    expirarSesion(redirigirSiFalla)
  }

  const data = await parsearRespuesta(respuesta)

  if (!respuesta.ok) {
    const mensaje =
      respuesta.status === 401 && auth
        ? 'Tu sesión venció. Volvé a iniciar sesión.'
        : mensajeDeError(respuesta.status, data)
    throw new ApiError(mensaje, respuesta.status, data)
  }

  return data
}
