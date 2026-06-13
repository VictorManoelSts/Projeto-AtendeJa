import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getFila, chamarProximo } from '../../mocks/api/fila'
import { consultas as _consultas } from '../../mocks/data/consultas'
import { pacientes } from '../../mocks/data/pacientes'
import { prontuarios } from '../../mocks/data/prontuarios'
import Sidebar from '../../components/ui/Sidebar'
import SenhaDisplay from '../../components/ui/SenhaDisplay'

const LINKS = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/medico' },
  { label: 'Agenda',       icon: Calendar,        path: '/medico/agenda' },
  { label: 'Prontuários',  icon: FileText,        path: '/medico/prontuarios' },
  { label: 'Notificações', icon: Bell,            path: '/medico/notificacoes' },
  { label: 'Perfil',       icon: User,            path: '/medico/perfil' },
]

const TIPOS_FILA = ['CONSULTA', 'EXAME', 'CIRURGIA', 'EMERGENCIA']

const cardMetrica = {
  background: '#FFFFFF',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3) var(--space-4)',
}

const labelMetrica = {
  fontSize: 'var(--text-xs)',
  color: '#64748B',
  margin: '0 0 var(--space-1)',
}

const valorMetrica = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-bold)',
  color: '#1E293B',
  margin: '0 0 2px',
}

const subMetrica = {
  fontSize: 'var(--text-xs)',
  color: '#94A3B8',
  margin: 0,
}

const btnBase = {
  border: 'none',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-2) var(--space-4)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  minHeight: '44px',
}

function calcularIdade(dataNasc) {
  if (!dataNasc) return null
  const hoje = new Date()
  const nasc = new Date(dataNasc)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--
  }
  return idade
}

export default function DashboardMedico() {
  const { usuario, logout } = useAuth()

  const [aguardando,   setAguardando]   = useState([])
  const [proximoEntry, setProximoEntry] = useState(null)
  const [carregando,   setCarregando]   = useState(false)
  const [erro,         setErro]         = useState('')

  // Consultas de hoje para este médico
  const hoje = new Date().toISOString().slice(0, 10)
  const consultasHoje = _consultas.filter(c =>
    c.idMedico === usuario.id && c.dataHora.startsWith(hoje)
  )

  useEffect(() => {
    async function carregarFila() {
      const todas = []
      for (const tipo of TIPOS_FILA) {
        const fila = await getFila(tipo)
        todas.push(...fila.filter(e => e.status === 'AGUARDANDO'))
      }
      setAguardando(todas)
      setProximoEntry(todas[0] ?? null)
    }
    carregarFila()
  }, [])

  const totalHoje      = consultasHoje.length
  const totalAguardando = aguardando.length
  const tempoMedio     = totalAguardando * 15

  const proximoPaciente   = proximoEntry ? pacientes.find(p => p.id === proximoEntry.idPaciente)   : null
  const proximoProntuario = proximoEntry ? prontuarios.find(p => p.idPaciente === proximoEntry.idPaciente) : null
  const proximoIdade      = calcularIdade(proximoPaciente?.dataNascimento)

  async function handleChamar() {
    if (!proximoEntry) return
    setErro('')
    setCarregando(true)
    try {
      await chamarProximo(proximoEntry.tipoFila)
      const restantes = aguardando.filter(e => e.id !== proximoEntry.id)
      setAguardando(restantes)
      setProximoEntry(restantes[0] ?? null)
    } catch (err) {
      setErro(err.message ?? 'Erro ao chamar paciente')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Dashboard
        </h1>

        {erro && (
          <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        {/* Cards de métrica */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" style={{ marginBottom: 'var(--space-8)' }}>
          <div style={cardMetrica}>
            <p style={labelMetrica}>Total de consultas</p>
            <p data-testid="total-consultas-value" style={valorMetrica}>{totalHoje}</p>
            <p style={subMetrica}>hoje</p>
          </div>

          <div style={cardMetrica}>
            <p style={labelMetrica}>Pacientes em espera</p>
            <p data-testid="total-espera-value" style={valorMetrica}>{totalAguardando}</p>
            <p style={subMetrica}>na fila</p>
          </div>

          <div style={cardMetrica}>
            <p style={labelMetrica}>Tempo médio</p>
            <p style={valorMetrica}>{tempoMedio}</p>
            <p style={subMetrica}>minutos estimados</p>
          </div>
        </div>

        {/* Card próximo paciente */}
        <section aria-label="Próximo paciente">
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-4)' }}>
            Próximo paciente
          </h2>

          {proximoEntry && proximoPaciente ? (
            <div style={{
              background: '#FFFFFF',
              border: '0.5px solid #E2E8F0',
              borderLeft: '3px solid #1E293B',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              padding: 'var(--space-4) var(--space-6)',
              maxWidth: '560px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: '#1E293B', margin: '0 0 var(--space-1)' }}>
                    {proximoPaciente.nome}
                  </p>
                  <p data-testid="proximo-idade" style={{ fontSize: 'var(--text-xs)', color: '#64748B', margin: '0 0 var(--space-2)' }}>
                    {proximoIdade !== null ? `${proximoIdade} anos` : '—'}
                  </p>

                  {proximoProntuario?.alergias?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-3)' }}>
                      {proximoProntuario.alergias.map((a, i) => (
                        <span key={i} style={{
                          background: '#FEE2E2',
                          border: '0.5px solid #FECACA',
                          borderRadius: 'var(--radius-full)',
                          padding: '2px 8px',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-danger)',
                        }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <SenhaDisplay senha={proximoEntry.senha} />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                <button
                  onClick={handleChamar}
                  disabled={carregando}
                  style={{ ...btnBase, background: '#1E293B', color: '#FFFFFF' }}
                >
                  {carregando ? 'Chamando…' : 'Chamar paciente'}
                </button>
                <button
                  type="button"
                  style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155' }}
                >
                  Ver prontuário
                </button>
              </div>
            </div>
          ) : (
            <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Sem pacientes aguardando.</p>
          )}
        </section>
      </main>
    </div>
  )
}
