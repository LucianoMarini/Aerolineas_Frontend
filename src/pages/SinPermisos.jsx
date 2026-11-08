import { Link } from 'react-router-dom'

export default function SinPermisos() {
  return (
    <section className="pagina pagina--centrada">
      <div className="tarjeta-estado tarjeta-estado--prohibido">
        <p className="tarjeta-estado__codigo">403</p>
        <h1 className="tarjeta-estado__titulo">No tenés permisos para entrar</h1>
        <p className="tarjeta-estado__texto">
          Esta sección es solo para usuarios con rol Administrador. Si creés que
          es un error, contactá a la persona que administra el sistema.
        </p>
        <div className="tarjeta-estado__acciones">
          <Link to="/" className="btn btn--primary">
            Volver al inicio
          </Link>
          <Link to="/dashboard" className="btn btn--ghost">
            Ir a mi dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}
