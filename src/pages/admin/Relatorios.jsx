import { useState, useEffect } from 'react'
import {
  getAtendimentos,
  getDadosFila,
  getFaltas,
  getProdutividadeMedica,
} from '../../mocks/api/relatorios'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const dd   = String(d.getDate()).padStart(2, '0')
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh   = String(d.getHours()).padStart(2, '0')
  const min  = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

// ─── Componentes base ─────────────────────────────────────────────────────────

function MetricCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--color-bg-white)',
      border: '0.5px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-2) var(--space-3)',
      minWidth: 120,
    }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-1)' }}>
        {label}
      </p>
      <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-heading)' }}>
        {value}
      </p>
    </div>
  )
}

const thStyle = {
  background: 'var(--color-bg-page)',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-bold)',
  padding: 'var(--space-2) var(--space-3)',
  textAlign: 'left',
  borderBottom: '0.5px solid var(--color-border)',
}

const tdStyle = {
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  padding: 'var(--space-2) var(--space-3)',
  borderBottom: '0.5px solid var(--color-bg-surface)',
}

// ─── Painéis de cada aba ──────────────────────────────────────────────────────

function AbaAtendimentos({ dados }) {
  const total        = dados.length
  const concluidos   = dados.filter(c => c.status === 'CONCLUIDO').length
  const emAtendimento = dados.filter(c => c.status === 'EM_ATENDIMENTO').length

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <MetricCard label="Total" value={total} />
        <MetricCard label="Concluídos" value={concluidos} />
        <MetricCard label="Em atendimento" value={emAtendimento} />
      </div>

      <div className="overflow-x-auto rounded-lg" style={{ border: '0.5px solid var(--color-border)' }}>
        <table role="table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg-white)' }}>
          <thead>
            <tr>
              <th scope="col" style={thStyle}>Paciente</th>
              <th scope="col" style={thStyle}>Médico</th>
              <th scope="col" style={thStyle}>Tipo</th>
              <th scope="col" style={thStyle}>Status</th>
              <th scope="col" style={thStyle}>Data</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(c => (
              <tr key={c.id}>
                <td style={tdStyle}>{c.nomePaciente}</td>
                <td style={tdStyle}>{c.nomeMedico}</td>
                <td style={tdStyle}>{c.tipoConsulta}</td>
                <td style={tdStyle}>{c.status}</td>
                <td style={tdStyle}>{fmt(c.dataHora)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AbaFilas({ dados }) {
  const aguardando    = dados.filter(f => f.status === 'AGUARDANDO').length
  const chamado       = dados.filter(f => f.status === 'CHAMADO').length
  const emAtendimento = dados.filter(f => f.status === 'EM_ATENDIMENTO').length

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <MetricCard label="Total" value={dados.length} />
        <MetricCard label="Aguardando" value={aguardando} />
        <MetricCard label="Chamado" value={chamado} />
        <MetricCard label="Em atendimento" value={emAtendimento} />
      </div>

      <div className="overflow-x-auto rounded-lg" style={{ border: '0.5px solid var(--color-border)' }}>
        <table role="table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg-white)' }}>
          <thead>
            <tr>
              <th scope="col" style={thStyle}>Senha</th>
              <th scope="col" style={thStyle}>Tipo</th>
              <th scope="col" style={thStyle}>Prioridade</th>
              <th scope="col" style={thStyle}>Status</th>
              <th scope="col" style={thStyle}>Entrada</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(f => (
              <tr key={f.id}>
                <td style={tdStyle}>{f.senha}</td>
                <td style={tdStyle}>{f.tipoFila}</td>
                <td style={tdStyle}>{f.prioridade}</td>
                <td style={tdStyle}>{f.status}</td>
                <td style={tdStyle}>{fmt(f.horarioEntrada)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AbaFaltas({ dados }) {
  const ausentes   = dados.filter(f => f.status === 'AUSENTE').length
  const cancelados = dados.filter(f => f.status === 'CANCELADO').length

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <MetricCard label="Total" value={dados.length} />
        <MetricCard label="Ausentes" value={ausentes} />
        <MetricCard label="Cancelados" value={cancelados} />
      </div>

      <div className="overflow-x-auto rounded-lg" style={{ border: '0.5px solid var(--color-border)' }}>
        <table role="table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg-white)' }}>
          <thead>
            <tr>
              <th scope="col" style={thStyle}>Senha</th>
              <th scope="col" style={thStyle}>Tipo</th>
              <th scope="col" style={thStyle}>Prioridade</th>
              <th scope="col" style={thStyle}>Status</th>
              <th scope="col" style={thStyle}>Entrada</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(f => (
              <tr key={f.id}>
                <td style={tdStyle}>{f.senha}</td>
                <td style={tdStyle}>{f.tipoFila}</td>
                <td style={tdStyle}>{f.prioridade}</td>
                <td style={tdStyle}>{f.status}</td>
                <td style={tdStyle}>{fmt(f.horarioEntrada)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AbaProdutividade({ dados }) {
  const totalAtendimentos = dados.reduce((s, m) => s + m.totalAtendimentos, 0)
  const totalConcluidos   = dados.reduce((s, m) => s + m.concluidos, 0)

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <MetricCard label="Total de médicos" value={dados.length} />
        <MetricCard label="Total atendimentos" value={totalAtendimentos} />
        <MetricCard label="Concluídos" value={totalConcluidos} />
      </div>

      <div className="overflow-x-auto rounded-lg" style={{ border: '0.5px solid var(--color-border)' }}>
        <table role="table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg-white)' }}>
          <thead>
            <tr>
              <th scope="col" style={thStyle}>Médico</th>
              <th scope="col" style={thStyle}>Especialidade</th>
              <th scope="col" style={thStyle}>Atendimentos</th>
              <th scope="col" style={thStyle}>Concluídos</th>
              <th scope="col" style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(m => (
              <tr key={m.id}>
                <td style={tdStyle}>{m.nome}</td>
                <td style={tdStyle}>{m.especialidade}</td>
                <td style={tdStyle}>{m.totalAtendimentos}</td>
                <td style={tdStyle}>{m.concluidos}</td>
                <td style={tdStyle}>{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

const ABAS = ['Atendimentos', 'Filas', 'Faltas', 'Produtividade médica']

export default function Relatorios() {
  const [abaAtiva, setAbaAtiva]       = useState(0)
  const [atendimentos, setAtendimentos] = useState([])
  const [dadosFila, setDadosFila]     = useState([])
  const [faltas, setFaltas]           = useState([])
  const [produtividade, setProdutividade] = useState([])

  useEffect(() => {
    getAtendimentos().then(setAtendimentos)
    getDadosFila().then(setDadosFila)
    getFaltas().then(setFaltas)
    getProdutividadeMedica().then(setProdutividade)
  }, [])

  return (
    <div style={{ padding: 'var(--space-8)', background: 'var(--color-bg-page)', minHeight: '100vh' }}>
      <h1 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--color-text-heading)',
        marginBottom: 'var(--space-6)',
      }}>
        Relatórios
      </h1>

      {/* Abas */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          borderBottom: '0.5px solid var(--color-border)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {ABAS.map((aba, i) => (
          <button
            key={aba}
            role="tab"
            id={`tab-${i}`}
            aria-selected={abaAtiva === i}
            aria-controls={`panel-${i}`}
            onClick={() => setAbaAtiva(i)}
            style={{
              paddingTop: 'var(--space-2)',
              paddingBottom: 'var(--space-2)',
              paddingLeft: 'var(--space-4)',
              paddingRight: 'var(--space-4)',
              fontSize: 'var(--text-sm)',
              fontWeight: abaAtiva === i ? 'var(--font-bold)' : 'var(--font-normal)',
              color: abaAtiva === i ? 'var(--color-text-heading)' : 'var(--color-text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: abaAtiva === i
                ? '2px solid var(--color-primary)'
                : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {aba}
          </button>
        ))}
      </div>

      {/* Painéis */}
      <div role="tabpanel" id={`panel-${abaAtiva}`} aria-labelledby={`tab-${abaAtiva}`}>
        {abaAtiva === 0 && <AbaAtendimentos dados={atendimentos} />}
        {abaAtiva === 1 && <AbaFilas dados={dadosFila} />}
        {abaAtiva === 2 && <AbaFaltas dados={faltas} />}
        {abaAtiva === 3 && <AbaProdutividade dados={produtividade} />}
      </div>
    </div>
  )
}
