import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import SinPermisos from '../pages/SinPermisos.jsx'
import { useAuth } from './AuthContext.jsx'

export default function ProtectedRoute({ soloAdmin = false }) {
  const { usuario, isAdmin, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="contenedor-carga-pantalla">
        <Spinner texto="Verificando sesión..." />
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (soloAdmin && !isAdmin) {
    return <SinPermisos />
  }

  return <Outlet />
}
