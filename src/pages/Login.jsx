import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import FormField from '../components/FormField.jsx'
import MensajeError from '../components/MensajeError.jsx'
import { destinoSeguro } from '../utils/navigation.js'

export default function Login() {
  const { login, usuario } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = destinoSeguro(location)

  const [form, setForm] = useState({ username: '', password: '' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (usuario) navigate(destino, { replace: true })
  }, [usuario, destino, navigate])

  const cambiar = (evento) => {
    const { name, value } = evento.target
    setForm((actual) => ({ ...actual, [name]: value }))
    setErrores((actual) => ({ ...actual, [name]: undefined }))
    setError(null)
  }

  const validar = () => {
    const nuevos = {}
    if (!form.username.trim()) nuevos.username = 'Ingresá tu nombre de usuario.'
    if (!form.password) nuevos.password = 'Ingresá tu contraseña.'
    return nuevos
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevosErrores = validar()
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    setError(null)
    try {
      await login(form.username.trim(), form.password)
      navigate(destino, { replace: true })
    } catch (err) {
      if (err.status === 401) {
        setError('Usuario o contraseña incorrectos. Revisá tus datos e intentá de nuevo.')
      } else {
        setError(err)
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card__encabezado">
          <p className="eyebrow">Bienvenido de nuevo</p>
          <h1 className="auth-card__titulo">Iniciar sesión</h1>
          <p className="auth-card__bajada">
            Entrá para ver el dashboard, comparar rutas y gestionar tus alertas.
          </p>
        </div>

        {error ? <MensajeError error={error} /> : null}

        <form className="form" onSubmit={enviar} noValidate>
          <FormField
            label="Nombre de usuario"
            htmlFor="login-username"
            error={errores.username}
            required
          >
            <input
              id="login-username"
              className="input"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={cambiar}
              disabled={enviando}
              autoFocus
            />
          </FormField>

          <FormField
            label="Contraseña"
            htmlFor="login-password"
            error={errores.password}
            required
          >
            <input
              id="login-password"
              className="input"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={cambiar}
              disabled={enviando}
            />
          </FormField>

          <button
            type="submit"
            className="btn btn--primary btn--bloque"
            disabled={enviando}
          >
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-card__pie">
          ¿Todavía no tenés cuenta?{' '}
          <Link
            to="/registro"
            state={location.state}
            className="link"
          >
            Creá una gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
