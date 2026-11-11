import { useCallback, useEffect, useState } from 'react'
import { cambiarRol, listarUsuarios } from '../api/usuarios.js'
import { useAuth } from '../auth/AuthContext.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import EstadoVacio from './EstadoVacio.jsx'
import MensajeError from './MensajeError.jsx'
import Spinner from './Spinner.jsx'
import { formatearFechaHoraIso } from '../utils/formato.js'

function esAdministrador(usuario) {
  return (usuario.roles || []).includes('Administrador')
}

function BadgeRol({ roles }) {
  if (!roles || roles.length === 0) {
    return <span className="badge badge--neutro">Sin rol</span>
  }
  return (
    <>
      {roles.map((rol) => (
        <span
          key={rol}
          className={`badge ${rol === 'Administrador' ? 'badge--info' : 'badge--neutro'}`}
        >
          {rol}
        </span>
      ))}
    </>
  )
}

export default function PanelUsuarios() {
  const { usuario: usuarioActual } = useAuth()
  const [usuarios, setUsuarios] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [reintento, setReintento] = useState(0)
  const [objetivo, setObjetivo] = useState(null)
  const [cambiando, setCambiando] = useState(false)
  const [exito, setExito] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true)
    setError(null)
    try {
      const lista = await listarUsuarios()
      setUsuarios(lista)
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

  const confirmarCambioRol = async () => {
    if (!objetivo) return
    setCambiando(true)
    setErrorAccion(null)
    setExito(null)
    const nuevoRol = esAdministrador(objetivo) ? 'pasajero' : 'administrador'
    try {
      await cambiarRol(objetivo.id, nuevoRol)
      setExito(`Rol de ${objetivo.username} actualizado a ${nuevoRol}.`)
      setObjetivo(null)
      await cargar(true)
    } catch (err) {
      setErrorAccion(err)
    } finally {
      setCambiando(false)
    }
  }

  if (cargando) {
    return (
      <div className="contenedor-carga-pantalla">
        <Spinner texto="Cargando usuarios..." />
      </div>
    )
  }

  if (error || !usuarios) {
    return (
      <MensajeError
        error={error || 'No pudimos cargar los usuarios.'}
        onReintentar={() => setReintento((valor) => valor + 1)}
      />
    )
  }

  const degradar = objetivo ? esAdministrador(objetivo) : false

  return (
    <div className="seccion">
      {exito ? (
        <div className="mensaje-exito" role="status">
          {exito}
        </div>
      ) : null}
      {errorAccion ? <MensajeError error={errorAccion} /> : null}

      {usuarios.length === 0 ? (
        <EstadoVacio
          titulo="No hay usuarios registrados"
          mensaje="Todavía no se registraron usuarios en el sistema."
        />
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <caption className="solo-lectores">
              Usuarios registrados del sistema
            </caption>
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Email</th>
                <th scope="col">Roles</th>
                <th scope="col">Staff</th>
                <th scope="col">Fecha de alta</th>
                <th scope="col">Alertas activas</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const propio = usuario.id === usuarioActual?.id
                return (
                  <tr key={usuario.id}>
                    <td>
                      <span className="tabla__principal">{usuario.username}</span>
                      <span className="tabla__secundario">#{usuario.id}</span>
                    </td>
                    <td>{usuario.email}</td>
                    <td>
                      <BadgeRol roles={usuario.roles} />
                    </td>
                    <td>{usuario.is_staff ? 'Sí' : 'No'}</td>
                    <td>{formatearFechaHoraIso(usuario.fecha_alta)}</td>
                    <td>{usuario.alertas_activas}</td>
                    <td>
                      {propio ? (
                        <span className="badge badge--neutro">Vos</span>
                      ) : esAdministrador(usuario) ? (
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => setObjetivo(usuario)}
                          disabled={cambiando}
                        >
                          Degradar a pasajero
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => setObjetivo(usuario)}
                          disabled={cambiando}
                        >
                          Promover a admin
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        abierto={Boolean(objetivo)}
        titulo={
          degradar ? '¿Degradar a pasajero?' : '¿Promover a administrador?'
        }
        mensaje={
          objetivo
            ? degradar
              ? `${objetivo.username} va a perder el rol Administrador y el acceso al panel de administración.`
              : `${objetivo.username} va a obtener el rol Administrador (grupo, is_staff y is_superuser).`
            : undefined
        }
        textoConfirmar={degradar ? 'Degradar' : 'Promover'}
        variante={degradar ? 'danger' : 'primary'}
        cargando={cambiando}
        onConfirmar={confirmarCambioRol}
        onCancelar={() => setObjetivo(null)}
      />
    </div>
  )
}
