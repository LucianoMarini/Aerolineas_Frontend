export default function Spinner({ texto = 'Cargando...', chico = false }) {
  return (
    <span className={`spinner ${chico ? 'spinner--chico' : ''}`} role="status">
      <span className="spinner__circulo" aria-hidden="true" />
      {texto ? <span className="spinner__texto">{texto}</span> : null}
    </span>
  )
}
