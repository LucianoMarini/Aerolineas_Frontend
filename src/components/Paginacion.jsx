export default function Paginacion({
  count,
  offset = 0,
  limit = 20,
  cargando = false,
  onCambiar,
}) {
  if (!count) return null

  const desde = count === 0 ? 0 : offset + 1
  const hasta = Math.min(offset + limit, count)
  const pagina = Math.floor(offset / limit) + 1
  const totalPaginas = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="paginacion">
      <span className="paginacion__info">
        Mostrando {desde}–{hasta} de {count} · Página {pagina} de{' '}
        {totalPaginas}
      </span>
      <div className="paginacion__botones">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onCambiar(Math.max(0, offset - limit))}
          disabled={cargando || offset === 0}
        >
          Anterior
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onCambiar(offset + limit)}
          disabled={cargando || offset + limit >= count}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
