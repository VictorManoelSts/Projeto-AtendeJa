import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Reagendamento from '../pages/recepcao/Reagendamento'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/consultas', () => ({
  listar:     vi.fn(),
  reagendar:  vi.fn(),
}))
vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', cpf: '823.456.789-01' },
    { id: 'pac-2', nome: 'Maria Aparecida Santos',  cpf: '234.567.890-12' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { listar, reagendar } from '../mocks/api/consultas'

const mockRecepcao = { id: 'rec-1', nome: 'Atendente Ana', perfil: 'RECEPCIONISTA' }

const mockConsulta = {
  id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
  dataHora: '2026-06-13T09:00:00', tipoConsulta: 'CONSULTA_INICIAL',
  status: 'AGENDADO', motivoConsulta: 'Cefaleia',
}

const mockConsultaReagendada = {
  ...mockConsulta,
  dataHora: '2026-06-20T14:00:00',
  motivoReagendamento: 'Paciente solicitou',
}

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockRecepcao, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/recepcao/reagendamento']}>
      <Reagendamento />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  listar.mockResolvedValue([mockConsulta])
  reagendar.mockResolvedValue(mockConsultaReagendada)
})

describe('Reagendamento — recepção', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /reagendamento/i })).toBeInTheDocument()
  })

  it('exibe campo de busca por CPF ou nome', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/cpf ou nome/i)).toBeInTheDocument()
  })

  it('exibe nome do paciente encontrado', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
  })

  it('chama listar ao encontrar paciente', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await waitFor(() => expect(listar).toHaveBeenCalledWith('pac-1'))
  })

  it('exibe a consulta agendada do paciente', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    expect(await screen.findByText(/consulta_inicial/i)).toBeInTheDocument()
  })

  it('exibe campo de novo horário (datetime-local)', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    expect(screen.getByLabelText(/novo horário/i)).toBeInTheDocument()
  })

  it('exibe campo de motivo obrigatório', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument()
  })

  it('exibe botão "Reagendar"', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    expect(screen.getByRole('button', { name: /^reagendar$/i })).toBeInTheDocument()
  })

  it('chama reagendar com id, nova data e motivo ao confirmar', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    // click consulta para selecionar
    await user.click(screen.getByText(/consulta_inicial/i))
    await user.type(screen.getByLabelText(/motivo/i), 'Paciente solicitou')
    const inputData = screen.getByLabelText(/novo horário/i)
    await user.type(inputData, '2026-06-20T14:00')
    await user.click(screen.getByRole('button', { name: /^reagendar$/i }))
    await waitFor(() =>
      expect(reagendar).toHaveBeenCalledWith('con-1', expect.any(String), 'Paciente solicitou')
    )
  })

  it('exibe registro "before" com a data original', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.click(screen.getByText(/consulta_inicial/i))
    await user.type(screen.getByLabelText(/motivo/i), 'Paciente solicitou')
    await user.type(screen.getByLabelText(/novo horário/i), '2026-06-20T14:00')
    await user.click(screen.getByRole('button', { name: /^reagendar$/i }))
    expect(await screen.findByTestId('registro-before')).toBeInTheDocument()
  })

  it('exibe registro "after" com a nova data', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.click(screen.getByText(/consulta_inicial/i))
    await user.type(screen.getByLabelText(/motivo/i), 'Paciente solicitou')
    await user.type(screen.getByLabelText(/novo horário/i), '2026-06-20T14:00')
    await user.click(screen.getByRole('button', { name: /^reagendar$/i }))
    expect(await screen.findByTestId('registro-after')).toBeInTheDocument()
  })

  it('exibe erro quando motivo está vazio ao tentar reagendar', async () => {
    const user = userEvent.setup()
    reagendar.mockRejectedValue(new Error('Motivo é obrigatório para reagendamento'))
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.click(screen.getByText(/consulta_inicial/i))
    await user.type(screen.getByLabelText(/novo horário/i), '2026-06-20T14:00')
    await user.click(screen.getByRole('button', { name: /^reagendar$/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('exibe "Nenhum resultado" quando busca sem match', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'xyzXYZ999')
    expect(await screen.findByText(/nenhum resultado/i)).toBeInTheDocument()
  })
})
