import { apiFetch } from './client.js'

export function login(credenciales) {
  return apiFetch('/api/auth/login/', {
    method: 'POST',
    body: credenciales,
    auth: false,
  })
}

export function registro(datos) {
  return apiFetch('/api/auth/registro/', {
    method: 'POST',
    body: datos,
    auth: false,
  })
}

export function me() {
  return apiFetch('/api/auth/me/')
}

export function logout(refresh) {
  return apiFetch('/api/auth/logout/', {
    method: 'POST',
    body: { refresh },
    redirigirSiFalla: false,
  })
}
