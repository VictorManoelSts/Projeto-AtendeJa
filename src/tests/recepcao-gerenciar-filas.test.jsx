import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import GerenciarFilas from '../pages/recepcao/GerenciarFilas'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/fila', () => ({
  getFila:             vi.fn(),
  chamarProximo:       vi.fn(),
  marcarAusente:       vi.fn(),
  sairDaFila:          vi.fn(),
  reabrirAtendimento:  vi.fn(),
}))
vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', prioridade: 'NORMAL'   },
    { id: 'pac-2', nome: 'Maria Aparecida Santos',  prioridade: 'GESTANTE' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { getFila, chamarProximo, marcarAusente, sairDaFila, reabrirAtendimento } from '../mocks/api/fila'

const mockRecepcao = { id: 'rec-1', nome: 'Atendente Ana', perfil: 'RECEPCIONISTA' }

const NOW = new Date('2026-06-13T10:00:00').getTime()

// CONSULTA SLA = 30 min; 80% = 24 min
const entradaNormal = {
  id: 'fil-1', idPaciente: 'pac-1', tipoFila: 'CONSULTA',
  senha: 'CM001', nivelRisco: null, prioridade: 'NORMAL',
  horarioEntrada: new Date(NOW - 10 * 60 * 1000).toISOString(),
  status: 'AGUARDANDO', posicaoOriginal: 1,
}
const entradaSLA = {
  id: 'fil-2', idPaciente: 'pac-2', tipoFila: 'CONSULTA',
  senha: 'CM002', nivelRisco: null, prioridade: 'GESTANTE',
  horarioEntrada: new Date(NOW - 25 * 60 * 1000).toISOString(),
  status: 'AUSENTE', posicaoOriginal: 2,
}

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockRecepcao, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/recepcao/filas']}>
      <GerenciarFilas />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
  getFila.mockResolvedValue([entradaNormal, entradaSLA])
  chamarProximo.mockResolvedValue({ ...entradaNormal, status: 'CHAMADO' })
  marcarAusente.mockResolvedValue({ ...entradaNormal, status: 'AUSENTE' })
  sairDaFila.mockResolvedValue({ ...entradaNormal, status: 'CANCELADO' })
  reabrirAtendimento.mockResolvedValue({ ...entradaSLA, status: 'AGUARDANDO' })
})

afterEach(() => { vi.useRealTimers() })

describe('GerenciarFilas — recepção', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /gerenciar filas/i })).toBeInTheDocument()
  })

  it('renderiza as três abas', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: /consulta/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /exame/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /cirurgia/i })).toBeInTheDocument()
  })

  it('chama getFila com CONSULTA ao montar', async () => {
    renderPage()
    await waitFor(() => expect(getFila).toHaveBeenCalledWith('CONSULTA'))
  })

  it('exibe as senhas das entradas', async () => {
    renderPage()
    expect(await screen.findByText('CM001')).toBeInTheDocument()
    expect(screen.getByText('CM002')).toBeInTheDocument()
  })

  it('exibe o nome dos pacientes', async () => {
    renderPage()
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
    expect(screen.getByText('Maria Aparecida Santos')).toBeInTheDocument()
  })

  it('linha com >80% SLA tem data-testid="row-sla-preventivo"', async () => {
    renderPage()
    await screen.findByText('CM001')
    expect(screen.getByTestId('row-sla-preventivo')).toBeInTheDocument()
  })

  it('botão "Chamar Próximo" chama chamarProximo com CONSULTA', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('CM001')
    await user.click(screen.getByRole('button', { name: /chamar próximo/i }))
    await waitFor(() => expect(chamarProximo).toHaveBeenCalledWith('CONSULTA'))
  })

  it('botão "Ausente" chama marcarAusente com o id', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('CM001')
    await user.click(screen.getAllByRole('button', { name: /ausente/i })[0])
    await waitFor(() => expect(marcarAusente).toHaveBeenCalledWith('fil-1'))
  })

  it('botão "Cancelar" chama sairDaFila com o id', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('CM001')
    await user.click(screen.getAllByRole('button', { name: /cancelar/i })[0])
    await waitFor(() => expect(sairDaFila).toHaveBeenCalledWith('fil-1'))
  })

  it('botão "Reabrir" chama reabrirAtendimento com o id', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('CM001')
    await user.click(screen.getAllByRole('button', { name: /reabrir/i })[0])
    await waitFor(() => expect(reabrirAtendimento).toHaveBeenCalledWith('fil-1'))
  })

  it('troca para aba Exame e chama getFila com EXAME', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('CM001')
    await user.click(screen.getByRole('tab', { name: /exame/i }))
    await waitFor(() => expect(getFila).toHaveBeenCalledWith('EXAME'))
  })

  it('troca para aba Cirurgia e chama getFila com CIRURGIA', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('CM001')
    await user.click(screen.getByRole('tab', { name: /cirurgia/i }))
    await waitFor(() => expect(getFila).toHaveBeenCalledWith('CIRURGIA'))
  })

  it('exibe "Fila vazia" quando não há entradas', async () => {
    getFila.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/fila vazia/i)).toBeInTheDocument()
  })
})
