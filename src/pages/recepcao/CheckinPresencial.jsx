import { useState, useEffect } from 'react'
import { LayoutDashboard, ClipboardList, Calendar, Bell, User, UserCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { listar, confirmarCheckin } from '../../mocks/api/consultas'
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

function formatarHora(dataHora) {
  return new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function CheckinPresencial() {
  const { usuario, logout } = useAuth()

  const [busca,           setBusca]           = useState('')
  const [pacEncontrado,   setPacEncontrado]   = useState(null)
  const [consulta,        setConsulta]        = useState(null)
  const [carregando,      setCarregando]      = useState(false)
  const [sucesso,         setSucesso]         = useState(false)
  const [erro,            setErro]            = useState('')

  const matches = busca.trim()
    ? pacientes.filter(p => {
        const q = busca.toLowerCase()
        return p.nome.toLowerCase().includes(q) || p.cpf.includes(q)
      })
    : []

  useEffect(() => {
    setPacEncontrado(null)
    setConsulta(null)
    setSucesso(false)
    setErro('')

    if (!busca.trim()) return

    const encontrados = pacientes.filter(p => {
      const q = busca.toLowerCase()
      return p.nome.toLowerCase().includes(q) || p.cpf.includes(q)
    })

    if (encontrados.length !== 1) return

    const pac = encontrados[0]
    setPacEncontrado(pac)
    listar(pac.id).then(consultas => {
      const agendada = consultas.find(c => c.status === 'AGENDADO')
      setConsulta(agendada ?? null)
    })
  }, [busca])

  async function handleCheckin() {
    if (!consulta) return
    setSucesso(false)
    setErro('')
    setCarregando(true)
    try {
      await confirmarCheckin(consulta.id, 'RECEPCAO')
      setSucesso(true)
    } catch (err) {
      setErro(err.message ?? 'Erro ao registrar check-in')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Check-in Presencial
        </h1>

        <div style={{ maxWidth: '480px' }}>
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

              {consulta ? (
                <div style={{ borderTop: '0.5px solid #F1F5F9', paddingTop: 'var(--space-3)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: '#475569', marginBottom: 'var(--space-1)' }}>
                    Tipo: <strong>{consulta.tipoConsulta}</strong>
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: '#475569', marginBottom: 'var(--space-1)' }}>
                    Horário: {formatarHora(consulta.dataHora)}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: '#475569', marginBottom: 'var(--space-3)' }}>
                    Unidade: {consulta.idUnidade}
                  </p>

                  {sucesso ? (
                    <p style={{ color: '#15803D', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
                      Check-in registrado com sucesso!
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCheckin}
                      disabled={carregando}
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
                      Registrar check-in
                    </button>
                  )}

                  {erro && (
                    <p
                      role="alert"
                      style={{ color: '#DC2626', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}
                    >
                      {erro}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8' }}>
                  Nenhuma consulta agendada encontrada.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
