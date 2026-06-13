import { useState } from 'react'
import {
  LayoutDashboard, ClipboardList, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { salvarTriagem } from '../../mocks/api/triagens'
import { pacientes } from '../../mocks/data/pacientes'
import Sidebar from '../../components/ui/Sidebar'
import PulseiraBadge from '../../components/ui/PulseiraBadge'
import SenhaDisplay from '../../components/ui/SenhaDisplay'

const LINKS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/enfermeiro' },
  { label: 'Triagem',   icon: ClipboardList,   path: '/enfermeiro/triagem' },
  { label: 'Notificações', icon: Bell,          path: '/enfermeiro/notificacoes' },
  { label: 'Perfil',    icon: User,             path: '/enfermeiro/perfil' },
]

// Cores imutáveis — Protocolo Manchester
const NIVEIS = [
  { nivel: 1, nome: 'Emergência',    cor: '#DC2626', tempo: 0   },
  { nivel: 2, nome: 'Muito urgente', cor: '#EA580C', tempo: 10  },
  { nivel: 3, nome: 'Urgente',       cor: '#CA8A04', tempo: 30  },
  { nivel: 4, nome: 'Pouco urgente', cor: '#16A34A', tempo: 120 },
  { nivel: 5, nome: 'Não urgente',   cor: '#475569', tempo: 240 },
]

const secaoStyle = {
  background: '#FFFFFF',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4) var(--space-6)',
  marginBottom: 'var(--space-4)',
}

const secaoTituloStyle = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-bold)',
  color: '#1E293B',
  margin: '0 0 var(--space-3)',
}

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
  boxSizing: 'border-box',
}

const textareaStyle = {
  ...inputStyle,
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

export default function Triagem() {
  const { usuario, logout } = useAuth()

  // Seção 1 — busca
  const [busca, setBusca] = useState('')

  // Seção 2 — queixa/sintomas
  const [queixaPrincipal, setQueixaPrincipal] = useState('')
  const [sintomas,        setSintomas]        = useState('')

  // Seção 3 — sinais vitais
  const [temperatura,        setTemperatura]        = useState('')
  const [pressaoArterial,    setPressaoArterial]    = useState('')
  const [frequenciaCardiaca, setFrequenciaCardiaca] = useState('')
  const [saturacaoO2,        setSaturacaoO2]        = useState('')
  const [nivelDor,           setNivelDor]           = useState(0)

  // Seção 4 — classificação
  const [nivelRisco, setNivelRisco] = useState(null)

  // Submit
  const [carregando,   setCarregando]   = useState(false)
  const [confirmacao,  setConfirmacao]  = useState(null)
  const [erro,         setErro]         = useState('')

  // ── Busca ───────────────────────────────────────────────────
  const resultados = busca.trim().length > 0
    ? pacientes.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.cpf.includes(busca)
      )
    : []

  // Auto-seleciona quando há exatamente 1 resultado
  const pacienteSelecionado = resultados.length === 1 ? resultados[0] : null

  const nivelSelecionado = nivelRisco != null
    ? NIVEIS.find(n => n.nivel === nivelRisco)
    : null

  // ── Submit ──────────────────────────────────────────────────
  async function handleSalvar() {
    setErro('')

    if (!pacienteSelecionado) {
      setErro('Selecione um paciente antes de salvar.')
      return
    }
    if (!queixaPrincipal.trim()) {
      setErro('Queixa principal é obrigatória.')
      return
    }
    if (nivelRisco == null) {
      setErro('Selecione o nível de risco.')
      return
    }

    setCarregando(true)
    try {
      const resultado = await salvarTriagem({
        idPaciente:        pacienteSelecionado.id,
        idEnfermeiro:      usuario.id,
        perfil:            usuario.perfil,
        queixaPrincipal,
        sintomasApresentados: sintomas,
        temperatura:       temperatura || null,
        pressaoArterial:   pressaoArterial || null,
        frequenciaCardiaca: frequenciaCardiaca || null,
        saturacaoOxigenio: saturacaoO2 || null,
        nivelDor:          Number(nivelDor),
        nivelRisco,
      })
      setConfirmacao(resultado)
    } catch (err) {
      setErro(err.message ?? 'Erro ao salvar triagem')
    } finally {
      setCarregando(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Triagem
        </h1>

        {erro && (
          <p role="alert" style={{ color: '#DC2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        {confirmacao && (
          <div style={{ background: '#DCFCE7', border: '0.5px solid #BBF7D0', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-6)', marginBottom: 'var(--space-4)' }}>
            <p style={{ color: '#15803D', fontWeight: 'var(--font-bold)', margin: '0 0 var(--space-2)' }}>
              Triagem salva com sucesso!
            </p>
            <p style={{ color: '#166534', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-2)' }}>
              Paciente inserido na fila de Emergência:
            </p>
            <SenhaDisplay senha={confirmacao.senhaGerada} />
          </div>
        )}

        {/* ── Seção 1: Busca ───────────────────────────────── */}
        <div style={secaoStyle}>
          <p style={secaoTituloStyle}>1. Busca do paciente</p>
          <input
            type="text"
            placeholder="CPF ou nome"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={inputStyle}
          />

          {busca.trim().length > 0 && resultados.length === 0 && (
            <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
              Paciente não encontrado.
            </p>
          )}

          {resultados.length > 0 && (
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {resultados.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: pacienteSelecionado?.id === p.id ? '#F0FDF4' : '#F8FAFC',
                    border: pacienteSelecionado?.id === p.id ? '0.5px solid #86EFAC' : '0.5px solid #E2E8F0',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-2) var(--space-3)',
                  }}
                >
                  <p style={{ fontWeight: 'var(--font-medium)', color: '#1E293B', margin: '0 0 2px' }}>
                    {p.nome}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', margin: 0 }}>
                    CPF: {p.cpf} · {calcularIdade(p.dataNascimento)} anos
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Seção 2: Queixa e sintomas ───────────────────── */}
        <div style={secaoStyle}>
          <p style={secaoTituloStyle}>2. Queixa e sintomas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <label htmlFor="queixa-principal" style={labelStyle}>Queixa principal *</label>
              <textarea
                id="queixa-principal"
                value={queixaPrincipal}
                onChange={e => setQueixaPrincipal(e.target.value)}
                rows={3}
                style={textareaStyle}
              />
            </div>
            <div>
              <label htmlFor="sintomas" style={labelStyle}>Sintomas apresentados</label>
              <textarea
                id="sintomas"
                value={sintomas}
                onChange={e => setSintomas(e.target.value)}
                rows={3}
                style={textareaStyle}
              />
            </div>
          </div>
        </div>

        {/* ── Seção 3: Sinais vitais ───────────────────────── */}
        <div style={secaoStyle}>
          <p style={secaoTituloStyle}>3. Sinais vitais</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 'var(--space-4)' }}>
            <div>
              <label htmlFor="temperatura" style={labelStyle}>Temperatura (°C)</label>
              <input
                id="temperatura"
                type="text"
                inputMode="decimal"
                value={temperatura}
                onChange={e => setTemperatura(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="pressao-arterial" style={labelStyle}>Pressão arterial (mmHg)</label>
              <input
                id="pressao-arterial"
                type="text"
                value={pressaoArterial}
                onChange={e => setPressaoArterial(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="frequencia-cardiaca" style={labelStyle}>Frequência cardíaca (bpm)</label>
              <input
                id="frequencia-cardiaca"
                type="text"
                inputMode="numeric"
                value={frequenciaCardiaca}
                onChange={e => setFrequenciaCardiaca(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="saturacao-o2" style={labelStyle}>Saturação O₂ (%)</label>
              <input
                id="saturacao-o2"
                type="text"
                inputMode="numeric"
                value={saturacaoO2}
                onChange={e => setSaturacaoO2(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label htmlFor="nivel-dor" style={labelStyle}>
              Nível de dor —{' '}
              <span data-testid="dor-valor" style={{ fontWeight: 'var(--font-bold)', color: '#1E293B' }}>
                {nivelDor}
              </span>
              /10
            </label>
            <input
              id="nivel-dor"
              type="range"
              min={0}
              max={10}
              step={1}
              value={nivelDor}
              onChange={e => setNivelDor(Number(e.target.value))}
              aria-label="Nível de dor"
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* ── Seção 4: Classificação Manchester ───────────── */}
        <div style={secaoStyle}>
          <p style={secaoTituloStyle}>4. Classificação de risco</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {NIVEIS.map(n => (
              <button
                key={n.nivel}
                type="button"
                aria-label={n.nome}
                onClick={() => setNivelRisco(n.nivel)}
                style={{
                  ...btnBase,
                  background: nivelRisco === n.nivel ? '#F8FAFC' : '#FFFFFF',
                  border: nivelRisco === n.nivel ? `1.5px solid ${n.cor}` : '0.5px solid #E2E8F0',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: n.cor,
                    flexShrink: 0,
                  }}
                />
                {n.nome}
              </button>
            ))}
          </div>

          {nivelSelecionado && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <PulseiraBadge nivel={nivelSelecionado.nivel} />
              <span style={{ fontSize: 'var(--text-sm)', color: '#64748B' }}>
                Tempo máximo:{' '}
                <strong data-testid="tempo-maximo" style={{ color: '#1E293B' }}>
                  {nivelSelecionado.tempo === 0 ? 'Imediato (0 min)' : `${nivelSelecionado.tempo} min`}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* ── Botão de submit ──────────────────────────────── */}
        <button
          type="button"
          onClick={handleSalvar}
          disabled={carregando || !!confirmacao}
          style={{ ...btnBase, background: '#1E293B', color: '#FFFFFF' }}
        >
          {carregando ? 'Salvando…' : 'Salvar triagem e inserir na fila EM'}
        </button>
      </main>
    </div>
  )
}
