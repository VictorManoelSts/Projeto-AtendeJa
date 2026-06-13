import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Stethoscope, BarChart2, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { listarMedicos, cadastrarMedico, vincularUnidade, alterarStatusMedico } from '../../mocks/api/admin'
import Sidebar from '../../components/ui/Sidebar'
import StatusBadge from '../../components/ui/StatusBadge'

const LINKS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Usuários',  icon: Users,           path: '/admin/usuarios' },
  { label: 'Médicos',   icon: Stethoscope,     path: '/admin/medicos' },
  { label: 'Relatórios',icon: BarChart2,       path: '/admin/relatorios' },
  { label: 'Perfil',    icon: User,            path: '/admin/perfil' },
]

const STATUS_OPCOES = ['ATIVO', 'PLANTAO', 'FERIAS', 'LICENCA', 'INATIVO']

const inputStyle = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  color: '#1E293B',
  background: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  color: '#334155',
  marginBottom: 'var(--space-1)',
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
}

const tdStyle = {
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-sm)',
  color: '#1E293B',
  verticalAlign: 'middle',
}

export default function Medicos() {
  const { usuario, logout } = useAuth()

  const [lista,        setLista]        = useState([])
  const [mostraCriar,  setMostraCriar]  = useState(false)
  const [vincularId,   setVincularId]   = useState(null)
  const [unidadeInput, setUnidadeInput] = useState('')
  const [erro,         setErro]         = useState('')

  const [novoNome,  setNovoNome]  = useState('')
  const [novoCrm,   setNovoCrm]   = useState('')
  const [novaEspec, setNovaEspec] = useState('')

  useEffect(() => {
    listarMedicos().then(setLista)
  }, [])

  async function handleCadastrar(e) {
    e.preventDefault()
    setErro('')
    try {
      const novo = await cadastrarMedico({ nome: novoNome, crm: novoCrm, especialidade: novaEspec })
      setLista(prev => [...prev, novo])
      setMostraCriar(false)
      setNovoNome('')
      setNovoCrm('')
      setNovaEspec('')
    } catch (err) {
      setErro(err.message ?? 'Erro ao cadastrar médico')
    }
  }

  async function handleVincular(idMedico) {
    setErro('')
    try {
      await vincularUnidade(idMedico, unidadeInput)
      setVincularId(null)
      setUnidadeInput('')
    } catch (err) {
      setErro(err.message ?? 'Erro ao vincular unidade')
    }
  }

  async function handleAlterarStatus(idMedico, status) {
    setErro('')
    try {
      const atualizado = await alterarStatusMedico(idMedico, status)
      setLista(prev => prev.map(m => m.id === idMedico ? { ...m, status: atualizado.status } : m))
    } catch (err) {
      setErro(err.message ?? 'Erro ao alterar status')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', margin: 0 }}>
            Médicos
          </h1>
          <button
            type="button"
            onClick={() => setMostraCriar(prev => !prev)}
            style={{ ...btnBase, padding: 'var(--space-2) var(--space-4)', minHeight: '44px', background: '#1E293B', color: '#FFFFFF', fontSize: 'var(--text-sm)' }}
          >
            Cadastrar médico
          </button>
        </div>

        {erro && (
          <p role="alert" style={{ color: '#DC2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{erro}</p>
        )}

        {/* Formulário cadastrar */}
        {mostraCriar && (
          <form
            onSubmit={handleCadastrar}
            style={{
              background: '#FFFFFF',
              border: '0.5px solid #E2E8F0',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              maxWidth: '480px',
            }}
          >
            <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: '#1E293B', margin: 0 }}>
              Cadastrar médico
            </h2>

            <div>
              <label htmlFor="med-nome" style={labelStyle}>Nome</label>
              <input
                id="med-nome"
                type="text"
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label htmlFor="med-crm" style={labelStyle}>CRM</label>
              <input
                id="med-crm"
                type="text"
                value={novoCrm}
                onChange={e => setNovoCrm(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label htmlFor="med-espec" style={labelStyle}>Especialidade</label>
              <input
                id="med-espec"
                type="text"
                value={novaEspec}
                onChange={e => setNovaEspec(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="submit"
                style={{ ...btnBase, background: '#1E293B', color: '#FFFFFF', padding: 'var(--space-2) var(--space-4)' }}
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setMostraCriar(false)}
                style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155', padding: 'var(--space-2) var(--space-4)' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Tabela */}
        {lista.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Nenhum médico cadastrado.</p>
        ) : (
          <div className="overflow-x-auto" style={{ borderRadius: 'var(--radius-lg)', border: '0.5px solid #E2E8F0' }}>
            <table style={{ minWidth: '720px', width: '100%', borderCollapse: 'collapse', background: '#FFFFFF' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Nome', 'CRM', 'Especialidade', 'Status', 'Ações'].map(col => (
                    <th key={col} style={thStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((m, idx) => {
                  const ultimo    = idx === lista.length - 1
                  const vincular  = vincularId === m.id

                  return (
                    <tr
                      key={m.id}
                      style={{ borderBottom: ultimo ? 'none' : '0.5px solid #F1F5F9' }}
                    >
                      <td style={tdStyle}>{m.nome}</td>
                      <td style={{ ...tdStyle, fontSize: 'var(--text-xs)', color: '#475569' }}>{m.crm}</td>
                      <td style={{ ...tdStyle, fontSize: 'var(--text-xs)', color: '#475569' }}>{m.especialidade}</td>

                      <td style={tdStyle}>
                        <StatusBadge status={m.status} />
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Alterar status */}
                          <select
                            value={m.status}
                            onChange={e => handleAlterarStatus(m.id, e.target.value)}
                            style={{
                              ...inputStyle,
                              width: 'auto',
                              padding: '4px 8px',
                              fontSize: 'var(--text-xs)',
                              minHeight: '32px',
                            }}
                          >
                            {STATUS_OPCOES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          {/* Vincular unidade */}
                          {vincular ? (
                            <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                              <input
                                type="text"
                                placeholder="ID da unidade"
                                value={unidadeInput}
                                onChange={e => setUnidadeInput(e.target.value)}
                                style={{ ...inputStyle, width: '120px', padding: '4px 8px', fontSize: 'var(--text-xs)' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleVincular(m.id)}
                                style={{ ...btnBase, background: '#1E293B', color: '#FFFFFF' }}
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => { setVincularId(null); setUnidadeInput('') }}
                                style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155' }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setVincularId(m.id)}
                              style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155' }}
                            >
                              Vincular unidade
                            </button>
                          )}
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
