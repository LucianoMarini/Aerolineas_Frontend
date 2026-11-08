import { useState } from 'react'
import { compararRuta } from '../api/rutas.js'
import EstadoVacio from '../components/EstadoVacio.jsx'
import FormField from '../components/FormField.jsx'
import MensajeError from '../components/MensajeError.jsx'
import Spinner from '../components/Spinner.jsx'
import {
  etiquetaFranja,
  formatearPorcentaje,
  normalizarIata,
  rangoFranja,
} from '../utils/formato.js'

const CODIGO_IATA = /^[A-Z]{3}$/

const CLASIFICACION = {
  estable: { texto: 'Ruta estable', clase: 'badge--baja' },
  critica: { texto: 'Ruta crítica', clase: 'badge--alta' },
}

export default function Rutas() {
  const [form, setForm] = useState({ origen: '', destino: '' })
  const [errores, setErrores] = useState({})
  const [consulta, setConsulta] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  const cambiar = (evento) => {
    const { name, value } = evento.target
    setForm((actual) => ({ ...actual, [name]: normalizarIata(value) }))
    setErrores((actual) => ({ ...actual, [name]: undefined }))
    setError(null)
  }

  const validar = () => {
    const nuevos = {}
    if (!form.origen) {
      nuevos.origen = 'Ingresá el aeropuerto de origen.'
    } else if (!CODIGO_IATA.test(form.origen)) {
      nuevos.origen = 'Usá el código IATA de 3 letras (por ejemplo, EZE).'
    }
    if (!form.destino) {
      nuevos.destino = 'Ingresá el aeropuerto de destino.'
    } else if (!CODIGO_IATA.test(form.destino)) {
      nuevos.destino = 'Usá el código IATA de 3 letras (por ejemplo, COR).'
    }
    if (
      form.origen &&
      form.destino &&
      form.origen === form.destino &&
      !nuevos.origen &&
      !nuevos.destino
    ) {
      nuevos.destino = 'El origen y el destino tienen que ser distintos.'
    }
    return nuevos
  }

  const comparar = async (parametros) => {
    setCargando(true)
    setError(null)
    setResultado(null)
    try {
      const respuesta = await compararRuta(parametros)
      setResultado(respuesta)
      setConsulta(parametros)
    } catch (err) {
      setError(err)
    } finally {
      setCargando(false)
    }
  }

  const enviar = (evento) => {
    evento.preventDefault()
    const nuevosErrores = validar()
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return
    comparar({ origen: form.origen, destino: form.destino })
  }

  const limpiar = () => {
    setForm({ origen: '', destino: '' })
    setErrores({})
    setResultado(null)
    setError(null)
    setConsulta(null)
  }

  const clasificacion = resultado
    ? CLASIFICACION[resultado.clasificacion?.clasificacion] || {
        texto: resultado.clasificacion?.clasificacion || 'Sin clasificar',
        clase: 'badge--neutro',
      }
    : null

  return (
    <div className="pagina">
      <header className="pagina__encabezado">
        <p className="eyebrow">Requiere sesión</p>
        <h1 className="pagina__titulo">Comparar ruta</h1>
        <p className="pagina__bajada">
          Compará el historial de cada aerolínea en una ruta y mirá si la ruta es
          estable o crítica según la variabilidad de sus cancelaciones.
        </p>
      </header>

      <form className="busqueda-card" onSubmit={enviar} noValidate>
        <div className="form-fila">
          <FormField
            label="Origen (IATA)"
            htmlFor="ruta-origen"
            error={errores.origen}
            hint="Por ejemplo: EZE"
            required
          >
            <input
              id="ruta-origen"
              className="input"
              name="origen"
              value={form.origen}
              onChange={cambiar}
              placeholder="EZE"
              maxLength={3}
              autoComplete="off"
            />
          </FormField>

          <FormField
            label="Destino (IATA)"
            htmlFor="ruta-destino"
            error={errores.destino}
            hint="Por ejemplo: COR"
            required
          >
            <input
              id="ruta-destino"
              className="input"
              name="destino"
              value={form.destino}
              onChange={cambiar}
              placeholder="COR"
              maxLength={3}
              autoComplete="off"
            />
          </FormField>
        </div>

        <div className="busqueda-card__acciones">
          <button type="submit" className="btn btn--primary" disabled={cargando}>
            {cargando ? 'Comparando...' : 'Comparar ruta'}
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
          <Spinner texto="Comparando aerolíneas de la ruta..." />
        </div>
      ) : null}

      {error ? (
        <MensajeError
          error={error}
          onReintentar={consulta ? () => comparar(consulta) : undefined}
        />
      ) : null}

      {!cargando && !error && !resultado ? (
        <EstadoVacio
          titulo="Elegí una ruta para comparar"
          mensaje="Ingresá el origen y el destino con sus códigos IATA. Por ejemplo, EZE → COR para Ezeiza a Córdoba."
        />
      ) : null}

      {resultado ? (
        <>
          <section className="ruta-resumen card card__cuerpo">
            <div className="ruta-resumen__ruta">
              <p className="eyebrow">Resultado de la comparación</p>
              <h2 className="ruta-resumen__titulo">
                {resultado.ruta?.origen} → {resultado.ruta?.destino}
              </h2>
              <p className="muted texto-chico">
                {resultado.ranking?.length || 0}{' '}
                {resultado.ranking?.length === 1
                  ? 'combinación con datos suficientes'
                  : 'combinaciones con datos suficientes'}
              </p>
            </div>
            <div className="ruta-resumen__clasificacion">
              <span className={`badge ${clasificacion.clase}`}>
                {clasificacion.texto}
              </span>
              <p className="muted texto-chico">
                Desvío estándar mensual:{' '}
                {formatearPorcentaje(
                  resultado.clasificacion?.desvio_estandar ?? 0,
                )}
              </p>
              <p className="muted texto-chico">
                Meses analizados: {resultado.clasificacion?.meses_analizados ?? 0}
              </p>
            </div>
          </section>

          {(resultado.clasificacion?.meses_analizados ?? 0) < 2 ? (
            <p className="alerta-aviso">
              Hay menos de 2 meses de historial: la clasificación de la ruta es
              estimativa y puede cambiar cuando se acumulen más datos.
            </p>
          ) : null}

          {resultado.ranking?.length === 0 ? (
            <EstadoVacio
              titulo="No hay datos suficientes para comparar"
              mensaje="Ninguna combinación de aerolínea y franja horaria alcanza el mínimo de 30 vuelos históricos en esta ruta."
            />
          ) : (
            <div className="tabla-wrap">
              <table className="tabla">
                <caption className="solo-lectores">
                  Comparación de aerolíneas en la ruta
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Puesto</th>
                    <th scope="col">Aerolínea</th>
                    <th scope="col">Franja</th>
                    <th scope="col">Vuelos</th>
                    <th scope="col">Tasa de cancelación</th>
                    <th scope="col">Tasa de cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.ranking.map((item) => (
                    <tr key={`${item.aerolinea_id}-${item.franja}`}>
                      <td>
                        {item.puesto === 1 ? (
                          <span className="badge badge--info">Mejor opción</span>
                        ) : (
                          <span className="tabla__principal">{item.puesto}</span>
                        )}
                      </td>
                      <td className="tabla__principal">{item.aerolinea}</td>
                      <td>
                        <span className="celda-apilada">
                          <span>{etiquetaFranja(item.franja)}</span>
                          <span className="tabla__secundario">
                            {rangoFranja(item.franja)}
                          </span>
                        </span>
                      </td>
                      <td>{item.cantidad_vuelos}</td>
                      <td>{formatearPorcentaje(item.tasa_cancelacion)}</td>
                      <td>
                        <strong>{formatearPorcentaje(item.tasa_cumplimiento)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
