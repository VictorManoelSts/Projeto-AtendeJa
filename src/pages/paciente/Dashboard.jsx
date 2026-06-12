import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, ClipboardList,
  CheckSquare, Users, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { listar as listarConsultas } from '../../mocks/api/consultas'
import { getFila } from '../../mocks/api/fila'
import { listar as listarNotifs } from '../../mocks/api/notificacoes'
import { medicos } from '../../mocks/data/medicos'
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

const TIPOS_FILA = ['CONSULTA', 'EXAME', 'CIRURGIA', 'EMERGENCIA']

const card = {
  background: '#FFFFFF',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3) var(--space-4)',
}

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const [proximaConsulta, setProximaConsulta] = useState(null)
  const [filaAtiva, setFilaAtiva]             = useState(null)
  const [notificacoes, setNotificacoes]       = useState([])

  useEffect(() => {
    async function carregar() {
      const [consultas, notifs] = await Promise.all([
        listarConsultas(usuario.id),
        listarNotifs(usuario.id),
      ])

      const proxima = consultas
        .filter(c => ['AGENDADO', 'CONFIRMADO'].includes(c.status))
        .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))[0] ?? null
      setProximaConsulta(proxima)
      setNotificacoes(notifs.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao)))

      for (const tipo of TIPOS_FILA) {
        const fila = await getFila(tipo)
        const entrada = fila.find(e => e.idPaciente === usuario.id)
        if (entrada) { setFilaAtiva(entrada); break }
      }
    }
    carregar()
  }, [usuario.id])

  const naoLidas = notificacoes.filter(n => !n.lida).length
  const ultimas3  = notificacoes.slice(0, 3)
  const medicoObj = proximaConsulta ? medicos.find(m => m.id === proximaConsulta.idMedico) : null
  const primeiroNome = usuario.nome.split(' ')[0]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Olá, {primeiroNome}
        </h1>

        {/* Grid de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" style={{ marginBottom: 'var(--space-8)' }}>
          {/* Próxima consulta */}
          <div style={card}>
            <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', margin: '0 0 var(--space-1)' }}>Próxima consulta</p>
            {proximaConsulta ? (
              <>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', margin: '0 0 2px' }}>
                  {new Date(proximaConsulta.dataHora).toLocaleDateString('pt-BR')}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', margin: 0 }}>{medicoObj?.nome ?? '—'}</p>
              </>
            ) : (
              <p style={{ fontSize: 'var(--text-sm)', color: '#94A3B8', margin: 0 }}>Sem consulta agendada</p>
            )}
          </div>

          {/* Fila ativa */}
          <div style={card}>
            <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', margin: '0 0 var(--space-1)' }}>Fila ativa</p>
            {filaAtiva ? (
              <>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', margin: '0 0 2px' }}>
                  {filaAtiva.senha}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', margin: 0 }}>Posição na fila</p>
              </>
            ) : (
              <p style={{ fontSize: 'var(--text-sm)', color: '#94A3B8', margin: 0 }}>Sem fila ativa</p>
            )}
          </div>

          {/* Notificações */}
          <div style={card}>
            <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', margin: '0 0 var(--space-1)' }}>Notificações</p>
            <p data-testid="notif-count" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', margin: '0 0 2px' }}>
              {naoLidas}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', margin: 0 }}>não lidas</p>
          </div>
        </div>

        {/* Últimas notificações */}
        <section aria-label="Últimas notificações">
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-4)' }}>
            Últimas notificações
          </h2>
          {ultimas3.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Nenhuma notificação</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {ultimas3.map(n => (
                <li key={n.id} style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: n.lida ? 400 : 600, color: '#1E293B', margin: 0 }}>
                    {n.titulo}
                  </p>
                  {n.mensagem && (
                    <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', margin: '4px 0 0' }}>
                      {n.mensagem}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
