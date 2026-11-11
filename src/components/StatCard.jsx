export default function StatCard({
  etiqueta,
  valor,
  nota,
  destacado = false,
}) {
  return (
    <article className={`stat-card ${destacado ? 'stat-card--destacado' : ''}`}>
      <span className="stat-card__etiqueta">{etiqueta}</span>
      <span className="stat-card__valor">{valor}</span>
      {nota ? <span className="stat-card__nota">{nota}</span> : null}
    </article>
  )
}
