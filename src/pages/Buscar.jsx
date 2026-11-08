import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buscarVuelo } from '../api/vuelos.js'
import { useAuth } from '../auth/AuthContext.jsx'
import CrearAlertaModal from '../components/CrearAlertaModal.jsx'
import DesgloseFactores from '../components/DesgloseFactores.jsx'
import FormField from '../components/FormField.jsx'
import MensajeError from '../components/MensajeError.jsx'
import ProbabilidadMedidor from '../components/ProbabilidadMedidor.jsx'
import RiesgoBadge from '../components/RiesgoBadge.jsx'
import Spinner from '../components/Spinner.jsx'
import {
  etiquetaFranja,
  extraerHoras,
  formatearFecha,
  formatearHora,
  normalizarIata,
  rangoFranja,
} from '../utils/formato.js'

const FORM_VACIO = { aerolinea: '', fecha: '', hora: '' }
const CODIGO_IATA = /^[A-Z0-9]{2,3}$/

export default function Buscar() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const resultadoRef = useRef(null)

  const [form, setForm] = useState({ ...FORM_VACIO })
  const [errores, setErrores] = useState({})
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [horasCercanas, setHorasCercanas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [alertaAbierta, setAlertaAbierta] = useState(false)

  useEffect(() => {
    if (resultado && resultadoRef.current) {
      resultadoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [resultado])

  const cambiar = (evento) => {
    const { name, value } = evento.target
    const nuevoValor = name === 'aerolinea' ? normalizarIata(value) : value
    setForm((actual) => ({ ...actual, [name]: nuevoValor }))
    setErrores((actual) => ({ ...actual, [name]: undefined }))
    setError(null)
    setHorasCercanas([])
    setResultado(null)
  }

  const validar = () => {
    const nuevos = {}
    if (!form.aerolinea) {
      nuevos.aerolinea = 'Ingresá el código IATA de la aerolínea.'
    } else if (!CODIGO_IATA.test(form.aerolinea)) {
      nuevos.aerolinea =
        'El código IATA debe tener 2 o 3 letras o números (por ejemplo, AR).'
    }
    if (!form.fecha) {
      nuevos.fecha = 'Elegí la fecha del vuelo.'
    }
    if (!form.hora) {
      nuevos.hora = 'Ingresá la hora de salida.'
    }
    return nuevos
  }

  const buscar = async (evento) => {
    evento.preventDefault()
    const nuevosErrores = validar()
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setCargando(true)
    setError(null)
    setHorasCercanas([])
    setResultado(null)
    try {
      const respuesta = await buscarVuelo({
        aerolinea: form.aerolinea,
        fecha: form.fecha,
        hora: form.hora,
      })
      setResultado(respuesta)
    } catch (err) {
      setError(err)
      if (err.status === 404) {
        const detalle = err.data?.detail || err.message
        setHorasCercanas(extraerHoras(detalle))
      }
    } finally {
      setCargando(false)
    }
  }

  const limpiar = () => {
    setForm({ ...FORM_VACIO })
    setErrores({})
    setResultado(null)
    setError(null)
    setHorasCercanas([])
  }

  const probarHora = (hora) => {
    setForm((actual) => ({ ...actual, hora }))
    setError(null)
    setHorasCercanas([])
  }

  const crearAlerta = () => {
    if (!usuario) {
      navigate('/login', { state: { from: location } })
      return
    }
    setAlertaAbierta(true)
  }

  const vuelo = resultado?.vuelo
  const consultable = Boolean(vuelo?.es_consultable)
  const nivel = vuelo?.nivel_riesgo

  return (
    <div className="pagina">
      <header className="pagina__encabezado">
        <p className="eyebrow">Consulta puntual</p>
        <h1 className="pagina__titulo">Buscar vuelo</h1>
        <p className="pagina__bajada">
          Elegí aerolínea, fecha y hora de salida. Te mostramos la probabilidad
          de cancelación, los factores que influyen y una alternativa si el
          riesgo es alto.
        </p>
      </header>

      <form className="busqueda-card" onSubmit={buscar} noValidate>
        <div className="form-fila">
          <FormField
            label="Aerolínea (IATA)"
            htmlFor="buscar-aerolinea"
            error={errores.aerolinea}
            hint="Por ejemplo: AR, LA, G3"
            required
          >
            <input
              id="buscar-aerolinea"
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
            htmlFor="buscar-fecha"
            error={errores.fecha}
            required
          >
            <input
              id="buscar-fecha"
              className="input"
              name="fecha"
              type="date"
              value={form.fecha}
              onChange={cambiar}
            />
          </FormField>

          <FormField
            label="Hora de salida"
            htmlFor="buscar-hora"
            error={errores.hora}
            hint="Formato de 24 horas"
            required
          >
            <input
              id="buscar-hora"
              className="input"
              name="hora"
              type="time"
              value={form.hora}
              onChange={cambiar}
            />
          </FormField>
        </div>

        <div className="busqueda-card__acciones">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={cargando}
          >
            {cargando ? 'Buscando...' : 'Buscar vuelo'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={limpiar}
            disabled={cargando}
          >
            Limpiar
          </button>
        </div>
      </form>

      {cargando ? (
        <div className="carga-bloque">
          <Spinner texto="Consultando el vuelo y calculando el riesgo..." />
        </div>
      ) : null}

      {error ? (
        <div className="resultado-error">
          <MensajeError error={error} />
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
                    onClick={() => probarHora(hora)}
                  >
                    {hora}
                  </button>
                ))}
              </div>
              <p className="muted texto-chico">
                Elegí un horario y volvé a buscar para ver su probabilidad.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {resultado && vuelo ? (
        <div className="resultado" ref={resultadoRef}>
          <section className="resultado-principal">
            <div className="resultado-principal__cabecera">
              <div>
                <p className="eyebrow">{vuelo.aerolinea_nombre}</p>
                <h2 className="resultado-principal__titulo">
                  {vuelo.aerolinea} {vuelo.numero_vuelo}
                </h2>
                <p className="muted texto-chico">
                  {vuelo.ruta} · {formatearFecha(vuelo.fecha_salida)} ·{' '}
                  {formatearHora(vuelo.hora_salida_programada)} →{' '}
                  {formatearHora(vuelo.hora_llegada_programada)}
                </p>
              </div>
              <span className="badge badge--neutro">{vuelo.estado}</span>
            </div>

            <div className="resultado-principal__cuerpo">
              <ProbabilidadMedidor
                valor={resultado.probabilidad_cancelacion}
                texto={vuelo.probabilidad_cancelacion_vuelo_txt}
                nivel={nivel}
              />

              <div className="resultado-principal__meta">
                {consultable ? <RiesgoBadge nivel={nivel} /> : null}
                {resultado.riesgo_alto ? (
                  <p className="alerta-aviso">
                    El riesgo es alto. Revisá la alternativa sugerida antes de
                    confirmar tu viaje.
                  </p>
                ) : (
                  <p className="muted texto-chico">
                    El riesgo no supera el umbral para sugerir una alternativa.
                  </p>
                )}
                {vuelo.tasa_cancelacion_aerolinea_txt ? (
                  <p className="muted texto-chico">
                    Tasa histórica de {vuelo.aerolinea}:{' '}
                    {vuelo.tasa_cancelacion_aerolinea_txt}
                  </p>
                ) : null}
                {vuelo.condicion_climatica ? (
                  <p className="muted texto-chico">
                    Clima en origen: {vuelo.condicion_climatica}
                  </p>
                ) : null}

                {consultable ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--bloque"
                    onClick={crearAlerta}
                  >
                    Crear alerta
                  </button>
                ) : (
                  <p className="muted texto-chico">
                    Solo se pueden crear alertas sobre vuelos programados.
                  </p>
                )}
              </div>
            </div>
          </section>

          {resultado.alternativa ? (
            <aside className="alternativa-card">
              <p className="eyebrow">Alternativa sugerida</p>
              <h3 className="alternativa-card__titulo">
                {resultado.alternativa.aerolinea}
              </h3>
              <p className="alternativa-card__franja">
                {etiquetaFranja(resultado.alternativa.franja)}
              </p>
              <p className="muted texto-chico">
                Horario recomendado: {rangoFranja(resultado.alternativa.franja)}
              </p>
              <dl className="alternativa-card__datos">
                <div>
                  <dt>Tasa de cancelación</dt>
                  <dd>
                    {formatearPorcentaje(
                      resultado.alternativa.tasa_cancelacion,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Tasa de cumplimiento</dt>
                  <dd>
                    {formatearPorcentaje(
                      resultado.alternativa.tasa_cumplimiento,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Vuelos analizados</dt>
                  <dd>{resultado.alternativa.cantidad_vuelos}</dd>
                </div>
              </dl>
              <p className="muted texto-chico">
                La alternativa se basa en la franja horaria con menor riesgo
                histórico para esta ruta.
              </p>
            </aside>
          ) : resultado.riesgo_alto ? (
            <aside className="alternativa-card alternativa-card--vacia">
              <p className="eyebrow">Alternativa sugerida</p>
              <p className="muted">
                No encontramos una alternativa con menor riesgo para esta ruta
                con los datos disponibles.
              </p>
            </aside>
          ) : null}

          {consultable ? (
            <>
              <section className="card card__cuerpo resultado-bloque">
                <div className="resultado-bloque__encabezado">
                  <h3 className="card__titulo">Desglose del riesgo de cancelación</h3>
                  <span className="muted texto-chico">
                    Cómo influye cada factor
                  </span>
                </div>
                <DesgloseFactores desglose={vuelo.desglose} />
              </section>

              <section className="card card__cuerpo resultado-bloque">
                <div className="resultado-bloque__encabezado">
                  <h3 className="card__titulo">Desglose del riesgo de retraso</h3>
                  {vuelo.tasa_demora_aerolinea_txt ? (
                    <span className="muted texto-chico">
                      Tasa de la aerolínea:{' '}
                      {vuelo.tasa_demora_aerolinea_txt}
                    </span>
                  ) : null}
                </div>
                <DesgloseFactores desglose={vuelo.desglose_demora} />
              </section>
            </>
          ) : (
            <div className="alerta-aviso">
              Probabilidad no disponible: el vuelo ya no está programado, por lo
              que no se calculan los factores de riesgo.
            </div>
          )}
        </div>
      ) : null}

      <CrearAlertaModal
        vuelo={vuelo}
        abierto={alertaAbierta}
        onCerrar={() => setAlertaAbierta(false)}
      />
    </div>
  )
}
