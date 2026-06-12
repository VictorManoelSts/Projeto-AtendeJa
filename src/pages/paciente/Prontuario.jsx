import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, ClipboardList,
  CheckSquare, Users, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProntuario } from '../../mocks/api/prontuario'
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

const secao = {
  background: '#FFFFFF',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-4)',
  marginBottom: 'var(--space-4)',
}

const tituloSecao = {
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--space-3)',
}

const item = {
  display: 'inline-block',
  background: 'var(--color-primary-bg)',
  border: '0.5px solid #CBD5E1',
  borderRadius: 'var(--radius-sm)',
  padding: '2px var(--space-2)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-primary)',
  marginRight: 'var(--space-2)',
  marginBottom: 'var(--space-1)',
}

const vazio = {
  fontSize: 'var(--text-sm)',
  color: '#94A3B8',
  margin: 0,
}

export default function Prontuario() {
  const { usuario, logout } = useAuth()
  const [prontuario, setProntuario] = useState(null)
  const [erro,       setErro]       = useState('')

  useEffect(() => {
    getProntuario(usuario.id)
      .then(setProntuario)
      .catch(err => setErro(err.message ?? 'Erro ao carregar prontuário'))
  }, [usuario.id])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>
          Prontuário
        </h1>

        {erro && (
          <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {erro}
          </p>
        )}

        {prontuario && (
          <div style={{ maxWidth: '640px' }}>
            {/* Histórico clínico */}
            <div style={secao}>
              <p style={tituloSecao}>Histórico Clínico</p>
              <p style={{ fontSize: 'var(--text-sm)', color: '#1E293B', lineHeight: 1.6, margin: 0 }}>
                {prontuario.historicoClinco}
              </p>
            </div>

            {/* Diagnósticos / Doenças crônicas */}
            <div style={secao}>
              <p style={tituloSecao}>Diagnósticos</p>
              {prontuario.doencasCronicas?.length > 0 ? (
                <div>
                  {prontuario.doencasCronicas.map((d, i) => (
                    <span key={i} style={item}>{d}</span>
                  ))}
                </div>
              ) : (
                <p style={vazio}>Nenhuma doença crônica registrada.</p>
              )}
            </div>

            {/* Alergias */}
            <div style={secao}>
              <p style={tituloSecao}>Alergias</p>
              {prontuario.alergias?.length > 0 ? (
                <div>
                  {prontuario.alergias.map((a, i) => (
                    <span key={i} style={{ ...item, background: '#FEE2E2', border: '0.5px solid #FECACA', color: 'var(--color-danger)' }}>
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={vazio}>Nenhuma alergia registrada.</p>
              )}
            </div>

            {/* Prescrições / Medicamentos contínuos */}
            <div style={secao}>
              <p style={tituloSecao}>Prescrições</p>
              {prontuario.medicamentosUsoContinuo?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {prontuario.medicamentosUsoContinuo.map((m, i) => (
                    <li key={i} style={{ fontSize: 'var(--text-sm)', color: '#1E293B' }}>• {m}</li>
                  ))}
                </ul>
              ) : (
                <p style={vazio}>Nenhuma prescrição ativa.</p>
              )}
            </div>

            {/* Exames e resultados */}
            <div style={secao}>
              <p style={tituloSecao}>Exames e Resultados</p>
              <p style={vazio}>Nenhum exame registrado.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
