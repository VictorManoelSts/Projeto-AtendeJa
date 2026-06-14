import { useState, useEffect } from 'react'
import { LayoutDashboard, ClipboardList, Calendar, Bell, User, UserCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { listar, reagendar } from '../../mocks/api/consultas'
import { pacientes } from '../../mocks/data/pacientes'
import Sidebar from '../../components/ui/Sidebar'

const LINKS = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/recepcao' },
  { label: 'Check-in',      icon: UserCheck,       path: '/recepcao/checkin' },
  { label: 'Filas',         icon: ClipboardList,   path: '/recepcao/filas' },
  { label: 'Reagendamento', icon: Calendar,        path: '/recepcao/reagendamento' },
  { label: 'Notificações',  icon: Bell,            path: '/recepcao/notificacoes' },
  { label: 'Perfil',        icon: User,            path: '/recepcao/perfil' },
]

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

function formatarDataHora(dataHora) {
  return new Date(dataHora).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Reagendamento() {
  const { usuario, logout } = useAuth()

  const [busca,              setBusca]              = useState('')
  const [pacEncontrado,      setPacEncontrado]      = useState(null)
  const [consultas,          setConsultas]          = useState([])
  const [consultaSelecionada,setConsultaSelecionada]= useState(null)
  const [novaData,           setNovaData]           = useState('')
  const [motivo,             setMotivo]             = useState('')
  const [carregando,         setCarregando]         = useState(false)
  const [erro,               setErro]               = useState('')
  const [registro,           setRegistro]           = useState(null)

  const matches = busca.trim()
    ? pacientes.filter(p => {
        const q = busca.toLowerCase()
        return p.nome.toLowerCase().includes(q) || p.cpf.includes(q)
      })
    : []

  useEffect(() => {
    setPacEncontrado(null)
    setConsultas([])
    setConsultaSelecionada(null)
    setErro('')
    setRegistro(null)

    if (!busca.trim()) return

    const encontrados = pacientes.filter(p => {
      const q = busca.toLowerCase()
      return p.nome.toLowerCase().includes(q) || p.cpf.includes(q)
    })

    if (encontrados.length !== 1) return

    const pac = encontrados[0]
    setPacEncontrado(pac)
    listar(pac.id).then(lista => {
      setConsultas(lista)
      if (lista.length === 1) {
        setConsultaSelecionada(lista[0])
      }
    })
  }, [busca])

  async function handleReagendar() {
    if (!consultaSelecionada) return
    setErro('')
    setRegistro(null)
    setCarregando(true)
    try {
      const antes  = { ...consultaSelecionada }
      const depois = await reagendar(consultaSelecionada.id, novaData, motivo)
      setRegistro({ antes, depois })
    } catch (err) {
      setErro(err.message ?? 'Erro ao reagendar')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Reagendamento
        </h1>

        {/* Dois painéis em lg+: busca/paciente à esquerda, formulário à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Painel esquerdo — busca e lista de consultas */}
          <div>
            <input
              type="text"
              placeholder="CPF ou nome do paciente"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
            />

            {busca.trim().length > 0 && matches.length === 0 && (
              <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>
                Nenhum resultado encontrado.
              </p>
            )}

            {pacEncontrado && (
              <div style={{
                background: '#FFFFFF',
                border: '0.5px solid #E2E8F0',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
              }}>
                <p style={{ fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-1)' }}>
                  {pacEncontrado.nome}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', marginBottom: 'var(--space-3)' }}>
                  CPF: {pacEncontrado.cpf}
                </p>

                {consultas.length === 0 ? (
                  <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8' }}>
                    Nenhuma consulta encontrada.
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {consultas.map(c => (
                      <li
                        key={c.id}
                        onClick={() => setConsultaSelecionada(c)}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          background: consultaSelecionada?.id === c.id ? '#F1F5F9' : 'transparent',
                          border: '0.5px solid',
                          borderColor: consultaSelecionada?.id === c.id ? '#94A3B8' : '#E2E8F0',
                          marginBottom: 'var(--space-1)',
                        }}
                      >
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#1E293B' }}>
                          {c.tipoConsulta}
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: '#64748B', marginLeft: 'var(--space-2)' }}>
                          {new Date(c.dataHora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', marginLeft: 'var(--space-2)' }}>
                          {c.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Painel direito — formulário de reagendamento e registro */}
          {pacEncontrado && (
            <div>
              <div style={{
                background: '#FFFFFF',
                border: '0.5px solid #E2E8F0',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}>
                <div>
                  <label htmlFor="nova-data" style={labelStyle}>Novo horário</label>
                  <input
                    id="nova-data"
                    type="datetime-local"
                    value={novaData}
                    onChange={e => setNovaData(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="motivo" style={labelStyle}>Motivo</label>
                  <textarea
                    id="motivo"
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={handleReagendar}
                    disabled={carregando || !consultaSelecionada}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: '#1E293B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      cursor: 'pointer',
                    }}
                  >
                    Reagendar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBusca('')
                      setNovaData('')
                      setMotivo('')
                    }}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: '#FFFFFF',
                      color: '#334155',
                      border: '0.5px solid #E2E8F0',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              {erro && (
                <p
                  role="alert"
                  style={{ color: '#DC2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}
                >
                  {erro}
                </p>
              )}

              {registro && (
                <div style={{
                  background: '#FFFFFF',
                  border: '0.5px solid #E2E8F0',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}>
                  <p style={{ fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                    Registro de alteração
                  </p>
                  <div
                    data-testid="registro-before"
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: '#FEE2E2',
                      marginBottom: 'var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      color: '#B91C1C',
                    }}
                  >
                    <strong>Antes:</strong> {formatarDataHora(registro.antes.dataHora)}
                  </div>
                  <div
                    data-testid="registro-after"
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: '#DCFCE7',
                      fontSize: 'var(--text-xs)',
                      color: '#15803D',
                    }}
                  >
                    <strong>Depois:</strong> {formatarDataHora(registro.depois.dataHora)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
