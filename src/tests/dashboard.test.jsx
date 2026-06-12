import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../pages/paciente/Dashboard'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/consultas',  () => ({ listar: vi.fn() }))
vi.mock('../mocks/api/fila',       () => ({ getFila: vi.fn() }))
vi.mock('../mocks/api/notificacoes', () => ({ listar: vi.fn() }))
vi.mock('../mocks/data/medicos', () => ({
  medicos: [{ id: 'med-1', nome: 'Dr. Eduardo Rezende', especialidade: 'Clínica Geral', status: 'ATIVO' }],
}))

import { useAuth } from '../contexts/AuthContext'
import { listar as listarConsultas } from '../mocks/api/consultas'
import { getFila } from '../mocks/api/fila'
import { listar as listarNotifs } from '../mocks/api/notificacoes'

const mockUsuario = { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', perfil: 'PACIENTE' }

function renderDashboard() {
  useAuth.mockReturnValue({ usuario: mockUsuario, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/paciente']}>
      <Dashboard />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  listarConsultas.mockResolvedValue([])
  getFila.mockResolvedValue([])
  listarNotifs.mockResolvedValue([])
})

describe('Dashboard — paciente', () => {
  it('renderiza saudação com o primeiro nome do usuário', async () => {
    renderDashboard()
    expect(await screen.findByText(/olá, carlos/i)).toBeInTheDocument()
  })

  it('renderiza os 3 cards de métrica', () => {
    renderDashboard()
    expect(screen.getByText('Próxima consulta')).toBeInTheDocument()
    expect(screen.getByText('Fila ativa')).toBeInTheDocument()
    // 'Notificações' aparece também na Sidebar — usa getAllByText
    expect(screen.getAllByText('Notificações').length).toBeGreaterThan(0)
  })

  it('exibe data e médico quando há próxima consulta agendada', async () => {
    listarConsultas.mockResolvedValue([{
      id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
      dataHora: '2026-12-15T09:00:00', status: 'AGENDADO',
    }])
    renderDashboard()
    expect(await screen.findByText('Dr. Eduardo Rezende')).toBeInTheDocument()
  })

  it('exibe "Sem consulta agendada" quando não há consulta futura', async () => {
    listarConsultas.mockResolvedValue([])
    renderDashboard()
    expect(await screen.findByText(/sem consulta agendada/i)).toBeInTheDocument()
  })

  it('exibe senha da fila quando paciente está na fila', async () => {
    getFila
      .mockResolvedValueOnce([{ id: 'fil-1', idPaciente: 'pac-1', senha: 'C001', status: 'AGUARDANDO' }])
      .mockResolvedValue([])
    renderDashboard()
    expect(await screen.findByText('C001')).toBeInTheDocument()
  })

  it('exibe "Sem fila ativa" quando paciente não está na fila', async () => {
    getFila.mockResolvedValue([])
    renderDashboard()
    expect(await screen.findByText(/sem fila ativa/i)).toBeInTheDocument()
  })

  it('exibe contagem de notificações não lidas no card', async () => {
    listarNotifs.mockResolvedValue([
      { id: 'ntf-1', titulo: 'Alerta', lida: false, dataCriacao: '2026-12-14T10:00:00' },
      { id: 'ntf-2', titulo: 'Lembrete', lida: true,  dataCriacao: '2026-12-13T10:00:00' },
    ])
    renderDashboard()
    const count = await screen.findByTestId('notif-count')
    expect(count).toHaveTextContent('1')
  })

  it('lista as últimas 3 notificações e omite a 4ª', async () => {
    listarNotifs.mockResolvedValue([
      { id: 'ntf-1', titulo: 'Notif A', lida: false, dataCriacao: '2026-12-14T10:00:00' },
      { id: 'ntf-2', titulo: 'Notif B', lida: false, dataCriacao: '2026-12-13T10:00:00' },
      { id: 'ntf-3', titulo: 'Notif C', lida: true,  dataCriacao: '2026-12-12T10:00:00' },
      { id: 'ntf-4', titulo: 'Notif D', lida: false, dataCriacao: '2026-12-11T10:00:00' },
    ])
    renderDashboard()
    expect(await screen.findByText('Notif A')).toBeInTheDocument()
    expect(screen.getByText('Notif B')).toBeInTheDocument()
    expect(screen.getByText('Notif C')).toBeInTheDocument()
    expect(screen.queryByText('Notif D')).not.toBeInTheDocument()
  })

  it('renderiza os links da Sidebar', () => {
    renderDashboard()
    expect(screen.getAllByText('Agendamento').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Fila').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Prontuário').length).toBeGreaterThan(0)
  })
})
