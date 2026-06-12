import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginMock, logout as logoutMock } from '../mocks/api/auth'

const ROTAS_PERFIL = {
  PACIENTE:      '/paciente',
  MEDICO:        '/medico',
  ENFERMEIRO:    '/enfermeiro',
  RECEPCIONISTA: '/recepcao',
  ADMINISTRADOR: '/admin',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const navigate = useNavigate()

  async function login(email, senha) {
    const { usuario: user } = await loginMock(email, senha)
    setUsuario(user)
    navigate(ROTAS_PERFIL[user.perfil])
  }

  async function logout() {
    await logoutMock()
    setUsuario(null)
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
