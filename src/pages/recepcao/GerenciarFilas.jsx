import { useState, useEffect } from 'react'
import { LayoutDashboard, ClipboardList, Calendar, Bell, User, UserCheck, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getFila, chamarProximo, marcarAusente, sairDaFila, reabrirAtendimento,
} from '../../mocks/api/fila'
import { pacientes } from '../../mocks/data/pacientes'
import Sidebar from '../../components/ui/Sidebar'
import StatusBadge from '../../components/ui/StatusBadge'

const LINKS = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/recepcao' },
  { label: 'Check-in',      icon: UserCheck,       path: '/recepcao/checkin' },
  { label: 'Filas',         icon: ClipboardList,   path: '/recepcao/filas' },
  { label: 'Reagendamento', icon: Calendar,        path: '/recepcao/reagendamento' },
  { label: 'Notificações',  icon: Bell,            path: '/recepcao/notificacoes' },
  { label: 'Perfil',        icon: User,            path: '/recepcao/perfil' },
]

const ABAS = [
  { tipo: 'CONSULTA',  label: 'Consulta (CM)' },
  { tipo: 'EXAME',     label: 'Exame (EX)' },
  { tipo: 'CIRURGIA',  label: 'Cirurgia (CI)' },
]

const SLA_POR_TIPO = { CONSULTA: 30, EXAME: 60, CIRURGIA: 120 }

function calcularEspera(horarioEntrada) {
  const ms = Date.now() - new Date(horarioEntrada).getTime()
  return Math.max(0, Math.floor(ms / 60_000))
}

function isSLAPreventivo(horarioEntrada, tipo) {
  const ms     = Date.now() - new Date(horarioEntrada).getTime()
  const slaMins = SLA_POR_TIPO[tipo] ?? 60
  return ms >= slaMins * 60_000 * 0.8
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

const thStyle = {
  padding: 'var(--space-2) var(--space-3)',
  textAlign: 'left',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-bold)',
  color: '#64748B',
  borderBottom: '0.5px solid #E2E8F0',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-sm)',
  color: '#1E293B',
  verticalAlign: 'middle',
}

export default function GerenciarFilas() {
  const { usuario, logout } = useAuth()

  const [abaAtiva,   setAbaAtiva]   = useState('CONSULTA')
  const [entradas,   setEntradas]   = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro,       setErro]       = useState('')

  async function carregarFila(tipo) {
    const dados = await getFila(tipo)
    setEntradas(dados)
  }

  useEffect(() => {
    carregarFila(abaAtiva)
  }, [abaAtiva])

  async function handleChamarProximo() {
    setErro('')
    setCarregando(true)
    try {
      await chamarProximo(abaAtiva)
      await carregarFila(abaAtiva)
    } catch (err) {
      setErro(err.message ?? 'Erro ao chamar próximo')
    } finally {
      setCarregando(false)
    }
  }

  async function handleChamarLinha(entrada) {
    setErro('')
    try {
      await chamarProximo(entrada.tipoFila)
      await carregarFila(abaAtiva)
    } catch (err) {
      setErro(err.message ?? 'Erro ao chamar paciente')
    }
  }

  async function handleAusente(entrada) {
    setErro('')
    try {
      await marcarAusente(entrada.id)
      setEntradas(prev => prev.filter(e => e.id !== entrada.id))
    } catch (err) {
      setErro(err.message ?? 'Erro ao marcar ausente')
    }
  }

  async function handleCancelar(entrada) {
    setErro('')
    try {
      await sairDaFila(entrada.id)
      setEntradas(prev => prev.filter(e => e.id !== entrada.id))
    } catch (err) {
      setErro(err.message ?? 'Erro ao cancelar')
    }
  }

  async function handleReabrir(entrada) {
    setErro('')
    try {
      await reabrirAtendimento(entrada.id)
      await carregarFila(abaAtiva)
    } catch (err) {
      setErro(err.message ?? 'Erro ao reabrir')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', margin: 0 }}>
            Gerenciar Filas
          </h1>
          <button
            type="button"
            onClick={handleChamarProximo}
            disabled={carregando || entradas.length === 0}
            style={{ ...btnBase, padding: 'var(--space-2) var(--space-4)', minHeight: '44px', background: '#1E293B', color: '#FFFFFF', fontSize: 'var(--text-sm)' }}
          >
            Chamar Próximo
          </button>
        </div>

        {/* Abas */}
        <div
          role="tablist"
          style={{ display: 'flex', gap: 'var(--space-1)', borderBottom: '0.5px solid #E2E8F0', marginBottom: 'var(--space-4)' }}
        >
          {ABAS.map(aba => (
            <button
              key={aba.tipo}
              type="button"
              role="tab"
              aria-selected={abaAtiva === aba.tipo}
              onClick={() => setAbaAtiva(aba.tipo)}
              style={{
                ...btnBase,
                background: abaAtiva === aba.tipo ? '#1E293B' : 'transparent',
                color: abaAtiva === aba.tipo ? '#FFFFFF' : '#64748B',
                border: 'none',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                padding: 'var(--space-2) var(--space-4)',
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>

        {erro && (
          <p role="alert" style={{ color: '#DC2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        {entradas.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Fila vazia.</p>
        ) : (
          <div className="overflow-x-auto" style={{ borderRadius: 'var(--radius-lg)', border: '0.5px solid #E2E8F0' }}>
            <table style={{ minWidth: '600px', width: '100%', borderCollapse: 'collapse', background: '#FFFFFF' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={thStyle}>Senha</th>
                  <th style={thStyle}>Paciente</th>
                  <th className="hidden lg:table-cell" style={thStyle}>Prioridade</th>
                  <th className="hidden md:table-cell" style={thStyle}>Espera</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada, idx) => {
                  const pac       = pacientes.find(p => p.id === entrada.idPaciente)
                  const espera    = calcularEspera(entrada.horarioEntrada)
                  const preventivo = isSLAPreventivo(entrada.horarioEntrada, entrada.tipoFila)
                  const ultimo    = idx === entradas.length - 1

                  return (
                    <tr
                      key={entrada.id}
                      data-testid={preventivo ? 'row-sla-preventivo' : undefined}
                      style={{
                        background: preventivo ? '#FFFBEB' : '#FFFFFF',
                        borderBottom: ultimo ? 'none' : '0.5px solid #F1F5F9',
                      }}
                    >
                      <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontWeight: 'var(--font-bold)' }}>
                        {entrada.senha}
                      </td>
                      <td style={tdStyle}>
                        {pac?.nome ?? '—'}
                      </td>
                      <td className="hidden lg:table-cell" style={{ ...tdStyle, fontSize: 'var(--text-xs)', color: '#475569' }}>
                        {entrada.prioridade}
                      </td>
                      <td
                        className="hidden md:table-cell"
                        style={{ ...tdStyle, color: preventivo ? '#CA8A04' : '#475569' }}
                        {...(preventivo ? { role: 'alert' } : {})}
                      >
                        {preventivo && (
                          <AlertTriangle size={12} style={{ marginRight: '4px', verticalAlign: 'middle', color: '#CA8A04' }} aria-hidden="true" />
                        )}
                        {espera} min
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={entrada.status} />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleChamarLinha(entrada)}
                            style={{ ...btnBase, background: '#1E293B', color: '#FFFFFF' }}
                          >
                            Chamar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAusente(entrada)}
                            style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #FECACA', color: '#DC2626' }}
                          >
                            Ausente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelar(entrada)}
                            style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155' }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReabrir(entrada)}
                            style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155' }}
                          >
                            Reabrir
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
