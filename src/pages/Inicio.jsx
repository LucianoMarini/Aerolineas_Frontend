import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarVuelos, topAerolineasRiesgo } from '../api/vuelos.js'
import Disclaimer from '../components/Disclaimer.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'
import MensajeError from '../components/MensajeError.jsx'
import RiesgoBadge from '../components/RiesgoBadge.jsx'
import Spinner from '../components/Spinner.jsx'
import TablaVuelos from '../components/TablaVuelos.jsx'
import VueloDetalle from '../components/VueloDetalle.jsx'
import { formatearPorcentaje } from '../utils/formato.js'

export default function Inicio() {
  const [top, setTop] = useState([])
  const [vuelos, setVuelos] = useState([])
  const [disclaimer, setDisclaimer] = useState('')
  const [cargandoTop, setCargandoTop] = useState(true)
  const [cargandoVuelos, setCargandoVuelos] = useState(true)
  const [errorTop, setErrorTop] = useState(null)
  const [errorVuelos, setErrorVuelos] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)

  const cargarTop = useCallback(async () => {
    setCargandoTop(true)
    setErrorTop(null)
    try {
      setTop(await topAerolineasRiesgo())
    } catch (error) {
      setErrorTop(error)
    } finally {
      setCargandoTop(false)
    }
  }, [])

  const cargarVuelos = useCallback(async () => {
    setCargandoVuelos(true)
    setErrorVuelos(null)
    try {
      const data = await listarVuelos({ limit: 10 })
      setVuelos(data.results || [])
      setDisclaimer(data.disclaimer || '')
    } catch (error) {
      setErrorVuelos(error)
    } finally {
      setCargandoVuelos(false)
    }
  }, [])

  const yaCargado = useRef(false)

  useEffect(() => {
    if (yaCargado.current) return
    yaCargado.current = true
    cargarTop()
    cargarVuelos()
  }, [cargarTop, cargarVuelos])

  return (
    <div className="pagina">
      <section className="hero">
        <div className="hero__contenido">
          <p className="eyebrow">Aeropuerto de Ezeiza · EZE</p>
          <h1 className="hero__titulo">
            Anticipá el riesgo de tu vuelo antes de salir de casa
          </h1>
          <p className="hero__texto">
            Consultá la probabilidad de cancelación y retraso de los vuelos
            programados, mirá qué factores influyen y compará alternativas para
            viajar con más tranquilidad.
          </p>
          <div className="hero__acciones">
            <Link to="/buscar" className="btn btn--primary">
              Buscar mi vuelo
            </Link>
            <Link to="/vuelos" className="btn btn--ghost">
              Ver vuelos del día
            </Link>
          </div>
        </div>
        <div className="hero__panel">
          <div className="hero__dato">
            <span className="hero__dato-valor">30 min</span>
            <span className="hero__dato-texto">
              de validez del acceso, con renovación automática
            </span>
          </div>
          <div className="hero__dato">
            <span className="hero__dato-valor">4</span>
            <span className="hero__dato-texto">
              franjas horarias analizadas por vuelo
            </span>
          </div>
          <div className="hero__dato">
            <span className="hero__dato-valor">3</span>
            <span className="hero__dato-texto">
              factores explicados: día, franja y clima
            </span>
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="seccion__encabezado">
          <div>
            <h2 className="seccion__titulo">Aerolíneas con mayor riesgo</h2>
            <p className="seccion__bajada">
              Ranking histórico de cancelaciones sobre vuelos ya resueltos.
            </p>
          </div>
          <Link to="/vuelos" className="link texto-chico">
            Ver vuelos
          </Link>
        </div>

        {cargandoTop ? (
          <div className="carga-bloque">
            <Spinner texto="Cargando ranking de riesgo..." />
          </div>
        ) : errorTop ? (
          <MensajeError error={errorTop} onReintentar={cargarTop} />
        ) : top.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no hay historial de aerolíneas"
            mensaje="El ranking se arma con vuelos que ya tienen un desenlace. Cuando la recolección acumule datos, las aerolíneas van a aparecer acá."
            accion={
              <Link to="/buscar" className="btn btn--ghost btn--sm">
                Buscar un vuelo
              </Link>
            }
          />
        ) : (
          <div className="top-riesgo">
            {top.map((aerolinea) => (
              <article key={aerolinea.aerolinea} className="top-riesgo__item">
                <div className="top-riesgo__cabecera">
                  <div className="top-riesgo__identidad">
                    <span className="top-riesgo__codigo">
                      {aerolinea.aerolinea}
                    </span>
                    <div>
                      <p className="top-riesgo__nombre">{aerolinea.nombre}</p>
                      <p className="top-riesgo__meta">
                        {aerolinea.cantidad_vuelos} vuelos analizados
                      </p>
                    </div>
                  </div>
                  <RiesgoBadge nivel={aerolinea.nivel_riesgo} />
                </div>
                <div className="top-riesgo__medida">
                  <span className="top-riesgo__prob">
                    {formatearPorcentaje(aerolinea.probabilidad_cancelacion)}
                  </span>
                  <span className="top-riesgo__meta">
                    tasa histórica de cancelación
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="seccion">
        <div className="seccion__encabezado">
          <div>
            <h2 className="seccion__titulo">Vuelos de hoy</h2>
            <p className="seccion__bajada">
              Hacé clic en un vuelo programado para ver el desglose por factor.
            </p>
          </div>
          <Link to="/vuelos" className="link texto-chico">
            Ver todos los vuelos
          </Link>
        </div>

        <Disclaimer texto={disclaimer} />

        {cargandoVuelos ? (
          <div className="carga-bloque">
            <Spinner texto="Cargando vuelos de hoy..." />
          </div>
        ) : errorVuelos ? (
          <MensajeError error={errorVuelos} onReintentar={cargarVuelos} />
        ) : vuelos.length === 0 ? (
          <EstadoVacio
            titulo="No hay vuelos cargados para hoy"
            mensaje="La base todavía no tiene vuelos de la fecha. Probá con una búsqueda específica o volvé más tarde."
            accion={
              <Link to="/buscar" className="btn btn--ghost btn--sm">
                Buscar un vuelo
              </Link>
            }
          />
        ) : (
          <TablaVuelos vuelos={vuelos} onSeleccionar={setSeleccionado} />
        )}
      </section>

      {seleccionado ? (
        <VueloDetalle
          vuelo={seleccionado}
          onCerrar={() => setSeleccionado(null)}
        />
      ) : null}
    </div>
  )
}
