import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MinhasConsultas from '../pages/paciente/MinhasConsultas'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/consultas', () => ({ listar: vi.fn(), cancelar: vi.fn() }))
vi.mock('../mocks/data/medicos', () => ({
  medicos: [
    { id: 'med-1', nome: 'Dr. Eduardo Rezende',    especialidade: 'Clínica Geral', status: 'ATIVO' },
    { id: 'med-2', nome: 'Dra. Fernanda Oliveira', especialidade: 'Cardiologia',   status: 'ATIVO' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { listar, cancelar } from '../mocks/api/consultas'

const mockUsuario = { id: 'pac-1', nome: 'Carlos Ferreira', perfil: 'PACIENTE' }

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockUsuario, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/paciente/consultas']}>
      <MinhasConsultas />
    </MemoryRouter>
  )
}

const consultaAgendada = {
  id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
  dataHora: '2026-12-15T09:00:00', status: 'AGENDADO',
  tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0,
}
const consultaConcluida = {
  id: 'con-2', idPaciente: 'pac-1', idMedico: 'med-2',
  dataHora: '2026-11-01T10:00:00', status: 'CONCLUIDO',
  tipoConsulta: 'RETORNO', contadorCancelamentos: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
  listar.mockResolvedValue([])
  cancelar.mockResolvedValue({ id: 'con-1', status: 'CANCELADO' })
})

describe('MinhasConsultas — paciente', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /minhas consultas/i })).toBeInTheDocument()
  })

  it('chama listar com o id do paciente ao montar', async () => {
    renderPage()
    await waitFor(() => expect(listar).toHaveBeenCalledWith('pac-1'))
  })

  it('exibe mensagem quando não há consultas', async () => {
    listar.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/nenhuma consulta/i)).toBeInTheDocument()
  })

  it('exibe nome do médico e especialidade de uma consulta', async () => {
    listar.mockResolvedValue([consultaAgendada])
    renderPage()
    expect(await screen.findByText('Dr. Eduardo Rezende')).toBeInTheDocument()
    expect(screen.getByText('Clínica Geral')).toBeInTheDocument()
  })

  it('exibe botão "Cancelar" para consulta com status AGENDADO', async () => {
    listar.mockResolvedValue([consultaAgendada])
    renderPage()
    expect(await screen.findByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('exibe botão "Cancelar" para consulta com status CONFIRMADO', async () => {
    listar.mockResolvedValue([{ ...consultaAgendada, status: 'CONFIRMADO' }])
    renderPage()
    expect(await screen.findByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('não exibe botão "Cancelar" para consulta CONCLUIDO', async () => {
    listar.mockResolvedValue([consultaConcluida])
    renderPage()
    await screen.findByText('Dra. Fernanda Oliveira')
    expect(screen.queryByRole('button', { name: /^cancelar$/i })).not.toBeInTheDocument()
  })

  it('exibe botão "Ver detalhes" para cada consulta', async () => {
    listar.mockResolvedValue([consultaAgendada])
    renderPage()
    expect(await screen.findByRole('button', { name: /ver detalhes/i })).toBeInTheDocument()
  })

  it('chama cancelar diretamente quando contadorCancelamentos < 2', async () => {
    const user = userEvent.setup()
    listar.mockResolvedValue([{ ...consultaAgendada, contadorCancelamentos: 1 }])
    renderPage()
    await user.click(await screen.findByRole('button', { name: /^cancelar$/i }))
    await waitFor(() => expect(cancelar).toHaveBeenCalledWith('con-1'))
  })

  it('exibe aviso de confirmação quando contadorCancelamentos === 2', async () => {
    const user = userEvent.setup()
    listar.mockResolvedValue([{ ...consultaAgendada, contadorCancelamentos: 2 }])
    renderPage()
    await user.click(await screen.findByRole('button', { name: /^cancelar$/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/atenção/i)
  })

  it('cancela após confirmar aviso quando contadorCancelamentos === 2', async () => {
    const user = userEvent.setup()
    listar.mockResolvedValue([{ ...consultaAgendada, contadorCancelamentos: 2 }])
    renderPage()
    await user.click(await screen.findByRole('button', { name: /^cancelar$/i }))
    await user.click(screen.getByRole('button', { name: /confirmar cancelamento/i }))
    await waitFor(() => expect(cancelar).toHaveBeenCalledWith('con-1'))
  })

  it('exibe erro quando cancelar() rejeita', async () => {
    cancelar.mockRejectedValue(new Error('Limite de cancelamentos atingido'))
    const user = userEvent.setup()
    listar.mockResolvedValue([consultaAgendada])
    renderPage()
    await user.click(await screen.findByRole('button', { name: /^cancelar$/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/limite de cancelamentos/i)
  })
})
