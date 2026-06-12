import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { logout as logoutMock } from '../mocks/api/auth'

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _ctx = {}

function ContextCapture() {
  const auth = useAuth()
  const { pathname } = useLocation()
  _ctx = { ...auth, pathname }
  return <div data-testid="pathname">{pathname}</div>
}

function NavButton({ to }) {
  const nav = useNavigate()
  return (
    <button data-testid={`nav-${to.slice(1)}`} onClick={() => nav(to)}>
      ir
    </button>
  )
}

// MemoryRouter (non-data-router): usa navigator.push/replace sem Request
// Evita o conflito entre AbortSignal do jsdom e Request nativo do Node.js

function AppRouter({ initialPath = '/' }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route index element={<ContextCapture />} />
          <Route path="paciente"   element={<ContextCapture />} />
          <Route path="medico"     element={<ContextCapture />} />
          <Route path="enfermeiro" element={<ContextCapture />} />
          <Route path="recepcao"   element={<ContextCapture />} />
          <Route path="admin"      element={<ContextCapture />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

function ProtectedAppRouter({ initialPath = '/' }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route index element={<ContextCapture />} />

          <Route path="paciente" element={<ProtectedRoute perfil="PACIENTE" />}>
            <Route index element={
              <>
                <div data-testid="area-paciente">Área Paciente</div>
                <ContextCapture />
                <NavButton to="/medico" />
              </>
            } />
          </Route>

          <Route path="medico" element={<ProtectedRoute perfil="MEDICO" />}>
            <Route index element={
              <>
                <div data-testid="area-medico">Área Médico</div>
                <ContextCapture />
              </>
            } />
          </Route>

          <Route path="enfermeiro" element={<ProtectedRoute perfil="ENFERMEIRO" />}>
            <Route index element={<ContextCapture />} />
          </Route>

          <Route path="recepcao" element={<ProtectedRoute perfil="RECEPCIONISTA" />}>
            <Route index element={<ContextCapture />} />
          </Route>

          <Route path="admin" element={<ProtectedRoute perfil="ADMINISTRADOR" />}>
            <Route index element={<ContextCapture />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(async () => {
  await logoutMock()
  _ctx = {}
})

// ─── Estado inicial ───────────────────────────────────────────────────────────

describe('AuthContext — estado inicial', () => {
  it('usuario começa como null', () => {
    render(<AppRouter />)
    expect(_ctx.usuario).toBeNull()
  })

  it('expõe funções login e logout', () => {
    render(<AppRouter />)
    expect(typeof _ctx.login).toBe('function')
    expect(typeof _ctx.logout).toBe('function')
  })
})

// ─── Login ────────────────────────────────────────────────────────────────────

describe('AuthContext — login', () => {
  it('credenciais válidas definem usuario no contexto', async () => {
    render(<AppRouter />)

    await act(async () => {
      await _ctx.login('carlos.ferreira@email.com', '123456')
    })

    await waitFor(() => expect(_ctx.usuario).not.toBeNull())
    expect(_ctx.usuario.email).toBe('carlos.ferreira@email.com')
  })

  it('credenciais inválidas lançam erro e usuario permanece null', async () => {
    render(<AppRouter />)

    let caughtError
    await act(async () => {
      try {
        await _ctx.login('naoexiste@email.com', 'errada')
      } catch (e) {
        caughtError = e
      }
    })

    expect(caughtError?.message).toContain('Credenciais inválidas')
    expect(_ctx.usuario).toBeNull()
  })

  it.each([
    ['carlos.ferreira@email.com',    'PACIENTE',      '/paciente'],
    ['eduardo.rezende@atendeja.com', 'MEDICO',        '/medico'],
    ['ana.sousa@atendeja.com',       'ENFERMEIRO',    '/enfermeiro'],
    ['juliana.martins@atendeja.com', 'RECEPCIONISTA', '/recepcao'],
    ['roberto.alves@atendeja.com',   'ADMINISTRADOR', '/admin'],
  ])('%s → perfil %s → navega para %s', async (email, perfil, rota) => {
    render(<AppRouter />)

    await act(async () => {
      await _ctx.login(email, '123456')
    })

    await waitFor(() => expect(_ctx.pathname).toBe(rota))
    expect(_ctx.usuario?.perfil).toBe(perfil)
  })
})

// ─── Logout ───────────────────────────────────────────────────────────────────

describe('AuthContext — logout', () => {
  it('limpa usuario e navega para /', async () => {
    render(<AppRouter />)

    await act(async () => {
      await _ctx.login('carlos.ferreira@email.com', '123456')
    })
    await waitFor(() => expect(_ctx.pathname).toBe('/paciente'))

    await act(async () => {
      await _ctx.logout()
    })

    await waitFor(() => expect(_ctx.pathname).toBe('/'))
    expect(_ctx.usuario).toBeNull()
  })
})

// ─── ProtectedRoute — não autenticado ─────────────────────────────────────────

describe('ProtectedRoute — não autenticado', () => {
  it('redireciona para / ao tentar acessar rota protegida', async () => {
    render(<ProtectedAppRouter initialPath="/paciente" />)
    await waitFor(() => expect(_ctx.pathname).toBe('/'))
  })

  it('não renderiza o conteúdo protegido', async () => {
    render(<ProtectedAppRouter initialPath="/paciente" />)
    await waitFor(() => expect(_ctx.pathname).toBe('/'))
    expect(screen.queryByTestId('area-paciente')).toBeNull()
  })
})

// ─── ProtectedRoute — autenticado com perfil correto ─────────────────────────

describe('ProtectedRoute — autenticado com perfil correto', () => {
  it('renderiza o conteúdo da área e mantém na rota certa', async () => {
    render(<ProtectedAppRouter initialPath="/" />)

    await act(async () => {
      await _ctx.login('carlos.ferreira@email.com', '123456')
    })

    await waitFor(() => expect(screen.getByTestId('area-paciente')).toBeInTheDocument())
    expect(_ctx.pathname).toBe('/paciente')
  })
})

// ─── ProtectedRoute — autenticado com perfil errado ──────────────────────────

describe('ProtectedRoute — autenticado com perfil errado', () => {
  it('redireciona para a área correta do usuário autenticado', async () => {
    render(<ProtectedAppRouter initialPath="/" />)

    // Login como PACIENTE → navega para /paciente
    await act(async () => {
      await _ctx.login('carlos.ferreira@email.com', '123456')
    })
    await waitFor(() => expect(_ctx.pathname).toBe('/paciente'))

    // Tenta ir para /medico (área errada)
    await userEvent.click(screen.getByTestId('nav-medico'))

    // Deve ser redirecionado de volta para /paciente
    await waitFor(() => expect(_ctx.pathname).toBe('/paciente'))
  })
})
