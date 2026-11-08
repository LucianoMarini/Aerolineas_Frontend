export default function EstadoVacio({
  titulo = 'No hay datos para mostrar',
  mensaje = 'Probá cambiando los filtros o volvé más tarde.',
  accion = null,
}) {
  return (
    <div className="estado-vacio">
      <div className="estado-vacio__marca" aria-hidden="true">
        EZE
      </div>
      <h3 className="estado-vacio__titulo">{titulo}</h3>
      <p className="estado-vacio__texto">{mensaje}</p>
      {accion ? <div className="estado-vacio__accion">{accion}</div> : null}
    </div>
  )
}
