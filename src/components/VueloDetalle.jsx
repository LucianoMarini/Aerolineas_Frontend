import { useEffect, useId } from 'react'
import {
  etiquetaFranja,
  formatearFecha,
  formatearHora,
  formatearPorcentaje,
} from '../utils/formato.js'
import DesgloseFactores from './DesgloseFactores.jsx'
import ProbabilidadMedidor from './ProbabilidadMedidor.jsx'
import RiesgoBadge from './RiesgoBadge.jsx'

function Dato({ etiqueta, valor }) {
  return (
    <div className="detalle-lista__item">
      <span className="detalle-lista__etiqueta">{etiqueta}</span>
      <span className="detalle-lista__valor">{valor || '—'}</span>
    </div>
  )
}

export default function VueloDetalle({ vuelo, onCerrar }) {
  const tituloId = useId()

  useEffect(() => {
    if (!vuelo) return undefined
    const alPresionar = (evento) => {
      if (evento.key === 'Escape') onCerrar()
    }
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', alPresionar)
    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', alPresionar)
    }
  }, [vuelo, onCerrar])

  if (!vuelo) return null

  const consultable = Boolean(vuelo.es_consultable)

  return (
    <div
      className="modal-fondo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar()
      }}
    >
      <div
        className="modal modal--ancho"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
      >
        <div className="modal__cabecera">
          <div>
            <p className="eyebrow">
              {vuelo.aerolinea_nombre || vuelo.aerolinea}
            </p>
            <h2 className="modal__titulo" id={tituloId}>
              {vuelo.aerolinea} {vuelo.numero_vuelo}
            </h2>
            <p className="muted texto-chico">
              {vuelo.ruta} · {formatearFecha(vuelo.fecha_salida)} ·{' '}
              {formatearHora(vuelo.hora_salida_programada)} →{' '}
              {formatearHora(vuelo.hora_llegada_programada)}
            </p>
          </div>
          <button
            type="button"
            className="modal__cerrar"
            onClick={onCerrar}
            aria-label="Cerrar detalle"
          >
            ×
          </button>
        </div>

        <div className="detalle-lista">
          <Dato etiqueta="Estado" valor={vuelo.estado} />
          <Dato etiqueta="Clima en origen" valor={vuelo.condicion_climatica} />
          <Dato etiqueta="Franja horaria" valor={etiquetaFranja(vuelo.franja_horaria)} />
          <Dato
            etiqueta="Tasa histórica de la aerolínea"
            valor={
              vuelo.tasa_cancelacion_aerolinea_txt ||
              (vuelo.tasa_cancelacion_aerolinea !== undefined
                ? formatearPorcentaje(vuelo.tasa_cancelacion_aerolinea)
                : 'No disponible')
            }
          />
        </div>

        {consultable ? (
          <>
            <div className="modal__bloque">
              <div className="modal__bloque-encabezado">
                <h3 className="modal__subtitulo">Riesgo de cancelación</h3>
                <RiesgoBadge nivel={vuelo.nivel_riesgo} />
              </div>
              <ProbabilidadMedidor
                valor={vuelo.probabilidad_cancelacion}
                texto={vuelo.probabilidad_cancelacion_vuelo_txt}
                nivel={vuelo.nivel_riesgo}
              />
              <DesgloseFactores desglose={vuelo.desglose} />
            </div>

            <div className="modal__bloque">
              <div className="modal__bloque-encabezado">
                <h3 className="modal__subtitulo">Riesgo de retraso</h3>
                {vuelo.tasa_demora_aerolinea_txt ? (
                  <span className="badge badge--neutro">
                    Tasa de la aerolínea: {vuelo.tasa_demora_aerolinea_txt}
                  </span>
                ) : null}
              </div>
              <DesgloseFactores desglose={vuelo.desglose_demora} />
            </div>
          </>
        ) : (
          <div className="alerta-aviso">
            Probabilidad no disponible: solo se calcula para vuelos
            programados.
          </div>
        )}

        <div className="modal__acciones">
          <button type="button" className="btn btn--ghost" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
