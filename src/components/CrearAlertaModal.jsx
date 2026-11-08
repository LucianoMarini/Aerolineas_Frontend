import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { crearAlerta as crearAlertaApi } from '../api/alertas.js'
import { formatearFecha, formatearHora, formatearPorcentaje } from '../utils/formato.js'
import MensajeError from './MensajeError.jsx'

export default function CrearAlertaModal({ vuelo, abierto, onCerrar }) {
  const tituloId = useId()
  const [umbral, setUmbral] = useState(50)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    if (!abierto) return
    setUmbral(50)
    setError(null)
    setExito(false)
    setEnviando(false)
  }, [abierto, vuelo?.id])

  useEffect(() => {
    if (!abierto) return undefined
    const alPresionar = (evento) => {
      if (evento.key === 'Escape' && !enviando) onCerrar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto, enviando, onCerrar])

  if (!abierto || !vuelo) return null

  const enviar = async (evento) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await crearAlertaApi({
        vueloId: vuelo.id,
        umbralRiesgo: umbral / 100,
      })
      setExito(true)
    } catch (err) {
      setError(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className="modal-fondo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !enviando) onCerrar()
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
      >
        <h2 className="modal__titulo" id={tituloId}>
          Crear alerta de vuelo
        </h2>
        <p className="modal__mensaje">
          Te avisamos por email cuando la probabilidad de cancelación de{' '}
          <strong>
            {vuelo.aerolinea} {vuelo.numero_vuelo}
          </strong>{' '}
          ({vuelo.ruta}, {formatearFecha(vuelo.fecha_salida)} a las{' '}
          {formatearHora(vuelo.hora_salida_programada)}) supere el umbral que
          elijas.
        </p>

        {exito ? (
          <>
            <div className="mensaje-exito">
              La alerta quedó registrada. Vas a recibir un email cuando el riesgo
              supere el {umbral}%.
            </div>
            <div className="modal__acciones">
              <Link to="/alertas" className="btn btn--primary" onClick={onCerrar}>
                Ir a mis alertas
              </Link>
              <button type="button" className="btn btn--ghost" onClick={onCerrar}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <form className="form" onSubmit={enviar}>
            {error ? <MensajeError error={error} /> : null}

            <div className="form-field">
              <div className="rango-cabecera">
                <label className="form-field__label" htmlFor="alerta-umbral">
                  Umbral de riesgo
                </label>
                <strong className="rango-valor">{umbral}%</strong>
              </div>
              <input
                id="alerta-umbral"
                className="rango"
                type="range"
                min="1"
                max="100"
                step="1"
                value={umbral}
                onChange={(evento) => setUmbral(Number(evento.target.value))}
                disabled={enviando}
              />
              <p className="form-field__hint">
                Riesgo actual del vuelo:{' '}
                {vuelo.probabilidad_cancelacion_vuelo_txt ||
                  formatearPorcentaje(vuelo.probabilidad_cancelacion)}
              </p>
            </div>

            <div className="modal__acciones">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={onCerrar}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={enviando}
              >
                {enviando ? 'Creando...' : 'Crear alerta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
