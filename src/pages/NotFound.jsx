import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="pagina pagina--centrada">
      <div className="tarjeta-estado">
        <p className="tarjeta-estado__codigo">404</p>
        <h1 className="tarjeta-estado__titulo">Esta página no existe</h1>
        <p className="tarjeta-estado__texto">
          Puede que hayas escrito mal la dirección o que la página se haya
          movido. Te dejamos algunos atajos para seguir navegando.
        </p>
        <div className="tarjeta-estado__acciones">
          <Link to="/" className="btn btn--primary">
            Ir al inicio
          </Link>
          <Link to="/vuelos" className="btn btn--ghost">
            Ver vuelos
          </Link>
          <Link to="/buscar" className="btn btn--ghost">
            Buscar un vuelo
          </Link>
        </div>
      </div>
    </section>
  )
}
