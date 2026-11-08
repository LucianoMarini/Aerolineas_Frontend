import { useEffect, useId, useState } from 'react'
import { buscarVuelo } from '../api/vuelos.js'
import { crearAlerta as crearAlertaApi } from '../api/alertas.js'
import {
  etiquetaFranja,
  extraerHoras,
  formatearFecha,
  formatearHora,
  hoyIso,
  normalizarIata,
} from '../utils/formato.js'
import FormField from './FormField.jsx'
import MensajeError from './MensajeError.jsx'
import ProbabilidadMedidor from './ProbabilidadMedidor.jsx'

const CODIGO_IATA = /^[A-Z0-9]{2,3}$/

function formInicial() {
  return { aerolinea: '', fecha: hoyIso(), hora: '' }
}

export default function NuevaAlertaModal({ abierto, onCerrar, onCreada }) {
  const tituloId = useId()
  const [form, setForm] = useState(formInicial)
  const [errores, setErrores] = useState({})
  const [umbral, setUmbral] = useState(50)
  const [vuelo, setVuelo] = useState(null)
  const [probabilidad, setProbabilidad] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState(null)
  const [horasCercanas, setHorasCercanas] = useState([])
  const [exito, setExito] = useState(false)

  useEffect(() => {
    if (!abierto) return
    setForm(formInicial())
    setErrores({})
    setUmbral(50)
    setVuelo(null)
    setProbabilidad(null)
    setBuscando(false)
    setCreando(false)
    setError(null)
    setHorasCercanas([])
    setExito(false)
  }, [abierto])

  useEffect(() => {
    if (!abierto) return undefined
    const alPresionar = (evento) => {
      if (evento.key === 'Escape' && !buscando && !creando) onCerrar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto, buscando, creando, onCerrar])

  if (!abierto) return null

  const cambiar = (evento) => {
    const { name, value } = evento.target
    const nuevoValor = name === 'aerolinea' ? normalizarIata(value) : value
    setForm((actual) => ({ ...actual, [name]: nuevoValor }))
    setErrores((actual) => ({ ...actual, [name]: undefined }))
    setError(null)
    setHorasCercanas([])
    setVuelo(null)
    setProbabilidad(null)
  }

  const validar = () => {
    const nuevos = {}
    if (!form.aerolinea) {
      nuevos.aerolinea = 'Ingresá el código IATA de la aerolínea.'
    } else if (!CODIGO_IATA.test(form.aerolinea)) {
      nuevos.aerolinea = 'Usá un código IATA de 2 o 3 caracteres.'
    }
    if (!form.fecha) nuevos.fecha = 'Elegí la fecha del vuelo.'
    if (!form.hora) nuevos.hora = 'Ingresá la hora de salida.'
    return nuevos
  }

  const buscar = async (evento) => {
    evento.preventDefault()
    const nuevosErrores = validar()
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setBuscando(true)
    setError(null)
    setHorasCercanas([])
    setVuelo(null)
    setProbabilidad(null)
    try {
      const respuesta = await buscarVuelo({
        aerolinea: form.aerolinea,
        fecha: form.fecha,
        hora: form.hora,
      })
      setVuelo(respuesta.vuelo)
      setProbabilidad(respuesta.probabilidad_cancelacion)
    } catch (err) {
      setError(err)
      if (err.status === 404) {
        setHorasCercanas(extraerHoras(err.data?.detail || err.message))
      }
    } finally {
      setBuscando(false)
    }
  }

  const confirmar = async () => {
    if (!vuelo) return
    setCreando(true)
    setError(null)
    try {
      await crearAlertaApi({
        vueloId: vuelo.id,
        umbralRiesgo: umbral / 100,
      })
      setExito(true)
      onCreada?.()
    } catch (err) {
      setError(err)
    } finally {
      setCreando(false)
    }
  }

  const volverABuscar = () => {
    setVuelo(null)
    setProbabilidad(null)
    setError(null)
    setHorasCercanas([])
  }

  const reiniciar = () => {
    setForm(formInicial())
    setErrores({})
    setUmbral(50)
    setVuelo(null)
    setProbabilidad(null)
    setError(null)
    setHorasCercanas([])
    setExito(false)
  }

  return (
    <div
      className="modal-fondo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !buscando && !creando) {
          onCerrar()
        }
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
      >
        <div className="modal__cabecera">
          <div>
            <h2 className="modal__titulo" id={tituloId}>
              Nueva alerta
            </h2>
            <p className="muted texto-chico">
              Buscá el vuelo que querés vigilar y elegí el umbral de riesgo.
            </p>
          </div>
          <button
            type="button"
            className="modal__cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
            disabled={buscando || creando}
          >
            ×
          </button>
        </div>

        {exito ? (
          <>
            <div className="mensaje-exito">
              La alerta quedó registrada. Te vamos a avisar por email cuando el
              riesgo de cancelación supere el {umbral}%.
            </div>
            <div className="modal__acciones">
              <button type="button" className="btn btn--primary" onClick={onCerrar}>
                Listo
              </button>
              <button type="button" className="btn btn--ghost" onClick={reiniciar}>
                Crear otra
              </button>
            </div>
          </>
        ) : vuelo ? (
          <>
            <div className="alerta-preview">
              <div className="alerta-preview__cabecera">
                <div>
                  <p className="eyebrow">{vuelo.aerolinea_nombre}</p>
                  <h3 className="alerta-preview__titulo">
                    {vuelo.aerolinea} {vuelo.numero_vuelo}
                  </h3>
                  <p className="muted texto-chico">
                    {vuelo.ruta} · {formatearFecha(vuelo.fecha_salida)} ·{' '}
                    {formatearHora(vuelo.hora_salida_programada)} ·{' '}
                    {etiquetaFranja(vuelo.franja_horaria)}
                  </p>
                </div>
                <span className="badge badge--neutro">{vuelo.estado}</span>
              </div>

              {vuelo.es_consultable ? (
                <>
                  <ProbabilidadMedidor
                    valor={probabilidad}
                    texto={vuelo.probabilidad_cancelacion_vuelo_txt}
                    nivel={vuelo.nivel_riesgo}
                  />
                  <div className="rango-cabecera">
                    <label className="form-field__label" htmlFor="nueva-alerta-umbral">
                      Avisarme cuando el riesgo supere
                    </label>
                    <strong className="rango-valor">{umbral}%</strong>
                  </div>
                  <input
                    id="nueva-alerta-umbral"
                    className="rango"
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={umbral}
                    onChange={(evento) => setUmbral(Number(evento.target.value))}
                    disabled={creando}
                  />
                </>
              ) : (
                <div className="alerta-aviso">
                  Este vuelo ya no está programado: solo se pueden crear alertas
                  sobre vuelos programados.
                </div>
              )}

              {error ? <MensajeError error={error} /> : null}

              <div className="modal__acciones">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={volverABuscar}
                  disabled={creando}
                >
                  Cambiar búsqueda
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={confirmar}
                  disabled={creando || !vuelo.es_consultable}
                >
                  {creando ? 'Creando...' : 'Crear alerta'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <form className="form" onSubmit={buscar} noValidate>
            {error ? <MensajeError error={error} /> : null}

            {horasCercanas.length > 0 ? (
              <div className="sugerencias">
                <p className="sugerencias__titulo">
                  Hay vuelos de esa aerolínea y fecha en estos horarios:
                </p>
                <div className="sugerencias__chips">
                  {horasCercanas.map((hora) => (
                    <button
                      key={hora}
                      type="button"
                      className="chip"
                      onClick={() => {
                        setForm((actual) => ({ ...actual, hora }))
                        setError(null)
                        setHorasCercanas([])
                      }}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="form-fila">
              <FormField
                label="Aerolínea (IATA)"
                htmlFor="nueva-aerolinea"
                error={errores.aerolinea}
                required
              >
                <input
                  id="nueva-aerolinea"
                  className="input"
                  name="aerolinea"
                  value={form.aerolinea}
                  onChange={cambiar}
                  placeholder="AR"
                  maxLength={3}
                  autoComplete="off"
                />
              </FormField>

              <FormField
                label="Fecha"
                htmlFor="nueva-fecha"
                error={errores.fecha}
                required
              >
                <input
                  id="nueva-fecha"
                  className="input"
                  name="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={cambiar}
                />
              </FormField>

              <FormField
                label="Hora"
                htmlFor="nueva-hora"
                error={errores.hora}
                required
              >
                <input
                  id="nueva-hora"
                  className="input"
                  name="hora"
                  type="time"
                  value={form.hora}
                  onChange={cambiar}
                />
              </FormField>
            </div>

            <div className="modal__acciones">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={onCerrar}
                disabled={buscando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={buscando}
              >
                {buscando ? 'Buscando...' : 'Buscar vuelo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
