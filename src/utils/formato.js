const NOMBRES_FRANJA = {
  madrugada: 'Madrugada',
  manana: 'Mañana',
  mañana: 'Mañana',
  tarde: 'Tarde',
  noche: 'Noche',
}

const RANGOS_FRANJA = {
  madrugada: '00:00 a 06:00',
  manana: '06:00 a 12:00',
  mañana: '06:00 a 12:00',
  tarde: '12:00 a 18:00',
  noche: '18:00 a 24:00',
}

const NOMBRES_ESTADO = {
  PROG: 'Programado',
  ENVU: 'En vuelo',
  ATER: 'Aterrizado',
  CANC: 'Cancelado',
  RETR: 'Retrasado',
}

export function formatearPorcentaje(valor, decimales = 2) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return 'No disponible'
  }
  return `${(Number(valor) * 100).toFixed(decimales)}%`
}

export function formatearHora(hora) {
  if (!hora) return '—'
  return String(hora).slice(0, 5)
}

export function formatearHoraCompleta(hora) {
  if (!hora) return '—'
  const [h, m] = String(hora).split(':')
  return `${h}:${m ?? '00'}`
}

export function formatearFecha(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = String(fecha).slice(0, 10).split('-')
  if (!anio || !mes || !dia) return fecha
  return `${dia}/${mes}/${anio}`
}

export function formatearFechaHora(fecha, hora) {
  return `${formatearFecha(fecha)} · ${formatearHora(hora)}`
}

export function formatearFechaHoraIso(iso) {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fecha)
}

export function etiquetaFranja(franja) {
  if (!franja) return '—'
  return NOMBRES_FRANJA[franja] || franja
}

export function rangoFranja(franja) {
  if (!franja) return ''
  return RANGOS_FRANJA[franja] || ''
}

export function etiquetaEstado(codigo, texto) {
  if (texto) return texto
  return NOMBRES_ESTADO[codigo] || codigo || '—'
}

export function esPisoTecnico(valor) {
  const numero = Number(valor)
  return Number.isFinite(numero) && Math.abs(numero - 0.0001) < 1e-9
}

export function hoyIso() {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

export function normalizarIata(valor) {
  return String(valor || '')
    .trim()
    .toUpperCase()
}

export function formatearMes(mesIso) {
  if (!mesIso) return '—'
  const [anio, mes] = String(mesIso).split('-')
  if (!anio || !mes) return mesIso
  const fecha = new Date(Number(anio), Number(mes) - 1, 1)
  const texto = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(fecha)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function extraerHoras(mensaje) {
  if (!mensaje) return []
  const coincidencias = String(mensaje).match(/\b\d{2}:\d{2}\b/g)
  return coincidencias ? [...new Set(coincidencias)] : []
}
