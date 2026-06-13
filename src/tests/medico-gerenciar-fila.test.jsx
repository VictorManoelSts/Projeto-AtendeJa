import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import GerenciarFila from '../pages/medico/GerenciarFila'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/fila', () => ({
  getFila:              vi.fn(),
  chamarProximo:        vi.fn(),
  marcarAusente:        vi.fn(),
  encerrarAtendimento:  vi.fn(),
}))
vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', prioridade: 'NORMAL'   },
    { id: 'pac-2', nome: 'Maria Aparecida Santos',  prioridade: 'GESTANTE' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { getFila, chamarProximo, marcarAusente, encerrarAtendimento } from '../mocks/api/fila'

const mockMedico = { id: 'med-1', nome: 'Dr. Eduardo Rezende', perfil: 'MEDICO' }

const NOW = new Date('2026-06-13T10:00:00').getTime()

const entradaAguardando = {
  id: 'fil-1', idPaciente: 'pac-1', tipoFila: 'CONSULTA',
  senha: 'CM001', prioridade: 'NORMAL', nivelRisco: null,
  horarioEntrada: new Date(NOW - 10 * 60 * 1000).toISOString(),
  status: 'AGUARDANDO', posicaoOriginal: 1,
}

// 25 min de espera > 80% do SLA (30 min → threshold = 24 min)
const entradaSLA = {
  id: 'fil-2', idPaciente: 'pac-2', tipoFila: 'CONSULTA',
  senha: 'CM002', prioridade: 'GESTANTE', nivelRisco: null,
  horarioEntrada: new Date(NOW - 25 * 60 * 1000).toISOString(),
  status: 'CHAMADO', posicaoOriginal: 2,
}

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockMedico, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/medico/fila']}>
      <GerenciarFila />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
  getFila.mockResolvedValue([entradaAguardando, entradaSLA])
  chamarProximo.mockResolvedValue({ ...entradaAguardando, status: 'CHAMADO' })
  marcarAusente.mockResolvedValue({ ...entradaAguardando, status: 'AUSENTE' })
  encerrarAtendimento.mockResolvedValue({ ...entradaSLA, status: 'FINALIZADO' })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('GerenciarFila — médico', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /gerenciar fila/i })).toBeInTheDocument()
  })

  it('exibe a senha de cada entrada', async () => {
    renderPage()
    expect(await screen.findByText('CM001')).toBeInTheDocument()
    expect(screen.getByText('CM002')).toBeInTheDocument()
  })

  it('exibe o nome do paciente de cada entrada', async () => {
    renderPage()
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
    expect(screen.getByText('Maria Aparecida Santos')).toBeInTheDocument()
  })

  it('exibe a prioridade de cada entrada', async () => {
    renderPage()
    expect(await screen.findByText('NORMAL')).toBeInTheDocument()
    expect(screen.getByText('GESTANTE')).toBeInTheDocument()
  })

  it('exibe StatusBadge com o status de cada entrada', async () => {
    renderPage()
    expect(await screen.findByText('AGUARDANDO')).toBeInTheDocument()
    expect(screen.getByText('CHAMADO')).toBeInTheDocument()
  })

  it('exibe o tempo de espera de cada entrada', async () => {
    renderPage()
    expect(await screen.findByText(/10 min/)).toBeInTheDocument()
  })

  it('linha com > 80% do SLA tem data-testid="row-sla-alert"', async () => {
    renderPage()
    await screen.findByText('CM001')
    expect(screen.getByTestId('row-sla-alert')).toBeInTheDocument()
  })

  it('botão "Chamar" chama chamarProximo com o tipoFila', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('CM001')
    await user.click(screen.getAllByRole('button', { name: /chamar/i })[0])
    await waitFor(() => expect(chamarProximo).toHaveBeenCalledWith('CONSULTA'))
  })

  it('botão "Ausente" chama marcarAusente com o id da entrada', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('CM001')
    await user.click(screen.getAllByRole('button', { name: /ausente/i })[0])
    await waitFor(() => expect(marcarAusente).toHaveBeenCalledWith('fil-1'))
  })

  it('botão "Encerrar" chama encerrarAtendimento com o id da entrada', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('CM002')
    await user.click(screen.getAllByRole('button', { name: /encerrar/i })[1])
    await waitFor(() => expect(encerrarAtendimento).toHaveBeenCalledWith('fil-2'))
  })

  it('exibe "Fila vazia" quando não há entradas', async () => {
    getFila.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/fila vazia/i)).toBeInTheDocument()
  })
})
