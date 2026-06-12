import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, ClipboardList,
  CheckSquare, Users, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { listar, cancelar } from '../../mocks/api/consultas'
import { medicos } from '../../mocks/data/medicos'
import Sidebar from '../../components/ui/Sidebar'
import StatusBadge from '../../components/ui/StatusBadge'

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

const STATUS_CANCELAVEL = new Set(['AGENDADO', 'CONFIRMADO'])

const card = {
  background: '#FFFFFF',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3) var(--space-4)',
  marginBottom: 'var(--space-3)',
}

const btnSm = {
  border: 'none',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  minHeight: '36px',
}

export default function MinhasConsultas() {
  const { usuario, logout } = useAuth()
  const [consultas,   setConsultas]   = useState([])
  const [confirmando, setConfirmando] = useState(null)
  const [erro,        setErro]        = useState('')
  const [carregando,  setCarregando]  = useState(false)

  useEffect(() => {
    listar(usuario.id).then(setConsultas)
  }, [usuario.id])

  function handleCancelar(consulta) {
    if (consulta.contadorCancelamentos >= 2) {
      setConfirmando(consulta.id)
      return
    }
    executarCancelamento(consulta.id)
  }

  async function executarCancelamento(id) {
    setErro('')
    setCarregando(true)
    setConfirmando(null)
    try {
      await cancelar(id)
      const atualizadas = await listar(usuario.id)
      setConsultas(atualizadas)
    } catch (err) {
      setErro(err.message ?? 'Erro ao cancelar')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>
          Minhas Consultas
        </h1>

        {erro && (
          <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        {consultas.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Nenhuma consulta encontrada.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {consultas.map(c => {
              const medico  = medicos.find(m => m.id === c.idMedico)
              return (
                <li key={c.id} style={card}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-primary)' }}>
                        {medico?.nome ?? '—'}
                      </p>
                      <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-xs)', color: '#64748B' }}>
                        {medico?.especialidade ?? '—'}
                      </p>
                      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: '#94A3B8' }}>
                        {new Date(c.dataHora).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                      <StatusBadge status={c.status} />
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button style={{ ...btnSm, background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
                          Ver detalhes
                        </button>
                        {STATUS_CANCELAVEL.has(c.status) && (
                          <button
                            onClick={() => handleCancelar(c)}
                            disabled={carregando}
                            style={{ ...btnSm, background: '#FEE2E2', color: 'var(--color-danger)' }}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {confirmando === c.id && (
                    <div
                      role="alert"
                      style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: '#FEF9C3', border: '0.5px solid var(--color-warning)', borderRadius: 'var(--radius-sm)' }}
                    >
                      <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-xs)', color: '#92400E' }}>
                        <strong>Atenção:</strong> Você já cancelou consultas 2 vezes. Novos cancelamentos podem restringir seu acesso ao serviço.
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          onClick={() => executarCancelamento(c.id)}
                          style={{ ...btnSm, background: 'var(--color-danger)', color: '#FFFFFF' }}
                        >
                          Confirmar cancelamento
                        </button>
                        <button
                          onClick={() => setConfirmando(null)}
                          style={{ ...btnSm, background: '#FFFFFF', color: '#64748B', border: '0.5px solid #E2E8F0' }}
                        >
                          Manter consulta
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
