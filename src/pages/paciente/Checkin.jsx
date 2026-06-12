import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, ClipboardList,
  CheckSquare, Users, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { listar } from '../../mocks/api/consultas'
import { entrarNaFila } from '../../mocks/api/fila'
import { medicos } from '../../mocks/data/medicos'
import Sidebar from '../../components/ui/Sidebar'
import SenhaDisplay from '../../components/ui/SenhaDisplay'

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

const TIPO_FILA = {
  CONSULTA_INICIAL: 'CONSULTA',
  RETORNO:          'CONSULTA',
  URGENCIA:         'EMERGENCIA',
  EXAME:            'EXAME',
  CIRURGIA:         'CIRURGIA',
}

const UNIDADES = [
  { id: 'uni-1', nome: 'UPA Central' },
  { id: 'uni-2', nome: 'Hospital São Lucas' },
]

const JANELA_MS = 30 * 60 * 1000

export default function Checkin() {
  const { usuario, logout } = useAuth()
  const [consulta,   setConsulta]   = useState(null)
  const [entrada,    setEntrada]    = useState(null)
  const [erro,       setErro]       = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    listar(usuario.id).then(lista => {
      const proxima = lista
        .filter(c => ['AGENDADO', 'CONFIRMADO'].includes(c.status))
        .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))[0] ?? null
      setConsulta(proxima)
    })
  }, [usuario.id])

  const dentroJanela = consulta
    ? Date.now() >= new Date(consulta.dataHora).getTime() - JANELA_MS
    : false

  async function handleConfirmar() {
    setErro('')
    setCarregando(true)
    try {
      const tipo = TIPO_FILA[consulta.tipoConsulta] ?? 'CONSULTA'
      const result = await entrarNaFila(usuario.id, tipo)
      setEntrada(result)
    } catch (err) {
      setErro(err.message ?? 'Erro ao confirmar presença')
    } finally {
      setCarregando(false)
    }
  }

  const medico  = consulta ? medicos.find(m => m.id === consulta.idMedico)   : null
  const unidade = consulta ? UNIDADES.find(u => u.id === consulta.idUnidade) : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>
          Check-in
        </h1>

        {erro && (
          <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        {entrada ? (
          <div style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', maxWidth: '400px' }}>
            <p style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
              Check-in realizado com sucesso!
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', marginBottom: 'var(--space-2)' }}>Sua senha:</p>
            <SenhaDisplay senha={entrada.senha} />
          </div>
        ) : consulta ? (
          <div style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', maxWidth: '400px' }}>
            <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-primary)' }}>
              {medico?.nome ?? '—'}
            </p>
            <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-xs)', color: '#64748B' }}>
              {medico?.especialidade ?? '—'}
            </p>
            <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-xs)', color: '#64748B' }}>
              {new Date(consulta.dataHora).toLocaleString('pt-BR')}
            </p>
            {unidade && (
              <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-xs)', color: '#94A3B8' }}>
                {unidade.nome}
              </p>
            )}

            {!dentroJanela && (
              <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', marginBottom: 'var(--space-3)' }}>
                O check-in estará disponível 30 minutos antes da consulta.
              </p>
            )}

            <button
              onClick={handleConfirmar}
              disabled={!dentroJanela || carregando}
              style={{
                width: '100%',
                background: dentroJanela ? 'var(--color-primary)' : '#94A3B8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: dentroJanela && !carregando ? 'pointer' : 'not-allowed',
                minHeight: '44px',
              }}
            >
              {carregando ? 'Confirmando…' : 'Confirmar presença'}
            </button>
          </div>
        ) : (
          <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Sem consulta disponível para check-in.</p>
        )}
      </main>
    </div>
  )
}
