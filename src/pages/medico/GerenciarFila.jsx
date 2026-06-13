import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getFila, chamarProximo, marcarAusente, encerrarAtendimento } from '../../mocks/api/fila'
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

const SLA_MS     = 30 * 60 * 1000   // 30 minutos
const SLA_ALERT  = 0.8              // 80%

function calcularEspera(horarioEntrada) {
  const ms = Date.now() - new Date(horarioEntrada).getTime()
  return Math.max(0, Math.floor(ms / 60_000))
}

function isSLAAlert(horarioEntrada) {
  const ms = Date.now() - new Date(horarioEntrada).getTime()
  return ms >= SLA_MS * SLA_ALERT
}

const btnBase = {
  border: 'none',
  borderRadius: 'var(--radius-md)',
  padding: '4px 10px',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  minHeight: '32px',
}

export default function GerenciarFila() {
  const { usuario, logout } = useAuth()

  const [entradas,   setEntradas]   = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro,       setErro]       = useState('')

  async function carregarFila() {
    const dados = await getFila('CONSULTA')
    setEntradas(dados)
  }

  useEffect(() => {
    carregarFila()
  }, [])

  async function handleChamar(entrada) {
    setErro('')
    setCarregando(true)
    try {
      await chamarProximo(entrada.tipoFila)
      await carregarFila()
    } catch (err) {
      setErro(err.message ?? 'Erro ao chamar paciente')
    } finally {
      setCarregando(false)
    }
  }

  async function handleAusente(entrada) {
    setErro('')
    setCarregando(true)
    try {
      await marcarAusente(entrada.id)
      setEntradas(prev => prev.filter(e => e.id !== entrada.id))
    } catch (err) {
      setErro(err.message ?? 'Erro ao marcar ausente')
    } finally {
      setCarregando(false)
    }
  }

  async function handleEncerrar(entrada) {
    setErro('')
    setCarregando(true)
    try {
      await encerrarAtendimento(entrada.id)
      setEntradas(prev => prev.filter(e => e.id !== entrada.id))
    } catch (err) {
      setErro(err.message ?? 'Erro ao encerrar atendimento')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Gerenciar Fila
        </h1>

        {erro && (
          <p role="alert" style={{ color: '#DC2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        {entradas.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Fila vazia.</p>
        ) : (
          <div className="overflow-x-auto" style={{ borderRadius: 'var(--radius-lg)', border: '0.5px solid #E2E8F0' }}>
            <table style={{ minWidth: '640px', width: '100%', borderCollapse: 'collapse', background: '#FFFFFF' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Senha', 'Paciente', 'Prioridade', 'Espera', 'Status', 'Ações'].map(col => (
                    <th
                      key={col}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        textAlign: 'left',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-bold)',
                        color: '#64748B',
                        borderBottom: '0.5px solid #E2E8F0',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada, idx) => {
                  const pac      = pacientes.find(p => p.id === entrada.idPaciente)
                  const espera   = calcularEspera(entrada.horarioEntrada)
                  const alerta   = isSLAAlert(entrada.horarioEntrada)
                  const ultimo   = idx === entradas.length - 1

                  return (
                    <tr
                      key={entrada.id}
                      data-testid={alerta ? 'row-sla-alert' : undefined}
                      style={{
                        background: alerta ? '#FFFBEB' : '#FFFFFF',
                        borderBottom: ultimo ? 'none' : '0.5px solid #F1F5F9',
                      }}
                    >
                      <td style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: '#1E293B', fontFamily: 'var(--font-mono)' }}>
                        {entrada.senha}
                      </td>
                      <td style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', color: '#1E293B' }}>
                        {pac?.nome ?? '—'}
                      </td>
                      <td style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', color: '#475569' }}>
                        {entrada.prioridade}
                      </td>
                      <td style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', color: alerta ? '#CA8A04' : '#475569' }}>
                        {espera} min
                      </td>
                      <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                        <StatusBadge status={entrada.status} />
                      </td>
                      <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleChamar(entrada)}
                            disabled={carregando}
                            style={{ ...btnBase, background: '#1E293B', color: '#FFFFFF' }}
                          >
                            Chamar
                          </button>
                          <button
                            onClick={() => handleAusente(entrada)}
                            disabled={carregando}
                            style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #FECACA', color: '#DC2626' }}
                          >
                            Ausente
                          </button>
                          <button
                            onClick={() => handleEncerrar(entrada)}
                            disabled={carregando}
                            style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155' }}
                          >
                            Encerrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
