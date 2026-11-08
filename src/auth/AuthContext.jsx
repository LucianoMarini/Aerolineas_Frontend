import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as authApi from '../api/auth.js'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  const recargarUsuario = useCallback(async () => {
    if (!getAccessToken() && !getRefreshToken()) {
      setUsuario(null)
      return null
    }
    try {
      const perfil = await authApi.me()
      setUsuario(perfil)
      return perfil
    } catch {
      clearTokens()
      setUsuario(null)
      return null
    }
  }, [])

  useEffect(() => {
    let activo = true

    const inicializar = async () => {
      if (!getAccessToken() && !getRefreshToken()) {
        if (activo) {
          setUsuario(null)
          setCargando(false)
        }
        return
      }
      try {
        const perfil = await authApi.me()
        if (activo) setUsuario(perfil)
      } catch {
        clearTokens()
        if (activo) setUsuario(null)
      } finally {
        if (activo) setCargando(false)
      }
    }

    inicializar()

    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    const alCerrarSesion = () => setUsuario(null)
    window.addEventListener('auth:logout', alCerrarSesion)
    return () => window.removeEventListener('auth:logout', alCerrarSesion)
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await authApi.login({ username, password })
    setTokens({ access: data.access, refresh: data.refresh })
    setUsuario(data.user)
    return data.user
  }, [])

  const registro = useCallback(async (datos) => {
    const data = await authApi.registro(datos)
    setTokens({ access: data.access, refresh: data.refresh })
    setUsuario(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    const refresh = getRefreshToken()
    try {
      if (refresh) await authApi.logout(refresh)
    } catch {
      // Si el refresh ya venció o fue revocado, igual cerramos la sesión local.
    } finally {
      clearTokens()
      setUsuario(null)
    }
  }, [])

  const roles = useMemo(() => usuario?.roles ?? [], [usuario])
  const isAdmin = roles.includes('Administrador')

  const valor = useMemo(
    () => ({
      usuario,
      roles,
      isAdmin,
      cargando,
      login,
      registro,
      logout,
      recargarUsuario,
    }),
    [usuario, roles, isAdmin, cargando, login, registro, logout, recargarUsuario],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return contexto
}
