import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarVuelos } from '../api/vuelos.js'
import Disclaimer from '../components/Disclaimer.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'
import MensajeError from '../components/MensajeError.jsx'
import Paginacion from '../components/Paginacion.jsx'
import Spinner from '../components/Spinner.jsx'
import TablaVuelos from '../components/TablaVuelos.jsx'
import VueloDetalle from '../components/VueloDetalle.jsx'
import { normalizarIata } from '../utils/formato.js'

const LIMITE = 20

const FILTROS_VACIOS = {
  aerolinea: '',
  origen: '',
  destino: '',
  estado: '',
  fecha: '',
}

const ESTADOS = [
  { valor: '', texto: 'Todos los estados' },
  { valor: 'PROG', texto: 'Programado' },
  { valor: 'ENVU', texto: 'En vuelo' },
  { valor: 'ATER', texto: 'Aterrizado' },
  { valor: 'CANC', texto: 'Cancelado' },
  { valor: 'RETR', texto: 'Retrasado' },
]

export default function Vuelos() {
  const [form, setForm] = useState({ ...FILTROS_VACIOS })
  const [aplicados, setAplicados] = useState({ ...FILTROS_VACIOS })
  const [offset, setOffset] = useState(0)
  const [reintento, setReintento] = useState(0)
  const [datos, setDatos] = useState({
    count: 0,
    results: [],
    disclaimer: '',
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const solicitudRef = useRef(0)

  const cargar = useCallback(async () => {
    const idSolicitud = ++solicitudRef.current
    setCargando(true)
    setError(null)
    try {
      const respuesta = await listarVuelos({
        ...aplicados,
        limit: LIMITE,
        offset,
      })
      if (idSolicitud !== solicitudRef.current) return
      setDatos({
        count: respuesta.count || 0,
        results: respuesta.results || [],
        disclaimer: respuesta.disclaimer || '',
      })
    } catch (err) {
      if (idSolicitud !== solicitudRef.current) return
      setError(err)
      setDatos({ count: 0, results: [], disclaimer: '' })
    } finally {
      if (idSolicitud === solicitudRef.current) setCargando(false)
    }
  }, [aplicados, offset])

  useEffect(() => {
    cargar()
  }, [cargar, reintento])

  const cambiar = (evento) => {
    const { name, value } = evento.target
    const nuevoValor =
      name === 'aerolinea' || name === 'origen' || name === 'destino'
        ? normalizarIata(value)
        : value
    setForm((actual) => ({ ...actual, [name]: nuevoValor }))
  }

  const aplicarFiltros = (evento) => {
    evento.preventDefault()
    setAplicados({ ...form })
    setOffset(0)
  }

  const limpiarFiltros = () => {
    setForm({ ...FILTROS_VACIOS })
    setAplicados({ ...FILTROS_VACIOS })
    setOffset(0)
  }

  const hayFiltros = Object.values(aplicados).some((valor) => valor !== '')

  return (
    <div className="pagina">
      <header className="pagina__encabezado">
        <p className="eyebrow">Listado público</p>
        <h1 className="pagina__titulo">Vuelos del aeropuerto de Ezeiza</h1>
        <p className="pagina__bajada">
          Filtrá por aerolínea, origen, destino, estado o fecha. Si no elegís una
          fecha, se muestran los vuelos de hoy.
        </p>
      </header>

      <form className="filtros" onSubmit={aplicarFiltros}>
        <div className="form-field">
          <label className="form-field__label" htmlFor="filtro-aerolinea">
            Aerolínea (IATA)
          </label>
          <input
            id="filtro-aerolinea"
            className="input"
            name="aerolinea"
            value={form.aerolinea}
            onChange={cambiar}
            placeholder="Ej.: AR"
            maxLength={3}
            autoComplete="off"
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="filtro-origen">
            Origen (IATA)
          </label>
          <input
            id="filtro-origen"
            className="input"
            name="origen"
            value={form.origen}
            onChange={cambiar}
            placeholder="Ej.: EZE"
            maxLength={3}
            autoComplete="off"
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="filtro-destino">
            Destino (IATA)
          </label>
          <input
            id="filtro-destino"
            className="input"
            name="destino"
            value={form.destino}
            onChange={cambiar}
            placeholder="Ej.: COR"
            maxLength={3}
            autoComplete="off"
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="filtro-estado">
            Estado
          </label>
          <select
            id="filtro-estado"
            className="select"
            name="estado"
            value={form.estado}
            onChange={cambiar}
          >
            {ESTADOS.map((estado) => (
              <option key={estado.valor} value={estado.valor}>
                {estado.texto}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="filtro-fecha">
            Fecha
          </label>
          <input
            id="filtro-fecha"
            className="input"
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={cambiar}
          />
          <p className="form-field__hint">Vacío = hoy</p>
        </div>

        <div className="filtros__acciones">
          <button type="submit" className="btn btn--primary" disabled={cargando}>
            {cargando ? 'Buscando...' : 'Filtrar'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={limpiarFiltros}
            disabled={cargando && !hayFiltros}
          >
            Limpiar
          </button>
        </div>
      </form>

      <div className="listado-encabezado">
        <span className="muted texto-chico">
          {cargando
            ? 'Actualizando resultados...'
            : `${datos.count} ${datos.count === 1 ? 'vuelo encontrado' : 'vuelos encontrados'}`}
        </span>
        {hayFiltros ? (
          <button
            type="button"
            className="link texto-chico boton-texto"
            onClick={limpiarFiltros}
          >
            Quitar filtros
          </button>
        ) : null}
      </div>

      <Disclaimer texto={datos.disclaimer} />

      {cargando ? (
        <div className="carga-bloque">
          <Spinner texto="Cargando vuelos..." />
        </div>
      ) : error ? (
        <MensajeError
          error={error}
          onReintentar={() => setReintento((valor) => valor + 1)}
        />
      ) : datos.results.length === 0 ? (
        <EstadoVacio
          titulo={
            hayFiltros
              ? 'No encontramos vuelos con esos filtros'
              : 'No hay vuelos para mostrar'
          }
          mensaje={
            hayFiltros
              ? 'Probá con otra aerolínea, ruta o fecha, o quitá los filtros para ver todos los vuelos.'
              : 'La base todavía no tiene vuelos para la fecha consultada. Probá buscar un vuelo puntual o volvé más tarde.'
          }
          accion={
            hayFiltros ? (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            ) : (
              <Link to="/buscar" className="btn btn--ghost btn--sm">
                Buscar un vuelo
              </Link>
            )
          }
        />
      ) : (
        <>
          <TablaVuelos
            vuelos={datos.results}
            onSeleccionar={setSeleccionado}
          />
          <Paginacion
            count={datos.count}
            offset={offset}
            limit={LIMITE}
            cargando={cargando}
            onCambiar={setOffset}
          />
        </>
      )}

      {seleccionado ? (
        <VueloDetalle
          vuelo={seleccionado}
          onCerrar={() => setSeleccionado(null)}
        />
      ) : null}
    </div>
  )
}
