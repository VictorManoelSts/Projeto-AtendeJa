import {
  LayoutDashboard, Calendar, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { consultas as _consultas } from '../../mocks/data/consultas'
import { pacientes } from '../../mocks/data/pacientes'
import Sidebar from '../../components/ui/Sidebar'
import StatusBadge from '../../components/ui/StatusBadge'

const LINKS = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/medico' },
  { label: 'Agenda',       icon: Calendar,        path: '/medico/agenda' },
  { label: 'Prontuários',  icon: FileText,        path: '/medico/prontuarios' },
  { label: 'Notificações', icon: Bell,            path: '/medico/notificacoes' },
  { label: 'Perfil',       icon: User,            path: '/medico/perfil' },
]

function formatarHora(dataHora) {
  const [, hora] = dataHora.split('T')
  return hora.slice(0, 5)
}

export default function Agenda() {
  const { usuario, logout } = useAuth()

  const hoje = new Date().toISOString().slice(0, 10)
  const consultasHoje = _consultas
    .filter(c => c.idMedico === usuario.id && c.dataHora.startsWith(hoje))
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora))

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Agenda
        </h1>

        {consultasHoje.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Sem consultas agendadas para hoje.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {consultasHoje.map(consulta => {
              const paciente = pacientes.find(p => p.id === consulta.idPaciente)
              const isAtual  = consulta.status === 'EM_ATENDIMENTO'

              return (
                <li
                  key={consulta.id}
                  data-testid={isAtual ? 'agenda-item-atual' : undefined}
                  style={{
                    background: '#FFFFFF',
                    border: isAtual ? '1px solid #1E293B' : '0.5px solid #E2E8F0',
                    borderLeft: isAtual ? '3px solid #1E293B' : '3px solid transparent',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-bold)',
                    color: '#1E293B',
                    minWidth: '40px',
                  }}>
                    {formatarHora(consulta.dataHora)}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: '#1E293B' }}>
                      {paciente?.nome ?? 'Paciente não encontrado'}
                    </p>
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: '#64748B' }}>
                      {consulta.tipoConsulta.replace('_', ' ')}
                    </p>
                  </div>

                  <StatusBadge status={consulta.status} />
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
