import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROTAS_PERFIL = {
  PACIENTE:      '/paciente',
  MEDICO:        '/medico',
  ENFERMEIRO:    '/enfermeiro',
  RECEPCIONISTA: '/recepcao',
  ADMINISTRADOR: '/admin',
}

export function ProtectedRoute({ perfil }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/" replace />
  if (usuario.perfil !== perfil) return <Navigate to={ROTAS_PERFIL[usuario.perfil]} replace />

  return <Outlet />
}
