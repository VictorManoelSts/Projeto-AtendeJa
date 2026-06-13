import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProntuario, atualizarProntuario } from '../../mocks/api/prontuario'
import { encerrarAtendimento } from '../../mocks/api/fila'
import { pacientes } from '../../mocks/data/pacientes'
import Sidebar from '../../components/ui/Sidebar'

const LINKS = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/medico' },
  { label: 'Agenda',       icon: Calendar,        path: '/medico/agenda' },
  { label: 'Prontuários',  icon: FileText,        path: '/medico/prontuarios' },
  { label: 'Notificações', icon: Bell,            path: '/medico/notificacoes' },
  { label: 'Perfil',       icon: User,            path: '/medico/perfil' },
]

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  color: '#334155',
  marginBottom: 'var(--space-1)',
}

const inputStyle = {
  width: '100%',
  background: '#FFFFFF',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-1) var(--space-2)',
  color: '#1E293B',
  fontSize: 'var(--text-sm)',
  fontFamily: 'inherit',
  resize: 'vertical',
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
  const nasc  = new Date(dataNasc)
  let idade   = hoje.getFullYear() - nasc.getFullYear()
  const m     = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

export default function Atendimento() {
  const { usuario, logout } = useAuth()
  const { idPaciente, idFila } = useParams()

  const paciente   = pacientes.find(p => p.id === idPaciente) ?? null
  const idade      = calcularIdade(paciente?.dataNascimento)

  const [prontuario,       setProntuario]       = useState(null)
  const [queixaPrincipal,  setQueixaPrincipal]  = useState('')
  const [diagnostico,      setDiagnostico]      = useState('')
  const [observacoes,      setObservacoes]      = useState('')
  const [carregando,       setCarregando]       = useState(false)
  const [finalizado,       setFinalizado]       = useState(false)
  const [erro,             setErro]             = useState('')

  useEffect(() => {
    if (!idPaciente) return
    getProntuario(idPaciente).then(setProntuario).catch(() => {})
  }, [idPaciente])

  async function handleFinalizar() {
    if (!prontuario) return
    setErro('')
    setCarregando(true)
    try {
      await atualizarProntuario(prontuario.id, { queixaPrincipal, diagnostico, observacoes })
      if (idFila) await encerrarAtendimento(idFila)
      setFinalizado(true)
    } catch (err) {
      setErro(err.message ?? 'Erro ao finalizar atendimento')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Atendimento
        </h1>

        {erro && (
          <p role="alert" style={{ color: '#DC2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        {finalizado && (
          <p style={{ color: '#15803D', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Atendimento finalizado com sucesso.
          </p>
        )}

        {/* Dados do paciente */}
        <section style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-3)' }}>
            Dados do Paciente
          </h2>

          <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: '#1E293B', margin: '0 0 var(--space-1)' }}>
            {paciente?.nome ?? '—'}
          </p>
          <p data-testid="paciente-idade" style={{ fontSize: 'var(--text-sm)', color: '#64748B', margin: '0 0 var(--space-3)' }}>
            {idade !== null ? `${idade} anos` : '—'}
          </p>

          {prontuario && (
            <>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#334155', margin: '0 0 var(--space-1)' }}>
                Histórico clínico
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: '#475569', margin: '0 0 var(--space-3)' }}>
                {prontuario.historicoClinco}
              </p>

              {prontuario.alergias?.length > 0 && (
                <>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#334155', margin: '0 0 var(--space-1)' }}>
                    Alergias
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                    {prontuario.alergias.map((a, i) => (
                      <span key={i} style={{ background: '#FEE2E2', border: '0.5px solid #FECACA', borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: 'var(--text-xs)', color: '#B91C1C' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>

        {/* Formulário de atendimento */}
        <section style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-4)' }}>
            Registro Clínico
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label htmlFor="queixa-principal" style={labelStyle}>Queixa principal</label>
              <textarea
                id="queixa-principal"
                value={queixaPrincipal}
                onChange={e => setQueixaPrincipal(e.target.value)}
                rows={3}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="diagnostico" style={labelStyle}>Diagnóstico</label>
              <textarea
                id="diagnostico"
                value={diagnostico}
                onChange={e => setDiagnostico(e.target.value)}
                rows={3}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="observacoes" style={labelStyle}>Observações</label>
              <textarea
                id="observacoes"
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                rows={3}
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155' }}
          >
            Solicitar Exame
          </button>
          <button
            type="button"
            style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155' }}
          >
            Emitir Prescrição
          </button>
          <button
            type="button"
            onClick={handleFinalizar}
            disabled={carregando || finalizado}
            style={{ ...btnBase, background: '#1E293B', color: '#FFFFFF' }}
          >
            {carregando ? 'Salvando…' : 'Finalizar Atendimento'}
          </button>
        </div>
      </main>
    </div>
  )
}
