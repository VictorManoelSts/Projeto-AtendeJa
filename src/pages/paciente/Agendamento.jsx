import { useState } from 'react'
import {
  LayoutDashboard, Calendar, ClipboardList,
  CheckSquare, Users, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { agendar } from '../../mocks/api/consultas'
import { medicos } from '../../mocks/data/medicos'
import Sidebar from '../../components/ui/Sidebar'

const LINKS = [
  { label: 'Dashboard',        icon: LayoutDashboard, path: '/paciente' },
  { label: 'Agendamento',      icon: Calendar,        path: '/paciente/agendamento' },
  { label: 'Minhas Consultas', icon: ClipboardList,   path: '/paciente/consultas' },
  { label: 'Check-in',         icon: CheckSquare,     path: '/paciente/checkin' },
  { label: 'Fila',             icon: Users,           path: '/paciente/fila' },
  { label: 'Prontuário',       icon: FileText,        path: '/paciente/prontuario' },
  { label: 'Notificações',     icon: Bell,            path: '/paciente/notificacoes' },
  { label: 'Perfil',           icon: User,            path: '/paciente/perfil' },
]

const STATUS_DISPONIVEL = new Set(['ATIVO', 'PLANTAO'])

const ESPECIALIDADES = [...new Set(medicos.map(m => m.especialidade))].sort()

const UNIDADES = [
  { id: 'uni-1', nome: 'UPA Central' },
  { id: 'uni-2', nome: 'Hospital São Lucas' },
]

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-1)',
}

const inputStyle = {
  width: '100%',
  border: '0.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-sm)',
  color: '#1E293B',
  background: '#FFFFFF',
  boxSizing: 'border-box',
  outline: 'none',
}

export default function Agendamento() {
  const { usuario, logout } = useAuth()

  const [especialidade, setEspecialidade] = useState('')
  const [tipo,          setTipo]          = useState('')
  const [idMedico,      setIdMedico]      = useState('')
  const [idUnidade,     setIdUnidade]     = useState('')
  const [data,          setData]          = useState('')
  const [horario,       setHorario]       = useState('')
  const [erro,          setErro]          = useState('')
  const [sucesso,       setSucesso]       = useState(false)
  const [carregando,    setCarregando]    = useState(false)

  const medicosFiltrados = especialidade
    ? medicos.filter(m => m.especialidade === especialidade && STATUS_DISPONIVEL.has(m.status))
    : []

  function limparCampos() {
    setEspecialidade(''); setTipo(''); setIdMedico('')
    setIdUnidade(''); setData(''); setHorario('')
  }

  function resetar() {
    limparCampos()
    setErro(''); setSucesso(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(''); setSucesso(false)

    if (!especialidade || !tipo || !idMedico || !data || !horario) {
      setErro('Preencha todos os campos obrigatórios')
      return
    }

    setCarregando(true)
    try {
      await agendar({
        idPaciente: usuario.id,
        idMedico,
        idUnidade: idUnidade || UNIDADES[0].id,
        dataHora: `${data}T${horario}:00`,
        tipoConsulta: tipo,
      })
      limparCampos()
      setSucesso(true)
    } catch (err) {
      setErro(err.message ?? 'Erro ao agendar')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Agendar consulta
        </h1>

        {sucesso && (
          <p role="status" style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Consulta agendada com sucesso!
          </p>
        )}

        {erro && (
          <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          <div>
            <label htmlFor="especialidade" style={labelStyle}>Especialidade</label>
            <select
              id="especialidade"
              value={especialidade}
              onChange={e => { setEspecialidade(e.target.value); setIdMedico('') }}
              style={inputStyle}
            >
              <option value="">Selecione</option>
              {ESPECIALIDADES.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tipo" style={labelStyle}>Tipo</label>
            <select id="tipo" value={tipo} onChange={e => setTipo(e.target.value)} style={inputStyle}>
              <option value="">Selecione</option>
              <option value="CONSULTA_INICIAL">Consulta Inicial</option>
              <option value="RETORNO">Retorno</option>
            </select>
          </div>

          <div>
            <label htmlFor="medico" style={labelStyle}>Médico</label>
            <select
              id="medico"
              value={idMedico}
              onChange={e => setIdMedico(e.target.value)}
              disabled={!especialidade}
              style={inputStyle}
            >
              <option value="">Selecione</option>
              {medicosFiltrados.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="unidade" style={labelStyle}>Unidade</label>
            <select id="unidade" value={idUnidade} onChange={e => setIdUnidade(e.target.value)} style={inputStyle}>
              <option value="">Selecione</option>
              {UNIDADES.map(u => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="data" style={labelStyle}>Data</label>
            <input
              id="data"
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="horario" style={labelStyle}>Horário</label>
            <input
              id="horario"
              type="time"
              value={horario}
              onChange={e => setHorario(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <button
              type="submit"
              disabled={carregando}
              style={{ flex: 1, background: '#1E293B', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', cursor: 'pointer', minHeight: '44px' }}
            >
              {carregando ? 'Agendando…' : 'Agendar'}
            </button>
            <button
              type="button"
              onClick={resetar}
              style={{ flex: 1, background: '#FFFFFF', color: '#334155', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', cursor: 'pointer', minHeight: '44px' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
