import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAuditoria, getTiposAcao } from '../../mocks/api/auditoria'

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

function truncar(val, max = 28) {
  if (!val) return '—'
  return val.length > max ? val.slice(0, max) + '…' : val
}

// ─── Estilos de tabela ────────────────────────────────────────────────────────

const thStyle = {
  background: 'var(--color-bg-page)',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-bold)',
  padding: 'var(--space-2) var(--space-3)',
  textAlign: 'left',
  borderBottom: '0.5px solid var(--color-border)',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  padding: 'var(--space-2) var(--space-3)',
  borderBottom: '0.5px solid var(--color-bg-surface)',
  maxWidth: 180,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-1)',
}

const inputStyle = {
  background: 'var(--color-bg-white)',
  border: '0.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-heading)',
  width: '100%',
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Auditoria() {
  const { usuario }    = useAuth()
  const [registros, setRegistros]       = useState([])
  const [tiposAcao, setTiposAcao]       = useState([])
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroAcao, setFiltroAcao]     = useState('')
  const [dataInicio, setDataInicio]     = useState('')
  const [dataFim, setDataFim]           = useState('')

  const isAdmin = usuario?.perfil === 'ADMINISTRADOR'

  useEffect(() => {
    if (!isAdmin) return
    getAuditoria().then(setRegistros)
    getTiposAcao().then(setTiposAcao)
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div
        role="alert"
        style={{
          padding: 'var(--space-12)',
          textAlign: 'center',
          background: 'var(--color-bg-page)',
          minHeight: '100vh',
        }}
      >
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>
          Acesso não autorizado. Esta área é exclusiva para administradores.
        </p>
      </div>
    )
  }

  const registrosFiltrados = registros.filter(r => {
    if (filtroUsuario && !r.usuario.toLowerCase().includes(filtroUsuario.toLowerCase())) return false
    if (filtroAcao && r.acao !== filtroAcao) return false
    if (dataInicio && r.dataHora < dataInicio) return false
    if (dataFim    && r.dataHora > dataFim + 'T23:59:59') return false
    return true
  })

  return (
    <div style={{ padding: 'var(--space-8)', background: 'var(--color-bg-page)', minHeight: '100vh' }}>

      <h1 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--color-text-heading)',
        marginBottom: 'var(--space-6)',
      }}>
        Auditoria
      </h1>

      {/* Filtros */}
      <div
        style={{
          background: 'var(--color-bg-white)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-6)',
          marginBottom: 'var(--space-6)',
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Busca por usuário */}
        <div>
          <label style={labelStyle} htmlFor="filtro-usuario">
            Usuário
          </label>
          <input
            id="filtro-usuario"
            type="text"
            placeholder="Buscar usuário..."
            value={filtroUsuario}
            onChange={e => setFiltroUsuario(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Tipo de ação */}
        <div>
          <label style={labelStyle} htmlFor="filtro-acao">
            Tipo de ação
          </label>
          <select
            id="filtro-acao"
            value={filtroAcao}
            onChange={e => setFiltroAcao(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Todas</option>
            {tiposAcao.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Data início */}
        <div>
          <label style={labelStyle} htmlFor="data-inicio">
            Data início
          </label>
          <input
            id="data-inicio"
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Data fim */}
        <div>
          <label style={labelStyle} htmlFor="data-fim">
            Data fim
          </label>
          <input
            id="data-fim"
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Tabela */}
      <div
        className="overflow-x-auto rounded-lg"
        style={{ border: '0.5px solid var(--color-border)' }}
      >
        <table
          role="table"
          style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg-white)' }}
        >
          <thead>
            <tr>
              <th scope="col" style={thStyle}>Usuário</th>
              <th scope="col" style={thStyle}>Ação</th>
              <th scope="col" style={thStyle}>Entidade</th>
              <th scope="col" style={thStyle} className="hidden md:table-cell">Valor anterior</th>
              <th scope="col" style={thStyle} className="hidden md:table-cell">Valor novo</th>
              <th scope="col" style={thStyle}>Data</th>
              <th scope="col" style={thStyle}>IP</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((r, idx) => (
              <tr
                key={r.id}
                style={idx === registrosFiltrados.length - 1
                  ? { ...tdStyle, borderBottom: 'none' }
                  : {}
                }
              >
                <td style={tdStyle}>{r.usuario}</td>
                <td style={tdStyle}>{r.acao}</td>
                <td style={tdStyle}>{r.entidade}</td>
                <td style={tdStyle} className="hidden md:table-cell">{truncar(r.valorAnterior)}</td>
                <td style={tdStyle} className="hidden md:table-cell">{truncar(r.valorNovo)}</td>
                <td style={tdStyle}>{fmt(r.dataHora)}</td>
                <td style={tdStyle}>{r.ip}</td>
              </tr>
            ))}
            {registrosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    ...tdStyle,
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    padding: 'var(--space-8)',
                  }}
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
