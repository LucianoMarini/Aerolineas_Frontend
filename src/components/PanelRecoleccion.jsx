import { useCallback, useEffect, useState } from 'react'
import {
  actualizarClima,
  actualizarRecoleccionAutomatica,
  forzarRecoleccion,
  notificarAlertas,
  obtenerEstadoRecoleccion,
  obtenerHistorialRecoleccion,
  reentrenarPredictor,
} from '../api/recoleccion.js'
import ConfirmDialog from './ConfirmDialog.jsx'
import MensajeError from './MensajeError.jsx'
import Spinner from './Spinner.jsx'
import StatCard from './StatCard.jsx'
import { formatearFechaHoraIso } from '../utils/formato.js'

const TEXTOS_CONFIRMACION = {
  pausar: {
    titulo: '¿Pausar la recolección automática?',
    mensaje:
      'La tarea programada deja de ejecutarse hasta que la reactives. No se borran datos y la recolección manual sigue disponible.',
    textoConfirmar: 'Pausar',
  },
  reactivar: {
    titulo: '¿Reactivar la recolección automática?',
    mensaje:
      'La tarea programada vuelve a ejecutarse con su frecuencia habitual.',
    textoConfirmar: 'Reactivar',
  },
  forzar: {
    titulo: '¿Forzar una recolección ahora?',
    mensaje:
      'Se consulta AviationStack y se registran los vuelos obtenidos. La corrida consume requests del plan mensual.',
    textoConfirmar: 'Forzar recolección',
  },
  reentrenar: {
    titulo: '¿Reentrenar el predictor?',
    mensaje:
      'El modelo se vuelve a entrenar con el historial de vuelos cargado hasta ahora. Puede demorar unos instantes.',
    textoConfirmar: 'Reentrenar',
  },
  notificar: {
    titulo: '¿Enviar notificaciones de alertas?',
    mensaje:
      'Se dispara el envío por email de las notificaciones de alertas pendientes.',
    textoConfirmar: 'Enviar notificaciones',
  },
  clima: {
    titulo: '¿Actualizar el clima de hoy?',
    mensaje:
      'Se refresca el clima registrado de los vuelos con estado programado de hoy.',
    textoConfirmar: 'Actualizar clima',
  },
}

const ACCIONES_MANTENIMIENTO = [
  {
    tipo: 'reentrenar',
    titulo: 'Reentrenar predictor',
    descripcion: 'Vuelve a entrenar el modelo con el historial actual.',
  },
  {
    tipo: 'notificar',
    titulo: 'Enviar notificaciones',
    descripcion: 'Envía por email las alertas pendientes de los usuarios.',
  },
  {
    tipo: 'clima',
    titulo: 'Actualizar clima de hoy',
    descripcion: 'Refresca el clima de los vuelos programados de hoy.',
  },
]

export default function PanelRecoleccion() {
  const [estado, setEstado] = useState(null)
  const [historial, setHistorial] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [reintento, setReintento] = useState(0)
  const [confirmacion, setConfirmacion] = useState(null)
  const [accionEnCurso, setAccionEnCurso] = useState(null)
  const [exito, setExito] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true)
    setError(null)
    try {
      const [nuevoEstado, nuevoHistorial] = await Promise.all([
        obtenerEstadoRecoleccion(),
        obtenerHistorialRecoleccion(),
      ])
      setEstado(nuevoEstado)
      setHistorial(nuevoHistorial)
    } catch (err) {
      if (silencioso) setErrorAccion(err)
      else setError(err)
    } finally {
      if (!silencioso) setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar, reintento])

  const pedirConfirmacion = (tipo) => {
    setExito(null)
    setErrorAccion(null)
    setConfirmacion(tipo)
  }

  const ejecutarAccion = async (tipo) => {
    setAccionEnCurso(tipo)
    setErrorAccion(null)
    setExito(null)
    try {
      if (tipo === 'forzar') {
        const resumen = await forzarRecoleccion()
        setExito(
          `Recolección ejecutada: ${resumen.vuelos_obtenidos} vuelos obtenidos con ${resumen.requests_consumidos} requests (${resumen.resultado}).`,
        )
      } else if (tipo === 'pausar' || tipo === 'reactivar') {
        const config = await actualizarRecoleccionAutomatica(tipo === 'reactivar')
        setExito(
          tipo === 'reactivar'
            ? 'Recolección automática reactivada.'
            : 'Recolección automática pausada.',
        )
        setEstado((prev) =>
          prev
            ? { ...prev, recoleccion_automatica_activa: config.recoleccion_automatica_activa }
            : prev,
        )
      } else if (tipo === 'reentrenar') {
        const respuesta = await reentrenarPredictor()
        setExito(respuesta.detalle || 'Predictor reentrenado con el historial actual.')
      } else if (tipo === 'notificar') {
        const respuesta = await notificarAlertas()
        setExito(`Se enviaron ${respuesta.notificaciones_enviadas} notificaciones de alertas.`)
      } else if (tipo === 'clima') {
        const respuesta = await actualizarClima()
        setExito(`Se actualizó el clima de ${respuesta.vuelos_actualizados} vuelos de hoy.`)
      }
      await cargar(true)
    } catch (err) {
      setErrorAccion(err)
    } finally {
      setAccionEnCurso(null)
      setConfirmacion(null)
    }
  }

  if (cargando) {
    return (
      <div className="contenedor-carga-pantalla">
        <Spinner texto="Cargando estado del recolector..." />
      </div>
    )
  }

  if (error || !estado) {
    return (
      <MensajeError
        error={error || 'No pudimos cargar el estado del recolector.'}
        onReintentar={() => setReintento((valor) => valor + 1)}
      />
    )
  }

  const automaticaActiva = Boolean(estado.recoleccion_automatica_activa)
  const ultima = estado.ultima_ejecucion
  const ultimaClima = estado.ultima_actualizacion_clima
  const ejecuciones = historial?.ejecuciones || []
  const tareas = historial?.tareas || []
  const textos = confirmacion ? TEXTOS_CONFIRMACION[confirmacion] : null
  const ocupado = accionEnCurso !== null

  return (
    <div className="seccion">
      <section className="stat-grid" aria-label="Estado del recolector">
        <StatCard
          etiqueta="API key"
          valor={estado.api_key_configurada ? 'Configurada' : 'Falta configurar'}
          nota="Fuente de datos AviationStack"
        />
        <StatCard
          etiqueta="Consumo del mes"
          valor={`${estado.requests_consumidos_mes} / ${estado.limite_plan}`}
          nota="Requests consumidos sobre el límite del plan"
        />
        <StatCard
          etiqueta="Límite de bloqueo"
          valor={estado.limite_bloqueo}
          nota="El sistema bloquea consultas al alcanzarlo"
        />
        <StatCard
          etiqueta="Estado del plan"
          valor={estado.bloqueado ? 'Bloqueado' : 'Disponible'}
          nota={
            estado.bloqueado
              ? 'Se alcanzó el límite de protección'
              : 'Las consultas a la API están habilitadas'
          }
          destacado={estado.bloqueado}
        />
      </section>

      <div className="grid-dos">
        <section className="admin-card">
          <h3 className="admin-card__titulo">Última ejecución</h3>
          {ultima ? (
            <dl className="admin-detalles">
              <div>
                <dt>Fecha</dt>
                <dd>{formatearFechaHoraIso(ultima.fecha_hora)}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{ultima.tipo}</dd>
              </div>
              <div>
                <dt>Vuelos obtenidos</dt>
                <dd>{ultima.vuelos_obtenidos}</dd>
              </div>
              <div>
                <dt>Requests</dt>
                <dd>{ultima.requests_consumidos}</dd>
              </div>
              <div>
                <dt>Resultado</dt>
                <dd>{ultima.resultado}</dd>
              </div>
            </dl>
          ) : (
            <p className="tabla__secundario">
              Todavía no hay ejecuciones registradas.
            </p>
          )}
        </section>

        <section className="admin-card">
          <h3 className="admin-card__titulo">Última actualización de clima</h3>
          {ultimaClima ? (
            <dl className="admin-detalles">
              <div>
                <dt>Fecha</dt>
                <dd>{formatearFechaHoraIso(ultimaClima.fecha_hora)}</dd>
              </div>
              <div>
                <dt>Resultado</dt>
                <dd>{ultimaClima.resultado}</dd>
              </div>
            </dl>
          ) : (
            <p className="tabla__secundario">
              Todavía no se ejecutó la tarea de clima.
            </p>
          )}
        </section>
      </div>

      <section className="admin-card">
        <div className="admin-card__fila">
          <div>
            <h3 className="admin-card__titulo">Recolección automática</h3>
            <p className="admin-card__bajada">
              La tarea programada se ejecuta sola mientras esté activa. Pausarla
              no borra datos ni afecta la recolección manual.
            </p>
          </div>
          <div className="admin-card__acciones">
            <span className={`badge ${automaticaActiva ? 'badge--baja' : 'badge--media'}`}>
              {automaticaActiva ? 'Activa' : 'Pausada'}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => pedirConfirmacion(automaticaActiva ? 'pausar' : 'reactivar')}
              disabled={ocupado}
            >
              {automaticaActiva ? 'Pausar' : 'Reactivar'}
            </button>
          </div>
        </div>
      </section>

      {exito ? (
        <div className="mensaje-exito" role="status">
          {exito}
        </div>
      ) : null}
      {errorAccion ? <MensajeError error={errorAccion} /> : null}

      <section className="admin-card">
        <div className="admin-card__fila">
          <div>
            <h3 className="admin-card__titulo">Forzar recolección</h3>
            <p className="admin-card__bajada">
              Ejecuta una corrida manual ahora. Consume requests del plan
              mensual y queda registrada en el historial.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => pedirConfirmacion('forzar')}
            disabled={ocupado}
          >
            {accionEnCurso === 'forzar' ? 'Recolectando...' : 'Forzar ahora'}
          </button>
        </div>
      </section>

      <section className="admin-card">
        <h3 className="admin-card__titulo">Mantenimiento del sistema</h3>
        <div className="admin-acciones">
          {ACCIONES_MANTENIMIENTO.map(({ tipo, titulo, descripcion }) => (
            <div key={tipo} className="admin-accion">
              <div>
                <strong>{titulo}</strong>
                <p>{descripcion}</p>
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => pedirConfirmacion(tipo)}
                disabled={ocupado}
              >
                {accionEnCurso === tipo ? 'Procesando...' : 'Ejecutar'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="seccion">
        <div className="seccion__encabezado">
          <div>
            <h2 className="seccion__titulo">Historial de ejecuciones</h2>
            <p className="seccion__bajada">
              Últimas corridas del recolector registradas por el sistema.
            </p>
          </div>
        </div>
        <div className="tabla-wrap">
          <table className="tabla">
            <caption className="solo-lectores">
              Historial de ejecuciones del recolector
            </caption>
            <thead>
              <tr>
                <th scope="col">Fecha y hora</th>
                <th scope="col">Tipo</th>
                <th scope="col">Requests</th>
                <th scope="col">Vuelos</th>
                <th scope="col">Aerolínea</th>
                <th scope="col">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {ejecuciones.length === 0 ? (
                <tr>
                  <td className="tabla__vacio" colSpan={6}>
                    Sin ejecuciones registradas todavía.
                  </td>
                </tr>
              ) : (
                ejecuciones.map((ejecucion) => (
                  <tr key={ejecucion.fecha_hora}>
                    <td className="tabla__principal">
                      {formatearFechaHoraIso(ejecucion.fecha_hora)}
                    </td>
                    <td>{ejecucion.tipo}</td>
                    <td>{ejecucion.requests_consumidos}</td>
                    <td>{ejecucion.vuelos_obtenidos}</td>
                    <td>{ejecucion.aerolinea || 'Todas'}</td>
                    <td>{ejecucion.resultado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="seccion">
        <div className="seccion__encabezado">
          <div>
            <h2 className="seccion__titulo">Tareas automáticas</h2>
            <p className="seccion__bajada">
              Estado de las tareas programadas del sistema.
            </p>
          </div>
        </div>
        <div className="tabla-wrap">
          <table className="tabla">
            <caption className="solo-lectores">Tareas automáticas del sistema</caption>
            <thead>
              <tr>
                <th scope="col">Tarea</th>
                <th scope="col">Última ejecución</th>
                <th scope="col">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {tareas.length === 0 ? (
                <tr>
                  <td className="tabla__vacio" colSpan={3}>
                    Sin tareas automáticas configuradas.
                  </td>
                </tr>
              ) : (
                tareas.map((tarea) => (
                  <tr key={`${tarea.tipo}-${tarea.fecha_hora}`}>
                    <td className="tabla__principal">{tarea.tipo}</td>
                    <td>{formatearFechaHoraIso(tarea.fecha_hora)}</td>
                    <td>{tarea.resultado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmDialog
        abierto={Boolean(confirmacion)}
        titulo={textos?.titulo}
        mensaje={textos?.mensaje}
        textoConfirmar={textos?.textoConfirmar}
        cargando={ocupado}
        onConfirmar={() => ejecutarAccion(confirmacion)}
        onCancelar={() => setConfirmacion(null)}
      />
    </div>
  )
}
