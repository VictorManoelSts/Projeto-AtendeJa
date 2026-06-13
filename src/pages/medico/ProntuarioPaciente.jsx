import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, FileText, Bell, User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProntuario } from '../../mocks/api/prontuario'
import { consultas as _consultas } from '../../mocks/data/consultas'
import { pacientes } from '../../mocks/data/pacientes'
import Sidebar from '../../components/ui/Sidebar'

const LINKS = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/medico' },
  { label: 'Agenda',       icon: Calendar,        path: '/medico/agenda' },
  { label: 'Prontuários',  icon: FileText,        path: '/medico/prontuarios' },
  { label: 'Notificações', icon: Bell,            path: '/medico/notificacoes' },
  { label: 'Perfil',       icon: User,            path: '/medico/perfil' },
]

const secaoStyle = {
  background: '#FFFFFF',
  border: '0.5px solid #E2E8F0',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4) var(--space-6)',
  marginBottom: 'var(--space-4)',
}

const secaoTituloStyle = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-bold)',
  color: '#1E293B',
  marginBottom: 'var(--space-3)',
}

const badgeRed = {
  background: '#FEE2E2',
  border: '0.5px solid #FECACA',
  borderRadius: 'var(--radius-full)',
  padding: '2px 8px',
  fontSize: 'var(--text-xs)',
  color: '#B91C1C',
}

export default function ProntuarioPaciente() {
  const { usuario, logout } = useAuth()
  const { idPaciente }      = useParams()

  const paciente = pacientes.find(p => p.id === idPaciente) ?? null

  // Verifica vínculo: médico deve ter ao menos uma consulta com este paciente
  const temVinculo = _consultas.some(
    c => c.idMedico === usuario.id && c.idPaciente === idPaciente
  )

  const consultasVinculadas = _consultas.filter(
    c => c.idMedico === usuario.id && c.idPaciente === idPaciente
  )

  const [prontuario, setProntuario] = useState(null)
  const [erro,       setErro]       = useState('')

  useEffect(() => {
    if (!temVinculo) return
    getProntuario(idPaciente)
      .then(setProntuario)
      .catch(err => setErro(err.message ?? 'Erro ao carregar prontuário'))
  }, [idPaciente, temVinculo])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={LINKS} usuario={usuario} onLogout={logout} />

      <main style={{ flex: 1, background: '#F8FAFC', padding: 'var(--space-8)', minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
          Prontuário
        </h1>

        {!temVinculo ? (
          <p style={{ color: '#DC2626', fontSize: 'var(--text-sm)' }}>
            Acesso não autorizado. Este paciente não está vinculado a você.
          </p>
        ) : (
          <>
            {erro && (
              <p role="alert" style={{ color: '#DC2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                {erro}
              </p>
            )}

            <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: '#1E293B', marginBottom: 'var(--space-6)' }}>
              {paciente?.nome ?? '—'}
            </p>

            {prontuario && (
              <>
                {/* Histórico clínico */}
                <div style={secaoStyle}>
                  <p style={secaoTituloStyle}>Histórico Clínico</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: '#475569', margin: 0 }}>
                    {prontuario.historicoClinco}
                  </p>
                </div>

                {/* Diagnósticos */}
                <div style={secaoStyle}>
                  <p style={secaoTituloStyle}>Diagnósticos</p>
                  {prontuario.doencasCronicas?.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
                      {prontuario.doencasCronicas.map((d, i) => (
                        <li key={i} style={{ fontSize: 'var(--text-sm)', color: '#475569' }}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: 'var(--text-sm)', color: '#94A3B8', margin: 0 }}>Sem registros.</p>
                  )}
                </div>

                {/* Alergias */}
                <div style={secaoStyle}>
                  <p style={secaoTituloStyle}>Alergias</p>
                  {prontuario.alergias?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                      {prontuario.alergias.map((a, i) => (
                        <span key={i} style={badgeRed}>{a}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 'var(--text-sm)', color: '#94A3B8', margin: 0 }}>Sem registros.</p>
                  )}
                </div>

                {/* Medicamentos */}
                <div style={secaoStyle}>
                  <p style={secaoTituloStyle}>Medicamentos de Uso Contínuo</p>
                  {prontuario.medicamentosUsoContinuo?.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
                      {prontuario.medicamentosUsoContinuo.map((m, i) => (
                        <li key={i} style={{ fontSize: 'var(--text-sm)', color: '#475569' }}>{m}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: 'var(--text-sm)', color: '#94A3B8', margin: 0 }}>Sem registros.</p>
                  )}
                </div>
              </>
            )}

            {/* Consultas anteriores */}
            <div style={secaoStyle}>
              <p style={secaoTituloStyle}>Consultas Anteriores</p>
              {consultasVinculadas.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {consultasVinculadas.map(c => (
                    <li key={c.id} style={{ fontSize: 'var(--text-sm)', color: '#475569', borderBottom: '0.5px solid #F1F5F9', paddingBottom: 'var(--space-2)' }}>
                      <span style={{ color: '#64748B', fontSize: 'var(--text-xs)' }}>
                        {new Date(c.dataHora).toLocaleDateString('pt-BR')} — {c.tipoConsulta.replace('_', ' ')}
                      </span>
                      <br />
                      {c.motivoConsulta}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 'var(--text-sm)', color: '#94A3B8', margin: 0 }}>Sem registros.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
