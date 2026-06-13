import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Stethoscope, BarChart2, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { listarUsuarios, criarUsuario, desativarUsuario, excluirUsuario } from '../../mocks/api/admin'
import Sidebar from '../../components/ui/Sidebar'

const LINKS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Usuários',  icon: Users,           path: '/admin/usuarios' },
  { label: 'Médicos',   icon: Stethoscope,     path: '/admin/medicos' },
  { label: 'Relatórios',icon: BarChart2,       path: '/admin/relatorios' },
  { label: 'Perfil',    icon: User,            path: '/admin/perfil' },
]

const PERFIS = ['PACIENTE', 'MEDICO', 'ENFERMEIRO', 'RECEPCIONISTA', 'ADMINISTRADOR']

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

export default function Usuarios() {
  const { usuario, logout } = useAuth()

  const [lista,        setLista]        = useState([])
  const [filtroPerfil, setFiltroPerfil] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [mostraCriar,  setMostraCriar]  = useState(false)
  const [erro,         setErro]         = useState('')

  const [novoNome,   setNovoNome]   = useState('')
  const [novoEmail,  setNovoEmail]  = useState('')
  const [novoPerfil, setNovoPerfil] = useState('PACIENTE')

  useEffect(() => {
    listarUsuarios().then(setLista)
  }, [])

  const listado = lista.filter(u => {
    const perfilOk  = filtroPerfil === 'TODOS' || u.perfil  === filtroPerfil
    const statusOk  = filtroStatus === 'TODOS' || u.status  === filtroStatus
    return perfilOk && statusOk
  })

  async function handleCriar(e) {
    e.preventDefault()
    setErro('')
    try {
      const novo = await criarUsuario({ nome: novoNome, email: novoEmail, perfil: novoPerfil })
      setLista(prev => [...prev, novo])
      setMostraCriar(false)
      setNovoNome('')
      setNovoEmail('')
      setNovoPerfil('PACIENTE')
    } catch (err) {
      setErro(err.message ?? 'Erro ao criar usuário')
    }
  }

  async function handleDesativar(id) {
    setErro('')
    try {
      const atualizado = await desativarUsuario(id)
      setLista(prev => prev.map(u => u.id === id ? { ...u, status: atualizado.status } : u))
    } catch (err) {
      setErro(err.message ?? 'Erro ao desativar usuário')
    }
  }

  async function handleExcluir(id) {
    setErro('')
    try {
      await excluirUsuario(id)
      setLista(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      setErro(err.message ?? 'Erro ao excluir usuário')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', margin: 0 }}>
            Usuários
          </h1>
          <button
            type="button"
            onClick={() => setMostraCriar(prev => !prev)}
            style={{ ...btnBase, padding: 'var(--space-2) var(--space-4)', minHeight: '44px', background: '#1E293B', color: '#FFFFFF', fontSize: 'var(--text-sm)' }}
          >
            Criar usuário
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          {['TODOS', ...PERFIS].map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setFiltroPerfil(p)}
              style={{
                ...btnBase,
                background: filtroPerfil === p ? '#1E293B' : '#FFFFFF',
                color: filtroPerfil === p ? '#FFFFFF' : '#475569',
                border: '0.5px solid #E2E8F0',
              }}
            >
              {p === 'TODOS' ? 'Todos' : p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
          <div style={{ width: '1px', background: '#E2E8F0', margin: '0 var(--space-1)' }} />
          {['TODOS', 'ATIVO', 'INATIVO'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setFiltroStatus(s)}
              style={{
                ...btnBase,
                background: filtroStatus === s ? '#1E293B' : '#FFFFFF',
                color: filtroStatus === s ? '#FFFFFF' : '#475569',
                border: '0.5px solid #E2E8F0',
              }}
            >
              {s === 'TODOS' ? 'Todos' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Formulário criar usuário */}
        {mostraCriar && (
          <form
            onSubmit={handleCriar}
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
              Novo usuário
            </h2>

            <div>
              <label htmlFor="novo-nome" style={labelStyle}>Nome</label>
              <input
                id="novo-nome"
                type="text"
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label htmlFor="novo-email" style={labelStyle}>E-mail</label>
              <input
                id="novo-email"
                type="email"
                value={novoEmail}
                onChange={e => setNovoEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label htmlFor="novo-perfil" style={labelStyle}>Perfil</label>
              <select
                id="novo-perfil"
                value={novoPerfil}
                onChange={e => setNovoPerfil(e.target.value)}
                style={inputStyle}
              >
                {PERFIS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {erro && (
              <p role="alert" style={{ color: '#DC2626', fontSize: 'var(--text-xs)' }}>{erro}</p>
            )}

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
        {listado.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Nenhum usuário encontrado.</p>
        ) : (
          <div className="overflow-x-auto" style={{ borderRadius: 'var(--radius-lg)', border: '0.5px solid #E2E8F0' }}>
            <table style={{ minWidth: '640px', width: '100%', borderCollapse: 'collapse', background: '#FFFFFF' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Nome', 'E-mail', 'Perfil', 'Status', 'Ações'].map(col => (
                    <th key={col} style={thStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listado.map((u, idx) => {
                  const ultimo = idx === listado.length - 1
                  return (
                    <tr
                      key={u.id}
                      style={{ borderBottom: ultimo ? 'none' : '0.5px solid #F1F5F9' }}
                    >
                      <td style={tdStyle}>{u.nome}</td>
                      <td style={{ ...tdStyle, color: '#475569', fontSize: 'var(--text-xs)' }}>{u.email}</td>
                      <td style={{ ...tdStyle, fontSize: 'var(--text-xs)', color: '#475569' }}>{u.perfil}</td>
                      <td style={tdStyle}>
                        <span style={{
                          borderRadius: 'var(--radius-full)',
                          padding: '2px 8px',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-medium)',
                          background: u.status === 'ATIVO' ? '#DCFCE7' : '#F1F5F9',
                          color: u.status === 'ATIVO' ? '#15803D' : '#475569',
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleDesativar(u.id)}
                            style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #E2E8F0', color: '#334155' }}
                          >
                            Desativar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExcluir(u.id)}
                            style={{ ...btnBase, background: '#FFFFFF', border: '0.5px solid #FECACA', color: '#DC2626' }}
                          >
                            Excluir
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
