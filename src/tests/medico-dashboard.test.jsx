import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../pages/medico/Dashboard'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/fila', () => ({ getFila: vi.fn(), chamarProximo: vi.fn() }))

vi.mock('../mocks/data/consultas', () => {
  const hoje = new Date().toISOString().slice(0, 10)
  return {
    consultas: [
      { id: 'con-m1', idMedico: 'med-1', idPaciente: 'pac-1', dataHora: `${hoje}T09:00:00`, status: 'AGENDADO',   tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0 },
      { id: 'con-m2', idMedico: 'med-1', idPaciente: 'pac-4', dataHora: `${hoje}T10:30:00`, status: 'CONFIRMADO', tipoConsulta: 'RETORNO',          contadorCancelamentos: 0 },
      { id: 'con-m3', idMedico: 'med-2', idPaciente: 'pac-3', dataHora: `${hoje}T11:00:00`, status: 'AGENDADO',   tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0 },
    ],
  }
})

vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', dataNascimento: '1990-03-15', prioridade: 'NORMAL' },
    { id: 'pac-4', nome: 'Benedita Rosa Carvalho',  dataNascimento: '1942-05-08', prioridade: 'IDOSO_80_MAIS' },
  ],
}))

vi.mock('../mocks/data/prontuarios', () => ({
  prontuarios: [
    { id: 'prt-1', idPaciente: 'pac-1', alergias: ['dipirona'], doencasCronicas: [], medicamentosUsoContinuo: [] },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { getFila, chamarProximo } from '../mocks/api/fila'

const mockMedico = { id: 'med-1', nome: 'Dr. Eduardo Rezende', perfil: 'MEDICO' }

const entradaAguardando = {
  id: 'fil-1', idPaciente: 'pac-1', tipoFila: 'CONSULTA',
  senha: 'CM001', nivelRisco: null, prioridade: 'NORMAL',
  horarioEntrada: '2026-06-13T08:30:00', status: 'AGUARDANDO', posicaoOriginal: 3,
}

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockMedico, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/medico']}>
      <Dashboard />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getFila.mockResolvedValue([])
  chamarProximo.mockResolvedValue({ ...entradaAguardando, status: 'CHAMADO' })
})

describe('Dashboard — médico', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('exibe card de métrica "Total de consultas"', () => {
    renderPage()
    expect(screen.getByText(/total de consultas/i)).toBeInTheDocument()
  })

  it('exibe o total de consultas do dia para este médico (2, excluindo med-2)', async () => {
    renderPage()
    const el = await screen.findByTestId('total-consultas-value')
    expect(el).toHaveTextContent('2')
  })

  it('exibe card de métrica "Pacientes em espera"', () => {
    renderPage()
    expect(screen.getByText(/pacientes em espera/i)).toBeInTheDocument()
  })

  it('exibe contagem de pacientes aguardando na fila', async () => {
    getFila.mockResolvedValueOnce([entradaAguardando]).mockResolvedValue([])
    renderPage()
    const el = await screen.findByTestId('total-espera-value')
    expect(el).toHaveTextContent('1')
  })

  it('exibe card de métrica "Tempo médio"', () => {
    renderPage()
    expect(screen.getByText(/tempo médio/i)).toBeInTheDocument()
  })

  it('exibe card do próximo paciente quando há paciente aguardando', async () => {
    getFila.mockResolvedValueOnce([entradaAguardando]).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
  })

  it('exibe a senha do próximo paciente', async () => {
    getFila.mockResolvedValueOnce([entradaAguardando]).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('CM001')).toBeInTheDocument()
  })

  it('exibe as alergias do próximo paciente', async () => {
    getFila.mockResolvedValueOnce([entradaAguardando]).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('dipirona')).toBeInTheDocument()
  })

  it('exibe a idade do próximo paciente', async () => {
    getFila.mockResolvedValueOnce([entradaAguardando]).mockResolvedValue([])
    renderPage()
    const ageEl = await screen.findByTestId('proximo-idade')
    expect(ageEl).toHaveTextContent(/\d+ anos/)
  })

  it('exibe botão "Chamar paciente" quando há próximo', async () => {
    getFila.mockResolvedValueOnce([entradaAguardando]).mockResolvedValue([])
    renderPage()
    expect(await screen.findByRole('button', { name: /chamar paciente/i })).toBeInTheDocument()
  })

  it('exibe botão "Ver prontuário" quando há próximo', async () => {
    getFila.mockResolvedValueOnce([entradaAguardando]).mockResolvedValue([])
    renderPage()
    expect(await screen.findByRole('button', { name: /ver prontuário/i })).toBeInTheDocument()
  })

  it('chama chamarProximo com o tipoFila ao clicar em "Chamar paciente"', async () => {
    const user = userEvent.setup()
    getFila.mockResolvedValueOnce([entradaAguardando]).mockResolvedValue([])
    renderPage()
    await user.click(await screen.findByRole('button', { name: /chamar paciente/i }))
    await waitFor(() => expect(chamarProximo).toHaveBeenCalledWith('CONSULTA'))
  })

  it('exibe "Sem pacientes aguardando" quando fila está vazia', async () => {
    getFila.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/sem pacientes aguardando/i)).toBeInTheDocument()
  })
})
