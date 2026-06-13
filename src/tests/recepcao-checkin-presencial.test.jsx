import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CheckinPresencial from '../pages/recepcao/CheckinPresencial'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/consultas', () => ({
  listar:           vi.fn(),
  confirmarCheckin: vi.fn(),
}))
vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', cpf: '823.456.789-01', dataNascimento: '1990-03-15', prioridade: 'NORMAL'   },
    { id: 'pac-2', nome: 'Maria Aparecida Santos',  cpf: '234.567.890-12', dataNascimento: '1998-07-22', prioridade: 'GESTANTE' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { listar, confirmarCheckin } from '../mocks/api/consultas'

const mockRecepcao = { id: 'rec-1', nome: 'Atendente Ana', perfil: 'RECEPCIONISTA' }

const mockConsulta = {
  id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
  dataHora: '2026-06-13T09:00:00', tipoConsulta: 'CONSULTA_INICIAL',
  status: 'AGENDADO', idUnidade: 'uni-1', motivoConsulta: 'Cefaleia',
  contadorCancelamentos: 0,
}

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockRecepcao, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/recepcao/checkin']}>
      <CheckinPresencial />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  listar.mockResolvedValue([mockConsulta])
  confirmarCheckin.mockResolvedValue({ ...mockConsulta, status: 'CONFIRMADO', origemCheckin: 'RECEPCAO' })
})

describe('CheckinPresencial — recepção', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /check.in/i })).toBeInTheDocument()
  })

  it('exibe campo de busca por CPF ou nome', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/cpf ou nome/i)).toBeInTheDocument()
  })

  it('exibe card do paciente ao buscar por nome', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
  })

  it('exibe card do paciente ao buscar por CPF', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), '823.456')
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
  })

  it('chama listar ao encontrar paciente por nome', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await waitFor(() => expect(listar).toHaveBeenCalledWith('pac-1'))
  })

  it('exibe "Nenhum resultado" quando busca sem match', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'xyzXYZ999')
    expect(await screen.findByText(/nenhum resultado/i)).toBeInTheDocument()
  })

  it('exibe tipo da consulta agendada', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    expect(await screen.findByText(/consulta_inicial/i)).toBeInTheDocument()
  })

  it('exibe hora da consulta agendada', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    expect(await screen.findByText(/09:00/)).toBeInTheDocument()
  })

  it('exibe unidade da consulta', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    expect(await screen.findByText(/uni-1/i)).toBeInTheDocument()
  })

  it('exibe botão "Registrar check-in"', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    expect(await screen.findByRole('button', { name: /registrar check-in/i })).toBeInTheDocument()
  })

  it('chama confirmarCheckin com id e "RECEPCAO" ao clicar', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await user.click(await screen.findByRole('button', { name: /registrar check-in/i }))
    await waitFor(() =>
      expect(confirmarCheckin).toHaveBeenCalledWith('con-1', 'RECEPCAO')
    )
  })

  it('exibe confirmação após check-in registrado', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await user.click(await screen.findByRole('button', { name: /registrar check-in/i }))
    expect(await screen.findByText(/check-in.*registrado/i)).toBeInTheDocument()
  })

  it('exibe erro quando confirmarCheckin rejeita', async () => {
    const user = userEvent.setup()
    confirmarCheckin.mockRejectedValue(new Error('Consulta não encontrada'))
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await user.click(await screen.findByRole('button', { name: /registrar check-in/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
