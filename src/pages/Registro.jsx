import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import FormField from '../components/FormField.jsx'
import MensajeError from '../components/MensajeError.jsx'
import { destinoSeguro } from '../utils/navigation.js'

const EMAIL_BASICO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Registro() {
  const { registro, usuario } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = destinoSeguro(location)

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    repetirPassword: '',
  })
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
    if (!form.username.trim()) {
      nuevos.username = 'Elegí un nombre de usuario.'
    } else if (form.username.trim().length < 3) {
      nuevos.username = 'El nombre de usuario debe tener al menos 3 caracteres.'
    }
    if (!form.email.trim()) {
      nuevos.email = 'Ingresá tu email.'
    } else if (!EMAIL_BASICO.test(form.email.trim())) {
      nuevos.email = 'Ingresá un email válido (por ejemplo, nombre@dominio.com).'
    }
    if (!form.password) {
      nuevos.password = 'Ingresá una contraseña.'
    } else if (form.password.length < 8) {
      nuevos.password = 'La contraseña debe tener al menos 8 caracteres.'
    }
    if (form.repetirPassword !== form.password) {
      nuevos.repetirPassword = 'Las contraseñas no coinciden.'
    }
    return nuevos
  }

  const erroresDelBackend = (data) => {
    const resultado = {}
    if (!data || typeof data !== 'object') return resultado
    for (const [campo, valor] of Object.entries(data)) {
      if (campo === 'detail') continue
      if (Array.isArray(valor) && valor.length > 0) {
        resultado[campo] = valor.join(' ')
      } else if (typeof valor === 'string') {
        resultado[campo] = valor
      }
    }
    return resultado
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevosErrores = validar()
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    setError(null)
    try {
      await registro({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate(destino, { replace: true })
    } catch (err) {
      const deCampos = erroresDelBackend(err.data)
      if (Object.keys(deCampos).length > 0) {
        setErrores(deCampos)
        setError('Revisá los datos marcados para poder crear tu cuenta.')
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
          <p className="eyebrow">Sumate al sistema</p>
          <h1 className="auth-card__titulo">Crear cuenta</h1>
          <p className="auth-card__bajada">
            Con una cuenta de Pasajero podés ver estadísticas, comparar rutas y
            crear alertas para tus vuelos.
          </p>
        </div>

        {error ? <MensajeError error={error} /> : null}

        <form className="form" onSubmit={enviar} noValidate>
          <FormField
            label="Nombre de usuario"
            htmlFor="registro-username"
            error={errores.username}
            hint="Podés usar letras, números y los símbolos @ . + - _"
            required
          >
            <input
              id="registro-username"
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
            label="Email"
            htmlFor="registro-email"
            error={errores.email}
            hint="Lo usamos para enviarte las alertas de tus vuelos."
            required
          >
            <input
              id="registro-email"
              className="input"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={cambiar}
              disabled={enviando}
            />
          </FormField>

          <FormField
            label="Contraseña"
            htmlFor="registro-password"
            error={errores.password}
            hint="Mínimo 8 caracteres. Evitá contraseñas demasiado comunes o numéricas."
            required
          >
            <input
              id="registro-password"
              className="input"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={cambiar}
              disabled={enviando}
            />
          </FormField>

          <FormField
            label="Repetir contraseña"
            htmlFor="registro-repetir"
            error={errores.repetirPassword}
            required
          >
            <input
              id="registro-repetir"
              className="input"
              name="repetirPassword"
              type="password"
              autoComplete="new-password"
              value={form.repetirPassword}
              onChange={cambiar}
              disabled={enviando}
            />
          </FormField>

          <button
            type="submit"
            className="btn btn--primary btn--bloque"
            disabled={enviando}
          >
            {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-card__pie">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" state={location.state} className="link">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
