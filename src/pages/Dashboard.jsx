import { useCallback, useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { obtenerDashboard } from '../api/dashboard.js'
import EstadoVacio from '../components/EstadoVacio.jsx'
import MensajeError from '../components/MensajeError.jsx'
import Spinner from '../components/Spinner.jsx'
import StatCard from '../components/StatCard.jsx'
import { formatearMes, formatearPorcentaje } from '../utils/formato.js'

const ORDEN_DIAS = [2, 3, 4, 5, 6, 7, 1]

function ordenarDias(items) {
  const porDia = new Map((items || []).map((item) => [item.dia, item]))
  return ORDEN_DIAS.map((dia) => porDia.get(dia)).filter(Boolean)
}

const ESTILO_TOOLTIP = {
  borderRadius: 8,
  border: '1px solid #dbe3ef',
  fontSize: 12,
  boxShadow: '0 4px 14px rgba(24, 34, 52, 0.12)',
}

export default function Dashboard() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [reintento, setReintento] = useState(0)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await obtenerDashboard()
      setDatos(respuesta)
    } catch (err) {
      setError(err)
      setDatos(null)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar, reintento])

  if (cargando) {
    return (
      <div className="pagina">
        <header className="pagina__encabezado">
          <p className="eyebrow">Panel de métricas</p>
          <h1 className="pagina__titulo">Dashboard</h1>
        </header>
        <div className="contenedor-carga-pantalla">
          <Spinner texto="Cargando métricas del mes..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pagina">
        <header className="pagina__encabezado">
          <p className="eyebrow">Panel de métricas</p>
          <h1 className="pagina__titulo">Dashboard</h1>
        </header>
        <MensajeError
          error={error}
          onReintentar={() => setReintento((valor) => valor + 1)}
        />
      </div>
    )
  }

  const globales = datos?.globales || {}
  const cancelacionesDia = ordenarDias(datos?.cancelaciones_por_dia_semana)
  const demoras = (datos?.demora_promedio_por_aerolinea || []).slice(0, 8)
  const topImpuntuales = datos?.top_aerolineas_impuntuales_mes || []
  const topTresImpuntuales = topImpuntuales.slice(0, 3)

  return (
    <div className="pagina">
      <header className="pagina__encabezado">
        <p className="eyebrow">Panel de métricas</p>
        <h1 className="pagina__titulo">Dashboard de {formatearMes(datos?.mes_actual)}</h1>
        <p className="pagina__bajada">
          Resumen de cancelaciones, demoras y puntualidad de las aerolíneas que
          operan en Ezeiza.
        </p>
      </header>

      <section className="stat-grid">
        <StatCard
          etiqueta="Vuelos del mes"
          valor={globales.total_vuelos_mes ?? 0}
          nota="Total de vuelos registrados"
        />
        <StatCard
          etiqueta="Cancelados"
          valor={globales.cancelados_mes ?? 0}
          nota="Vuelos cancelados en el mes"
        />
        <StatCard
          etiqueta="Retrasados"
          valor={globales.retrasados_mes ?? 0}
          nota="Vuelos con demora registrada"
        />
        <StatCard
          etiqueta="Tasa de cancelación"
          valor={formatearPorcentaje(globales.tasa_cancelacion_mes)}
          nota="Cancelados sobre el total del mes"
          destacado
        />
      </section>

      <div className="grid-dos">
        <section className="grafico-card">
          <div className="grafico-card__encabezado">
            <h2 className="grafico-card__titulo">
              Cancelaciones por día de la semana
            </h2>
            <p className="grafico-card__bajada">
              Histórico completo de vuelos cancelados según el día.
            </p>
          </div>
          <div className="grafico-card__cuerpo">
            {cancelacionesDia.length === 0 ? (
              <EstadoVacio
                titulo="Sin cancelaciones registradas"
                mensaje="Cuando la base tenga vuelos con desenlace, el gráfico va a mostrar la distribución semanal."
              />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cancelacionesDia} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7ecf4" vertical={false} />
                  <XAxis
                    dataKey="nombre"
                    tick={{ fontSize: 12, fill: '#62708a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#62708a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={ESTILO_TOOLTIP}
                    formatter={(valor) => [valor, 'Cancelaciones']}
                  />
                  <Bar
                    dataKey="cancelaciones"
                    fill="#1d5bb8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={54}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="grafico-card">
          <div className="grafico-card__encabezado">
            <h2 className="grafico-card__titulo">
              Demora promedio por aerolínea
            </h2>
            <p className="grafico-card__bajada">
              Aerolíneas con mayor demora promedio, en minutos.
            </p>
          </div>
          <div className="grafico-card__cuerpo">
            {demoras.length === 0 ? (
              <EstadoVacio
                titulo="Sin demoras registradas"
                mensaje="Todavía no hay vuelos con demora cargada para calcular promedios por aerolínea."
              />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={demoras}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7ecf4" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#62708a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="aerolinea"
                    width={54}
                    tick={{ fontSize: 12, fill: '#62708a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={ESTILO_TOOLTIP}
                    formatter={(valor) => [`${valor} min`, 'Demora promedio']}
                  />
                  <Bar
                    dataKey="promedio_minutos"
                    fill="#0f8b8d"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="seccion">
        <div className="seccion__encabezado">
          <div>
            <h2 className="seccion__titulo">Aerolíneas más impuntuales del mes</h2>
            <p className="seccion__bajada">
              Top de aerolíneas por cantidad de vuelos cancelados o retrasados.
            </p>
          </div>
        </div>

        {topImpuntuales.length === 0 ? (
          <EstadoVacio
            titulo="Sin datos de impuntualidad"
            mensaje="Este mes todavía no tiene vuelos cancelados ni retrasados para rankear aerolíneas."
          />
        ) : (
          <>
            <div className="grafico-card">
              <div className="grafico-card__encabezado">
                <h3 className="grafico-card__titulo">
                  Top 3: cancelados y retrasados por aerolínea
                </h3>
                <p className="grafico-card__bajada">
                  Las tres aerolíneas con más vuelos cancelados y retrasados del
                  mes.
                </p>
              </div>
              <div className="grafico-card__cuerpo">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={topTresImpuntuales}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7ecf4" vertical={false} />
                    <XAxis
                      dataKey="aerolinea"
                      tick={{ fontSize: 12, fill: '#62708a' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#62708a' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={ESTILO_TOOLTIP} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="cancelados"
                      name="Cancelados"
                      fill="#b3261e"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={54}
                    />
                    <Bar
                      dataKey="retrasados"
                      name="Retrasados"
                      fill="#9a6200"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={54}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="tabla-wrap">
              <table className="tabla">
                <caption className="solo-lectores">
                  Aerolíneas más impuntuales del mes
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Aerolínea</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Vuelos</th>
                    <th scope="col">Cancelados</th>
                    <th scope="col">Retrasados</th>
                    <th scope="col">Impuntuales</th>
                  </tr>
                </thead>
                <tbody>
                  {topImpuntuales.map((aerolinea) => (
                    <tr key={aerolinea.aerolinea}>
                      <td className="tabla__principal">{aerolinea.aerolinea}</td>
                      <td>{aerolinea.nombre}</td>
                      <td>{aerolinea.total}</td>
                      <td>{aerolinea.cancelados}</td>
                      <td>{aerolinea.retrasados}</td>
                      <td>
                        <strong>{aerolinea.impuntuales}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
