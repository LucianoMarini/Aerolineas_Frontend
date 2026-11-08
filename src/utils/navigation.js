export function destinoSeguro(location) {
  const desdeState = location?.state?.from
  const desdeQuery = new URLSearchParams(location?.search || '').get('next')
  const destino = desdeState
    ? `${desdeState.pathname || ''}${desdeState.search || ''}`
    : desdeQuery

  if (!destino || !destino.startsWith('/') || destino.startsWith('//')) {
    return '/'
  }
  if (destino === '/login' || destino === '/registro') return '/'
  return destino
}
