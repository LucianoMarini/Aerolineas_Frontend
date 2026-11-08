import { useEffect, useId } from 'react'

export default function ConfirmDialog({
  abierto,
  titulo = '¿Querés continuar?',
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'primary',
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  const tituloId = useId()

  useEffect(() => {
    if (!abierto) return undefined
    const alPresionar = (evento) => {
      if (evento.key === 'Escape' && !cargando) onCancelar?.()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto, cargando, onCancelar])

  if (!abierto) return null

  return (
    <div
      className="modal-fondo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !cargando) onCancelar?.()
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
      >
        <h2 className="modal__titulo" id={tituloId}>
          {titulo}
        </h2>
        {mensaje ? <div className="modal__mensaje">{mensaje}</div> : null}
        <div className="modal__acciones">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancelar}
            disabled={cargando}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className={`btn ${variante === 'danger' ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
