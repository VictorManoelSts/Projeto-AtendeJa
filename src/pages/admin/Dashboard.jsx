import { LayoutDashboard, Users, Stethoscope, ClipboardList, BarChart2, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { pacientes } from '../../mocks/data/pacientes'
import { consultas } from '../../mocks/data/consultas'
import { fila }      from '../../mocks/data/fila'
import Sidebar from '../../components/ui/Sidebar'
import PulseiraBadge from '../../components/ui/PulseiraBadge'

const LINKS = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: '/admin' },
  { label: 'Usuários',   icon: Users,           path: '/admin/usuarios' },
  { label: 'Médicos',    icon: Stethoscope,     path: '/admin/medicos' },
  { label: 'Relatórios', icon: BarChart2,       path: '/admin/relatorios' },
  { label: 'Perfil',     icon: User,            path: '/admin/perfil' },
]

const STATUS_ATIVO = new Set(['AGUARDANDO', 'CHAMADO', 'EM_ATENDIMENTO'])
const TIPOS_FILA   = ['CONSULTA', 'EXAME', 'CIRURGIA', 'EMERGENCIA']
const LIMITE       = 70

const SLA_POR_NIVEL = { 1: 0, 2: 10, 3: 30, 4: 120, 5: 240 }
const SLA_DEFAULT   = 60

function hoje() {
  return new Date().toDateString()
}

function calcularPctSLA(entrada) {
  const ms      = Date.now() - new Date(entrada.horarioEntrada).getTime()
  const slaMins = SLA_POR_NIVEL[entrada.nivelRisco] ?? SLA_DEFAULT
  return slaMins === 0 ? Infinity : (ms / (slaMins * 60_000)) * 100
}

function calcularEspera(entrada) {
  const ms = Date.now() - new Date(entrada.horarioEntrada).getTime()
  return Math.max(0, Math.floor(ms / 60_000))
}

const cardStyle = {
  background: '#FFFFFF',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3) var(--space-4)',
}

const labelStyle = {
  fontSize: 'var(--text-xs)',
  color: '#64748B',
  marginBottom: 'var(--space-1)',
}

const valueStyle = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-bold)',
  color: '#1E293B',
}

export default function AdminDashboard() {
  const { usuario, logout } = useAuth()

  // Métricas computadas sincronamente dos dados mock
  const totalPacientes    = pacientes.length

  const atendimentosHoje  = consultas.filter(c => {
    const statusContado = new Set(['AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO', 'CONCLUIDO'])
    return new Date(c.dataHora).toDateString() === hoje() && statusContado.has(c.status)
  }).length

  const emEspera = fila.filter(e => e.status === 'AGUARDANDO')

  const tempoMedioMin = emEspera.length === 0
    ? 0
    : Math.round(
        emEspera.reduce((soma, e) => soma + calcularEspera(e), 0) / emEspera.length
      )

  // Ocupação por tipo
  const ocupacao = {}
  TIPOS_FILA.forEach(tipo => {
    ocupacao[tipo] = fila.filter(e => e.tipoFila === tipo && STATUS_ATIVO.has(e.status)).length
  })

  // Alertas SLA (>= 80%)
  const alertasSLA = fila.filter(e => STATUS_ATIVO.has(e.status) && calcularPctSLA(e) >= 80)

  function corFill(tipo, qtd) {
    if (tipo === 'EMERGENCIA') return '#DC2626'
    if ((qtd / LIMITE) >= 0.8)  return '#CA8A04'
    return '#334155'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Dashboard
        </h1>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={cardStyle}>
            <p style={labelStyle}>Pacientes cadastrados</p>
            <p data-testid="total-pacientes-value" style={valueStyle}>{totalPacientes}</p>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Atendimentos hoje</p>
            <p data-testid="atendimentos-hoje-value" style={valueStyle}>{atendimentosHoje}</p>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Pacientes em espera</p>
            <p data-testid="espera-value" style={valueStyle}>{emEspera.length}</p>
          </div>

          <div style={cardStyle} data-testid="card-tempo-medio">
            <p style={labelStyle}>Tempo médio de espera</p>
            <p style={valueStyle}>{tempoMedioMin} min</p>
          </div>
        </div>

        {/* Barras de ocupação */}
        <section style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-4)' }}>
            Ocupação das filas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {TIPOS_FILA.map(tipo => {
              const qtd  = ocupacao[tipo]
              const pct  = Math.min((qtd / LIMITE) * 100, 100)
              const fill = corFill(tipo, qtd)
              return (
                <div key={tipo} data-testid={`barra-${tipo}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: '#475569', fontWeight: 'var(--font-medium)' }}>{tipo}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: '#64748B' }}>{qtd} / {LIMITE}</span>
                  </div>
                  <div style={{ background: '#F1F5F9', height: '5px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      data-testid={`fill-${tipo}`}
                      style={{ width: `${pct}%`, height: '100%', background: fill, borderRadius: 'var(--radius-full)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Alertas SLA */}
        <section style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-3)' }}>
            Alertas SLA
          </h2>
          {alertasSLA.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Nenhum alerta no momento.</p>
          ) : (
            <ul data-testid="lista-alertas-sla" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {alertasSLA.map(entrada => {
                const espera  = calcularEspera(entrada)
                const slaMins = SLA_POR_NIVEL[entrada.nivelRisco] ?? SLA_DEFAULT
                return (
                  <li
                    key={entrada.id}
                    data-testid="alerta-sla-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-3)',
                      background: '#FFF1F2',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '3px solid #DC2626',
                    }}
                  >
                    <PulseiraBadge nivel={entrada.nivelRisco} />
                    <span style={{ fontSize: 'var(--text-xs)', color: '#1E293B', fontFamily: 'var(--font-mono)' }}>
                      {entrada.senha}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: '#DC2626', marginLeft: 'auto' }}>
                      {espera} min / {slaMins === 0 ? '—' : `${slaMins} min`}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
