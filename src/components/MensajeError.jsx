export default function MensajeError({ error, titulo, onReintentar }) {
  const mensaje =
    typeof error === 'string'
      ? error
      : error?.message || 'Ocurrió un error inesperado.'

  return (
    <div className="mensaje-error" role="alert">
      <div className="mensaje-error__contenido">
        <strong className="mensaje-error__titulo">
          {titulo || 'No pudimos completar la operación'}
        </strong>
        <p className="mensaje-error__texto">{mensaje}</p>
      </div>
      {onReintentar ? (
        <button type="button" className="btn btn--ghost btn--sm" onClick={onReintentar}>
          Reintentar
        </button>
      ) : null}
    </div>
  )
}
