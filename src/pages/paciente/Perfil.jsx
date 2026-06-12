import {
  LayoutDashboard, Calendar, ClipboardList,
  CheckSquare, Users, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { pacientes } from '../../mocks/data/pacientes'
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

const campo = {
  marginBottom: 'var(--space-4)',
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 'var(--space-1)',
}

const valorStyle = {
  fontSize: 'var(--text-sm)',
  color: '#1E293B',
  margin: 0,
}

const btnBase = {
  border: 'none',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3) var(--space-4)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  minHeight: '44px',
}

function formatarData(iso) {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export default function Perfil() {
  const { usuario, logout } = useAuth()
  const paciente = pacientes.find(p => p.id === usuario.id) ?? null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>
          Perfil
        </h1>

        <div style={{ maxWidth: '520px', background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
            <div style={campo}>
              <span style={labelStyle}>Nome</span>
              <p style={valorStyle}>{paciente?.nome ?? usuario.nome}</p>
            </div>

            <div style={campo}>
              <span style={labelStyle}>CPF</span>
              <p style={valorStyle}>{paciente?.cpf ?? '—'}</p>
            </div>

            <div style={campo}>
              <span style={labelStyle}>E-mail</span>
              <p style={valorStyle}>{paciente?.email ?? usuario.email ?? '—'}</p>
            </div>

            <div style={campo}>
              <span style={labelStyle}>Telefone</span>
              <p style={valorStyle}>{paciente?.telefone ?? '—'}</p>
            </div>

            <div style={campo}>
              <span style={labelStyle}>Data de Nascimento</span>
              <p style={valorStyle}>{formatarData(paciente?.dataNascimento)}</p>
            </div>

            <div style={campo}>
              <span style={labelStyle}>Tipo Sanguíneo</span>
              <p style={valorStyle}>{paciente?.tipoSanguineo ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <button
            type="button"
            style={{ ...btnBase, background: 'var(--color-primary)', color: '#FFFFFF' }}
          >
            Editar
          </button>
          <button
            type="button"
            style={{ ...btnBase, background: '#FFFFFF', color: '#1E293B', border: '0.5px solid #E2E8F0' }}
          >
            Alterar Senha
          </button>
          <button
            type="button"
            style={{ ...btnBase, background: '#FFFFFF', color: '#1E293B', border: '0.5px solid #E2E8F0' }}
          >
            Exportar Dados
          </button>
        </div>
      </main>
    </div>
  )
}
