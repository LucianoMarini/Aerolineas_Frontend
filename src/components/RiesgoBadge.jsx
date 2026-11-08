const ETIQUETAS = {
  baja: 'Riesgo bajo',
  media: 'Riesgo medio',
  alta: 'Riesgo alto',
}

export default function RiesgoBadge({ nivel, children }) {
  if (!nivel) {
    return <span className="badge badge--neutro">Sin probabilidad</span>
  }
  return (
    <span className={`badge badge--${nivel}`}>
      <span className="punto-badge" aria-hidden="true" />
      {children || ETIQUETAS[nivel] || nivel}
    </span>
  )
}
