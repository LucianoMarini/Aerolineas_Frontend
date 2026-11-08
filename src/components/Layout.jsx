import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

function enlaceClase({ isActive }) {
  return `nav-link ${isActive ? 'nav-link--activo' : ''}`
}

export default function Layout() {
  const { usuario, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  const cerrarSesion = async () => {
    setSaliendo(true)
    try {
      await logout()
    } finally {
      setSaliendo(false)
      setMenuAbierto(false)
      navigate('/')
    }
  }

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar__inner">
          <Link to="/" className="brand" onClick={cerrarMenu}>
            <span className="brand__marca">EZE</span>
            <span className="brand__texto">
              Vuelos<span className="brand__punto">.</span>
            </span>
          </Link>

          <button
            type="button"
            className="navbar__toggle"
            aria-expanded={menuAbierto}
            aria-label="Abrir menú de navegación"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`nav ${menuAbierto ? 'nav--abierto' : ''}`}>
            <div className="nav__grupo">
              <NavLink to="/" end className={enlaceClase} onClick={cerrarMenu}>
                Inicio
              </NavLink>
              <NavLink to="/vuelos" className={enlaceClase} onClick={cerrarMenu}>
                Vuelos
              </NavLink>
              <NavLink to="/buscar" className={enlaceClase} onClick={cerrarMenu}>
                Buscar vuelo
              </NavLink>
              {usuario ? (
                <>
                  <NavLink to="/dashboard" className={enlaceClase} onClick={cerrarMenu}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/rutas" className={enlaceClase} onClick={cerrarMenu}>
                    Comparar ruta
                  </NavLink>
                  <NavLink to="/alertas" className={enlaceClase} onClick={cerrarMenu}>
                    Mis alertas
                  </NavLink>
                </>
              ) : null}
              {isAdmin ? (
                <NavLink to="/admin" className={enlaceClase} onClick={cerrarMenu}>
                  Admin
                </NavLink>
              ) : null}
            </div>

            <div className="nav__cuenta">
              {usuario ? (
                <>
                  <span className="nav__usuario" title={usuario.email}>
                    {usuario.username}
                    {isAdmin ? <span className="nav__rol">Admin</span> : null}
                  </span>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={cerrarSesion}
                    disabled={saliendo}
                  >
                    {saliendo ? 'Saliendo...' : 'Cerrar sesión'}
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="btn btn--ghost btn--sm"
                    onClick={cerrarMenu}
                  >
                    Ingresar
                  </NavLink>
                  <NavLink
                    to="/registro"
                    className="btn btn--primary btn--sm"
                    onClick={cerrarMenu}
                  >
                    Crear cuenta
                  </NavLink>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="contenido">
        <Outlet />
      </main>

      <footer className="pie">
        <p>
          Predicciones orientativas para vuelos del aeropuerto de Ezeiza. Los
          valores no reemplazan la información oficial de las aerolíneas.
        </p>
      </footer>
    </div>
  )
}
