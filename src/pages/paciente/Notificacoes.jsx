import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, ClipboardList,
  CheckSquare, Users, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { listar, marcarLida } from '../../mocks/api/notificacoes'
import Sidebar from '../../components/ui/Sidebar'

const LINKS = [
  { label: 'Dashboard',        icon: LayoutDashboard, path: '/paciente' },
  { label: 'Agendamento',      icon: Calendar,        path: '/paciente/agendamento' },
  { label: 'Minhas Consultas', icon: ClipboardList,   path: '/paciente/consultas' },
  { label: 'Check-in',         icon: CheckSquare,     path: '/paciente/checkin' },
  { label: 'Fila',             icon: Users,           path: '/paciente/fila' },
  { label: 'Prontuário',       icon: FileText,        path: '/paciente/prontuario' },
  { label: 'Notificações',     icon: Bell,            path: '/paciente/notificacoes' },
  { label: 'Perfil',           icon: User,            path: '/paciente/perfil' },
]

const badgeStyle = (lida) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  background: lida ? '#F1F5F9' : '#DBEAFE',
  color: lida ? '#64748B' : '#1D4ED8',
})

export default function Notificacoes() {
  const { usuario, logout } = useAuth()
  const [notificacoes, setNotificacoes] = useState([])

  useEffect(() => {
    listar(usuario.id).then(setNotificacoes)
  }, [usuario.id])

  async function handleClick(notif) {
    if (notif.lida) return
    try {
      await marcarLida(notif.id)
      setNotificacoes(prev =>
        prev.map(n => n.id === notif.id ? { ...n, lida: true } : n)
      )
    } catch {
      // silencioso — não bloqueia o UX
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>
          Notificações
        </h1>

        {notificacoes.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Nenhuma notificação encontrada.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '600px' }}>
            {notificacoes.map(n => (
              <li
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  background: n.lida ? '#FFFFFF' : '#F0F9FF',
                  border: `0.5px solid ${n.lida ? '#E2E8F0' : '#BAE6FD'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  cursor: n.lida ? 'default' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: n.lida ? 400 : 600, color: '#1E293B' }}>
                    {n.titulo}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexShrink: 0 }}>
                    <span style={badgeStyle(n.lida)}>
                      {n.lida ? 'Lida' : 'Não lida'}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: '#94A3B8' }}>
                      {new Date(n.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                {n.mensagem && (
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: '#64748B' }}>
                    {n.mensagem}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
