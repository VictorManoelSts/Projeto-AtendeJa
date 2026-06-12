import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, Calendar, ClipboardList,
  CheckSquare, Users, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getFila, entrarNaFila, sairDaFila, getMinhaposicao } from '../../mocks/api/fila'
import Sidebar from '../../components/ui/Sidebar'
import SenhaDisplay from '../../components/ui/SenhaDisplay'
import StatusBadge from '../../components/ui/StatusBadge'

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

const TIPOS_FILA = ['CONSULTA', 'EXAME', 'CIRURGIA', 'EMERGENCIA']

const TIPOS_SELECAO = [
  { value: 'CONSULTA',  label: 'Consulta médica' },
  { value: 'EXAME',     label: 'Exame' },
  { value: 'CIRURGIA',  label: 'Cirurgia' },
]

const PREFIXO = { CONSULTA: 'CM', EXAME: 'EX', CIRURGIA: 'CI', EMERGENCIA: 'EM' }

const LABEL_FILA = {
  CONSULTA:   'Consulta médica — CM',
  EXAME:      'Exame — EX',
  CIRURGIA:   'Cirurgia — CI',
  EMERGENCIA: 'Emergência — EM',
}

const card = {
  background: '#FFFFFF',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3) var(--space-4)',
  flex: 1,
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

const btnBase = {
  border: 'none',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3) var(--space-4)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  minHeight: '44px',
}

export default function Fila() {
  const { usuario, logout } = useAuth()

  const [entrada,    setEntrada]    = useState(null)
  const [posicao,    setPosicao]    = useState(null)
  const [tipoSel,    setTipoSel]    = useState('CONSULTA')
  const [modal,      setModal]      = useState(false)
  const [erro,       setErro]       = useState('')
  const [carregando, setCarregando] = useState(false)

  // Scan all types on mount to find active queue entry
  useEffect(() => {
    async function carregar() {
      for (const tipo of TIPOS_FILA) {
        const fila = await getFila(tipo)
        const found = fila.find(e => e.idPaciente === usuario.id)
        if (found) { setEntrada(found); return }
      }
    }
    carregar()
  }, [usuario.id])

  // Periodic position refresh when in queue
  useEffect(() => {
    if (!entrada) return
    getMinhaposicao(entrada.id).then(setPosicao).catch(() => {})
    const timer = setInterval(() => {
      getMinhaposicao(entrada.id).then(setPosicao).catch(() => {})
    }, 30_000)
    return () => clearInterval(timer)
  }, [entrada?.id])

  async function handleEntrar() {
    setErro('')
    setCarregando(true)
    try {
      const nova = await entrarNaFila(usuario.id, tipoSel)
      setEntrada(nova)
    } catch (err) {
      setErro(err.message ?? 'Erro ao entrar na fila')
    } finally {
      setCarregando(false)
    }
  }

  async function handleSair() {
    setErro('')
    setCarregando(true)
    setModal(false)
    try {
      await sairDaFila(entrada.id)
      setEntrada(null)
      setPosicao(null)
    } catch (err) {
      setErro(err.message ?? 'Erro ao sair da fila')
    } finally {
      setCarregando(false)
    }
  }

  const posAtual     = posicao?.posicao      ?? null
  const tempoAtual   = posicao?.tempoEstimado ?? null
  const posOriginal  = entrada?.posicaoOriginal ?? 1
  const progressPct  = posAtual !== null
    ? Math.max(0, Math.min(100, Math.round(((posOriginal - posAtual) / posOriginal) * 100)))
    : 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>
          Fila
        </h1>

        {erro && (
          <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        {/* ── SEM FILA ── */}
        {!entrada && (
          <div style={{ maxWidth: '400px' }}>
            <p style={{ color: '#64748B', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
              Você não está em nenhuma fila.
            </p>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label
                htmlFor="tipo-fila"
                style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}
              >
                Tipo de fila
              </label>
              <select
                id="tipo-fila"
                value={tipoSel}
                onChange={e => setTipoSel(e.target.value)}
                style={inputStyle}
              >
                {TIPOS_SELECAO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleEntrar}
              disabled={carregando}
              style={{ ...btnBase, background: 'var(--color-primary)', color: '#FFFFFF', width: '100%' }}
            >
              {carregando ? 'Entrando…' : 'Entrar na fila'}
            </button>
          </div>
        )}

        {/* ── NA FILA ── */}
        {entrada && (
          <div style={{ maxWidth: '480px' }}>
            {/* Senha em destaque */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)', padding: 'var(--space-6)', background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', marginBottom: 'var(--space-2)' }}>
                Sua senha
              </p>
              <SenhaDisplay senha={entrada.senha} />
              <p data-testid="tipo-fila-label" style={{ fontSize: 'var(--text-sm)', color: '#475569', marginTop: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {LABEL_FILA[entrada.tipoFila] ?? entrada.tipoFila}
              </p>
              <StatusBadge status={entrada.status} />
            </div>

            {/* Barra de progresso */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ background: '#E2E8F0', borderRadius: 'var(--radius-full)', height: '8px', overflow: 'hidden' }}
              >
                <div style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'var(--color-primary)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            {/* Cards de métrica */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div style={card}>
                <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', margin: '0 0 var(--space-1)' }}>Posição</p>
                <p data-testid="posicao-value" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', margin: 0 }}>
                  {posAtual ?? '—'}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', margin: 0 }}>na fila</p>
              </div>

              <div style={card}>
                <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', margin: '0 0 var(--space-1)' }}>Tempo estimado</p>
                <p data-testid="tempo-value" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', margin: 0 }}>
                  {tempoAtual ?? '—'}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', margin: 0 }}>minutos</p>
              </div>
            </div>

            {/* Botão sair */}
            <button
              onClick={() => setModal(true)}
              style={{ ...btnBase, background: '#FEE2E2', color: 'var(--color-danger)', width: '100%' }}
            >
              Sair da fila
            </button>
          </div>
        )}
      </main>

      {/* ── MODAL DE CONFIRMAÇÃO ── */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
            onClick={e => e.stopPropagation()}
            style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', maxWidth: '360px', width: '90%' }}
          >
            <h2 id="modal-titulo" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>
              Sair da fila?
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: '#64748B', marginBottom: 'var(--space-5)' }}>
              Você perderá sua posição e precisará entrar novamente se quiser ser atendido.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                onClick={handleSair}
                style={{ ...btnBase, flex: 1, background: 'var(--color-danger)', color: '#FFFFFF' }}
              >
                Confirmar saída
              </button>
              <button
                onClick={() => setModal(false)}
                style={{ ...btnBase, flex: 1, background: '#FFFFFF', color: '#64748B', border: '0.5px solid #E2E8F0' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
