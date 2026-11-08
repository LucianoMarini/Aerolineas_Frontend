import {
  esPisoTecnico,
  formatearFecha,
  formatearHora,
  formatearPorcentaje,
} from '../utils/formato.js'
import RiesgoBadge from './RiesgoBadge.jsx'

const CLASE_ESTADO = {
  PROG: 'badge--info',
  ENVU: 'badge--info',
  ATER: 'badge--neutro',
  CANC: 'badge--alta',
  RETR: 'badge--media',
}

function CeldaProbabilidad({ vuelo }) {
  if (!vuelo.es_consultable) {
    return <span className="muted texto-chico">No disponible</span>
  }
  const valor = vuelo.probabilidad_cancelacion
  if (valor === null || valor === undefined) {
    return <span className="muted texto-chico">No disponible</span>
  }
  return (
    <span className="celda-apilada">
      <strong>
        {vuelo.probabilidad_cancelacion_vuelo_txt ||
          formatearPorcentaje(valor)}
      </strong>
      {esPisoTecnico(valor) ? (
        <span className="tabla__secundario">pocos datos</span>
      ) : null}
    </span>
  )
}

export default function TablaVuelos({ vuelos, onSeleccionar }) {
  return (
    <div className="tabla-wrap">
      <table className="tabla">
        <caption className="solo-lectores">Listado de vuelos</caption>
        <thead>
          <tr>
            <th scope="col">Vuelo</th>
            <th scope="col">Ruta</th>
            <th scope="col">Fecha y hora</th>
            <th scope="col">Estado</th>
            <th scope="col">Riesgo</th>
            <th scope="col">Probabilidad</th>
            {onSeleccionar ? <th scope="col">Detalle</th> : null}
          </tr>
        </thead>
        <tbody>
          {vuelos.length === 0 ? (
            <tr>
              <td className="tabla__vacio" colSpan={onSeleccionar ? 7 : 6}>
                No hay vuelos para mostrar.
              </td>
            </tr>
          ) : (
            vuelos.map((vuelo) => {
              const clicable = Boolean(onSeleccionar && vuelo.es_consultable)
              return (
                <tr
                  key={vuelo.id}
                  className={clicable ? 'fila-clicable' : ''}
                  onClick={clicable ? () => onSeleccionar(vuelo) : undefined}
                  onKeyDown={
                    clicable
                      ? (evento) => {
                          if (evento.key === 'Enter' || evento.key === ' ') {
                            evento.preventDefault()
                            onSeleccionar(vuelo)
                          }
                        }
                      : undefined
                  }
                  tabIndex={clicable ? 0 : undefined}
                  aria-label={
                    clicable
                      ? `Ver detalle del vuelo ${vuelo.aerolinea} ${vuelo.numero_vuelo}`
                      : undefined
                  }
                >
                  <td>
                    <span className="celda-apilada">
                      <span className="tabla__principal">
                        {vuelo.aerolinea} {vuelo.numero_vuelo}
                      </span>
                      <span className="tabla__secundario">
                        {vuelo.aerolinea_nombre}
                      </span>
                    </span>
                  </td>
                  <td className="nowrap">{vuelo.ruta}</td>
                  <td>
                    <span className="celda-apilada">
                      <span>{formatearFecha(vuelo.fecha_salida)}</span>
                      <span className="tabla__secundario">
                        {formatearHora(vuelo.hora_salida_programada)} →{' '}
                        {formatearHora(vuelo.hora_llegada_programada)}
                      </span>
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${CLASE_ESTADO[vuelo.estado_codigo] || 'badge--neutro'}`}
                    >
                      {vuelo.estado}
                    </span>
                  </td>
                  <td>
                    {vuelo.es_consultable ? (
                      <RiesgoBadge nivel={vuelo.nivel_riesgo} />
                    ) : (
                      <span className="muted texto-chico">No disponible</span>
                    )}
                  </td>
                  <td>
                    <CeldaProbabilidad vuelo={vuelo} />
                  </td>
                  {onSeleccionar ? (
                    <td>
                      {vuelo.es_consultable ? (
                        <span className="link texto-chico">Ver detalle</span>
                      ) : (
                        <span className="muted texto-chico">—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
