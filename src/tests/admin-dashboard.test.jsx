import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../pages/admin/Dashboard'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))

// Tempo fixo: 2026-06-13T10:00:00
// f1: CONSULTA, nivelRisco=3(SLA 30min), 10min atrás → 33% → sem alerta
// f2: CONSULTA, nivelRisco=3, 25min atrás → 83% → alerta SLA
// f3: EMERGENCIA, nivelRisco=1(SLA=0), 5min atrás → Infinity% → sempre alerta
vi.mock('../mocks/data/fila', () => ({
  fila: [
    {
      id: 'f1', tipoFila: 'CONSULTA', nivelRisco: 3, prioridade: 'NORMAL',
      status: 'AGUARDANDO', idPaciente: 'pac-1', senha: 'CM001',
      horarioEntrada: '2026-06-13T09:50:00',
    },
    {
      id: 'f2', tipoFila: 'CONSULTA', nivelRisco: 3, prioridade: 'GESTANTE',
      status: 'AGUARDANDO', idPaciente: 'pac-2', senha: 'CM002',
      horarioEntrada: '2026-06-13T09:35:00',
    },
    {
      id: 'f3', tipoFila: 'EMERGENCIA', nivelRisco: 1, prioridade: 'NORMAL',
      status: 'AGUARDANDO', idPaciente: 'pac-3', senha: 'EM001',
      horarioEntrada: '2026-06-13T09:55:00',
    },
  ],
}))

vi.mock('../mocks/data/consultas', () => ({
  consultas: [
    { id: 'c1', idPaciente: 'pac-1', idMedico: 'med-1', dataHora: '2026-06-13T09:00:00', status: 'AGENDADO'       },
    { id: 'c2', idPaciente: 'pac-2', idMedico: 'med-1', dataHora: '2026-06-13T10:00:00', status: 'EM_ATENDIMENTO' },
    { id: 'c3', idPaciente: 'pac-3', idMedico: 'med-1', dataHora: '2026-06-12T09:00:00', status: 'CONCLUIDO'      },
  ],
}))

vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', prioridade: 'NORMAL'   },
    { id: 'pac-2', nome: 'Maria Aparecida Santos',  prioridade: 'GESTANTE' },
    { id: 'pac-3', nome: 'José Antônio Lima',       prioridade: 'IDOSO'    },
  ],
}))

import { useAuth } from '../contexts/AuthContext'

const mockAdmin = { id: 'adm-1', nome: 'Roberto Alves', perfil: 'ADMINISTRADOR' }
const NOW       = new Date('2026-06-13T10:00:00').getTime()

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockAdmin, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Dashboard />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
})

afterEach(() => { vi.useRealTimers() })

describe('Dashboard — admin', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('exibe total de pacientes cadastrados', () => {
    renderPage()
    expect(screen.getByTestId('total-pacientes-value')).toHaveTextContent('3')
  })

  it('exibe atendimentos hoje (consultas na data atual)', () => {
    renderPage()
    expect(screen.getByTestId('atendimentos-hoje-value')).toHaveTextContent('2')
  })

  it('exibe pacientes em espera (status AGUARDANDO)', () => {
    renderPage()
    expect(screen.getByTestId('espera-value')).toHaveTextContent('3')
  })

  it('exibe card de tempo médio de espera', () => {
    renderPage()
    expect(screen.getByTestId('card-tempo-medio')).toBeInTheDocument()
  })

  it('exibe barra de ocupação para CONSULTA com texto "2 / 70"', () => {
    renderPage()
    expect(screen.getByTestId('barra-CONSULTA')).toHaveTextContent('2 / 70')
  })

  it('exibe barra de ocupação para EMERGENCIA', () => {
    renderPage()
    expect(screen.getByTestId('barra-EMERGENCIA')).toBeInTheDocument()
  })

  it('fill de EMERGENCIA tem background vermelho (#DC2626)', () => {
    renderPage()
    const fill = screen.getByTestId('fill-EMERGENCIA')
    expect(fill).toHaveStyle('background: #DC2626')
  })

  it('exibe seção de alertas SLA', () => {
    renderPage()
    expect(screen.getByTestId('lista-alertas-sla')).toBeInTheDocument()
  })

  it('exibe exatamente 2 entradas em alerta SLA', () => {
    renderPage()
    expect(screen.getAllByTestId('alerta-sla-item')).toHaveLength(2)
  })

  it('exibe PulseiraBadge nos itens de alerta SLA', () => {
    renderPage()
    const alertas = screen.getAllByTestId('alerta-sla-item')
    expect(alertas.length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByTestId('pulseira-circle').length).toBeGreaterThanOrEqual(2)
  })

  it('entrada sem alerta (f1, 33%) não aparece na lista SLA', () => {
    renderPage()
    const alertas = screen.getAllByTestId('alerta-sla-item')
    const textos  = alertas.map(el => el.textContent)
    expect(textos.some(t => t.includes('CM001'))).toBe(false)
  })
})
