import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Spinner from './components/Spinner.jsx'
import Admin from './pages/Admin.jsx'
import Alertas from './pages/Alertas.jsx'
import Buscar from './pages/Buscar.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import Registro from './pages/Registro.jsx'
import Rutas from './pages/Rutas.jsx'
import SinPermisos from './pages/SinPermisos.jsx'
import Vuelos from './pages/Vuelos.jsx'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="vuelos" element={<Vuelos />} />
        <Route path="buscar" element={<Buscar />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="dashboard"
            element={
              <Suspense
                fallback={
                  <div className="pagina">
                    <div className="contenedor-carga-pantalla">
                      <Spinner texto="Cargando dashboard..." />
                    </div>
                  </div>
                }
              >
                <Dashboard />
              </Suspense>
            }
          />
          <Route path="rutas" element={<Rutas />} />
          <Route path="alertas" element={<Alertas />} />
        </Route>

        <Route element={<ProtectedRoute soloAdmin />}>
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="sin-permisos" element={<SinPermisos />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
