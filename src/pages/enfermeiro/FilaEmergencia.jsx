import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  LayoutDashboard, ClipboardList, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getFila, chamarProximo, marcarAusente, sairDaFila } from '../../mocks/api/fila'
import { pacientes } from '../../mocks/data/pacientes'
import Sidebar from '../../components/ui/Sidebar'
import PulseiraBadge from '../../components/ui/PulseiraBadge'
import StatusBadge from '../../components/ui/StatusBadge'

const LINKS = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/enfermeiro' },
  { label: 'Triagem',     icon: ClipboardList,   path: '/enfermeiro/triagem' },
  { label: 'Fila EM',     icon: ClipboardList,   path: '/enfermeiro/fila' },
  { label: 'Notificações',icon: Bell,            path: '/enfermeiro/notificacoes' },
  { label: 'Perfil',      icon: User,            path: '/enfermeiro/perfil' },
]

// SLA por nível Manchester (minutos)
const SLA_POR_NIVEL = { 1: 0, 2: 10, 3: 30, 4: 120, 5: 240 }
const SLA_DEFAULT   = 60

function calcularSLA(entrada) {
  const esperaMs  = Date.now() - new Date(entrada.horarioEntrada).getTime()
  const esperaMin = Math.max(0, Math.floor(esperaMs / 60_000))
  const slaMins   = SLA_POR_NIVEL[entrada.nivelRisco] ?? SLA_DEFAULT
  const pctSLA    = slaMins === 0 ? Infinity : (esperaMs / (slaMins * 60_000)) * 100
  return { esperaMin, pctSLA }
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

export default function FilaEmergencia() {
  const { usuario, logout } = useAuth()

  const [entradas,   setEntradas]   = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro,       setErro]       = useState('')

  useEffect(() => {
    getFila('EMERGENCIA').then(setEntradas)
  }, [])

  async function handleChamar() {
    setErro('')
    setCarregando(true)
    try {
      await chamarProximo('EMERGENCIA')
      const nova = await getFila('EMERGENCIA')
      setEntradas(nova)
    } catch (err) {
      setErro(err.message ?? 'Erro ao chamar próximo')
    } finally {
      setCarregando(false)
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', margin: 0 }}>
            Fila de Emergência
          </h1>
          <button
            type="button"
            onClick={handleChamar}
            disabled={carregando || entradas.length === 0}
            style={{ ...btnBase, padding: 'var(--space-2) var(--space-4)', minHeight: '44px', background: '#1E293B', color: '#FFFFFF', fontSize: 'var(--text-sm)' }}
          >
            Chamar Próximo
          </button>
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
            <table style={{ minWidth: '720px', width: '100%', borderCollapse: 'collapse', background: '#FFFFFF' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Senha', 'Pulseira', 'Paciente', 'Prioridade', 'Espera', 'Status', 'Ações'].map(col => (
                    <th key={col} style={thStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada, idx) => {
                  const pac             = pacientes.find(p => p.id === entrada.idPaciente)
                  const { esperaMin, pctSLA } = calcularSLA(entrada)
                  const isCritico       = pctSLA >= 100
                  const isPreventivo    = !isCritico && pctSLA >= 80
                  const ultimo          = idx === entradas.length - 1

                  const rowBg = isCritico
                    ? '#FFF1F2'
                    : isPreventivo
                      ? '#FFFBEB'
                      : '#FFFFFF'

                  const rowTestId = isCritico
                    ? 'row-sla-critico'
                    : isPreventivo
                      ? 'row-sla-preventivo'
                      : undefined

                  return (
                    <tr
                      key={entrada.id}
                      data-testid={rowTestId}
                      style={{
                        background: rowBg,
                        borderBottom: ultimo ? 'none' : '0.5px solid #F1F5F9',
                        ...(isCritico ? { borderLeft: '3px solid #DC2626' } : {}),
                      }}
                    >
                      {/* Senha */}
                      <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontWeight: 'var(--font-bold)' }}>
                        {entrada.senha}
                      </td>

                      {/* Pulseira */}
                      <td style={tdStyle}>
                        {entrada.nivelRisco && <PulseiraBadge nivel={entrada.nivelRisco} />}
                      </td>

                      {/* Paciente */}
                      <td style={tdStyle}>
                        {pac?.nome ?? '—'}
                      </td>

                      {/* Prioridade legal */}
                      <td style={{ ...tdStyle, fontSize: 'var(--text-xs)', color: '#475569' }}>
                        {pac?.prioridade ?? '—'}
                      </td>

                      {/* Tempo de espera */}
                      <td style={tdStyle}>
                        {isCritico ? (
                          <span
                            role="alert"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)' }}
                          >
                            <AlertTriangle size={12} aria-hidden="true" />
                            {esperaMin} min — Excedido
                          </span>
                        ) : isPreventivo ? (
                          <span
                            role="alert"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#CA8A04', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)' }}
                          >
                            <AlertTriangle size={12} aria-hidden="true" />
                            {esperaMin} min
                          </span>
                        ) : (
                          <span style={{ fontSize: 'var(--text-sm)', color: '#475569' }}>
                            {esperaMin} min
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <StatusBadge status={entrada.status} />
                      </td>

                      {/* Ações */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
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
