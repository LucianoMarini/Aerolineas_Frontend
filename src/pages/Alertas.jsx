import { useCallback, useEffect, useState } from 'react'
import { eliminarAlerta, listarAlertas } from '../api/alertas.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'
import MensajeError from '../components/MensajeError.jsx'
import NuevaAlertaModal from '../components/NuevaAlertaModal.jsx'
import Spinner from '../components/Spinner.jsx'
import {
  formatearFecha,
  formatearFechaHoraIso,
  formatearHora,
  formatearPorcentaje,
} from '../utils/formato.js'

const CLASE_ESTADO = {
  PROG: 'badge--info',
  ENVU: 'badge--info',
  ATER: 'badge--neutro',
  CANC: 'badge--alta',
  RETR: 'badge--media',
}

export default function Alertas() {
  const [alertas, setAlertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [reintento, setReintento] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [alertaAEliminar, setAlertaAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await listarAlertas()
      setAlertas(Array.isArray(respuesta) ? respuesta : [])
    } catch (err) {
      setError(err)
      setAlertas([])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar, reintento])

  const confirmarEliminar = async () => {
    if (!alertaAEliminar) return
    setEliminando(true)
    setErrorAccion(null)
    try {
      await eliminarAlerta(alertaAEliminar.id)
      setAlertas((actuales) =>
        actuales.filter((alerta) => alerta.id !== alertaAEliminar.id),
      )
      setMensaje('La alerta se eliminó correctamente.')
      setAlertaAEliminar(null)
    } catch (err) {
      setErrorAccion(err)
      setAlertaAEliminar(null)
    } finally {
      setEliminando(false)
    }
  }

  const alCrear = () => {
    setMensaje('La alerta se creó correctamente.')
    setReintento((valor) => valor + 1)
  }

  return (
    <div className="pagina">
      <header className="pagina__encabezado pagina__encabezado--con-accion">
        <div>
          <p className="eyebrow">Requiere sesión</p>
          <h1 className="pagina__titulo">Mis alertas</h1>
          <p className="pagina__bajada">
            Vigilá tus vuelos programados. Te avisamos por email cuando la
            probabilidad de cancelación supere el umbral que elijas.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            setMensaje(null)
            setErrorAccion(null)
            setModalAbierto(true)
          }}
        >
          Nueva alerta
        </button>
      </header>

      {mensaje ? (
        <div className="mensaje-exito" role="status">
          {mensaje}
        </div>
      ) : null}

      {errorAccion ? <MensajeError error={errorAccion} /> : null}

      {cargando ? (
        <div className="carga-bloque">
          <Spinner texto="Cargando tus alertas..." />
        </div>
      ) : error ? (
        <MensajeError
          error={error}
          onReintentar={() => setReintento((valor) => valor + 1)}
        />
      ) : alertas.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no tenés alertas"
          mensaje="Creá una alerta para un vuelo programado y te avisamos si el riesgo de cancelación sube."
          accion={
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setModalAbierto(true)}
            >
              Crear mi primera alerta
            </button>
          }
        />
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <caption className="solo-lectores">Mis alertas de vuelo</caption>
            <thead>
              <tr>
                <th scope="col">Vuelo</th>
                <th scope="col">Ruta</th>
                <th scope="col">Fecha y hora</th>
                <th scope="col">Estado</th>
                <th scope="col">Umbral</th>
                <th scope="col">Creada</th>
                <th scope="col">Última notificación</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((alerta) => {
                const vuelo = alerta.vuelo || {}
                return (
                  <tr key={alerta.id}>
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
                    <td className="nowrap">{vuelo.ruta || '—'}</td>
                    <td>
                      <span className="celda-apilada">
                        <span>{formatearFecha(vuelo.fecha_salida)}</span>
                        <span className="tabla__secundario">
                          {formatearHora(vuelo.hora_salida_programada)}
                        </span>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${CLASE_ESTADO[vuelo.estado_codigo] || 'badge--neutro'}`}
                      >
                        {vuelo.estado || '—'}
                      </span>
                    </td>
                    <td>
                      <strong>{formatearPorcentaje(alerta.umbral_riesgo)}</strong>
                    </td>
                    <td className="texto-chico">
                      {formatearFechaHoraIso(alerta.fecha_creacion)}
                    </td>
                    <td className="texto-chico">
                      {alerta.ultima_notificacion
                        ? formatearFechaHoraIso(alerta.ultima_notificacion)
                        : 'Sin notificar'}
                    </td>
                    <td>
                      <div className="acciones-fila">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => {
                            setMensaje(null)
                            setErrorAccion(null)
                            setAlertaAEliminar(alerta)
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <NuevaAlertaModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onCreada={alCrear}
      />

      <ConfirmDialog
        abierto={Boolean(alertaAEliminar)}
        titulo="Eliminar alerta"
        mensaje={
          alertaAEliminar ? (
            <p>
              Vas a eliminar la alerta del vuelo{' '}
              <strong>
                {alertaAEliminar.vuelo?.aerolinea}{' '}
                {alertaAEliminar.vuelo?.numero_vuelo}
              </strong>{' '}
              ({alertaAEliminar.vuelo?.ruta}). Esta acción no se puede deshacer.
            </p>
          ) : null
        }
        textoConfirmar="Eliminar"
        variante="danger"
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAlertaAEliminar(null)}
      />
    </div>
  )
}
