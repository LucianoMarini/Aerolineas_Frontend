import { useState } from 'react'
import PanelRecoleccion from '../components/PanelRecoleccion.jsx'
import PanelUsuarios from '../components/PanelUsuarios.jsx'

const TABS = [
  { id: 'recoleccion', etiqueta: 'Recolección' },
  { id: 'usuarios', etiqueta: 'Usuarios' },
]

export default function Admin() {
  const [tab, setTab] = useState('recoleccion')

  return (
    <section className="pagina">
      <header className="pagina__encabezado">
        <p className="eyebrow">Panel de administración</p>
        <h1 className="pagina__titulo">Admin</h1>
        <p className="pagina__bajada">
          Estado del recolector, acciones de mantenimiento y gestión de
          usuarios del sistema.
        </p>
      </header>

      <div className="admin-tabs" role="tablist" aria-label="Secciones del panel">
        {TABS.map(({ id, etiqueta }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`admin-tab ${tab === id ? 'admin-tab--activo' : ''}`}
            onClick={() => setTab(id)}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {tab === 'recoleccion' ? <PanelRecoleccion /> : <PanelUsuarios />}
    </section>
  )
}
