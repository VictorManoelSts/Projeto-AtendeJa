import { createBrowserRouter, Outlet } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

export { ProtectedRoute }

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <div>Login</div>,
      },
      {
        path: '/paciente',
        element: <ProtectedRoute perfil="PACIENTE" />,
        children: [{ index: true, element: <div>Área Paciente</div> }],
      },
      {
        path: '/medico',
        element: <ProtectedRoute perfil="MEDICO" />,
        children: [{ index: true, element: <div>Área Médico</div> }],
      },
      {
        path: '/enfermeiro',
        element: <ProtectedRoute perfil="ENFERMEIRO" />,
        children: [{ index: true, element: <div>Área Enfermeiro</div> }],
      },
      {
        path: '/recepcao',
        element: <ProtectedRoute perfil="RECEPCIONISTA" />,
        children: [{ index: true, element: <div>Área Recepção</div> }],
      },
      {
        path: '/admin',
        element: <ProtectedRoute perfil="ADMINISTRADOR" />,
        children: [{ index: true, element: <div>Área Admin</div> }],
      },
    ],
  },
])

export default router
