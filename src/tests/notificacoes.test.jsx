import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Notificacoes from '../pages/paciente/Notificacoes'

vi.mock('../contexts/AuthContext',      () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/notificacoes',    () => ({ listar: vi.fn(), marcarLida: vi.fn() }))

import { useAuth } from '../contexts/AuthContext'
import { listar, marcarLida } from '../mocks/api/notificacoes'

const mockUsuario = { id: 'pac-1', nome: 'Carlos Ferreira', perfil: 'PACIENTE' }

const notifNaoLida = {
  id: 'ntf-2',
  idUsuario: 'pac-1',
  titulo: 'Consulta confirmada',
  mensagem: 'Consulta com Dr. Eduardo confirmada para 11/06.',
  lida: false,
  dataCriacao: '2026-06-10T18:00:00',
}

const notifLida = {
  id: 'ntf-9',
  idUsuario: 'pac-1',
  titulo: 'Lembrete de retorno',
  mensagem: 'Seu retorno está agendado para amanhã.',
  lida: true,
  dataCriacao: '2026-06-09T10:00:00',
}

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockUsuario, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/paciente/notificacoes']}>
      <Notificacoes />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  listar.mockResolvedValue([])
  marcarLida.mockResolvedValue({ ...notifNaoLida, lida: true })
})

describe('Notificacoes — paciente', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /notifica/i })).toBeInTheDocument()
  })

  it('chama listar com o id do usuário ao montar', async () => {
    renderPage()
    await waitFor(() => expect(listar).toHaveBeenCalledWith('pac-1'))
  })

  it('exibe mensagem quando não há notificações', async () => {
    listar.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/nenhuma notifica/i)).toBeInTheDocument()
  })

  it('exibe o título de cada notificação', async () => {
    listar.mockResolvedValue([notifNaoLida])
    renderPage()
    expect(await screen.findByText('Consulta confirmada')).toBeInTheDocument()
  })

  it('exibe a mensagem de cada notificação', async () => {
    listar.mockResolvedValue([notifNaoLida])
    renderPage()
    expect(await screen.findByText(/confirmada para 11\/06/i)).toBeInTheDocument()
  })

  it('exibe badge "Não lida" para notificação não lida', async () => {
    listar.mockResolvedValue([notifNaoLida])
    renderPage()
    expect(await screen.findByText(/não lida/i)).toBeInTheDocument()
  })

  it('exibe badge "Lida" para notificação já lida', async () => {
    listar.mockResolvedValue([notifLida])
    renderPage()
    expect(await screen.findByText(/^lida$/i)).toBeInTheDocument()
  })

  it('exibe a data da notificação formatada', async () => {
    listar.mockResolvedValue([notifNaoLida])
    renderPage()
    // "2026-06-10T18:00:00" → deve mostrar alguma data "10/06/2026" ou similar
    expect(await screen.findByText(/10\/06\/2026/i)).toBeInTheDocument()
  })

  it('chama marcarLida com o id ao clicar na notificação', async () => {
    const user = userEvent.setup()
    listar.mockResolvedValue([notifNaoLida])
    renderPage()
    await user.click(await screen.findByText('Consulta confirmada'))
    await waitFor(() => expect(marcarLida).toHaveBeenCalledWith('ntf-2'))
  })

  it('atualiza badge para "Lida" após marcarLida resolver', async () => {
    const user = userEvent.setup()
    listar.mockResolvedValue([notifNaoLida])
    renderPage()
    await user.click(await screen.findByText('Consulta confirmada'))
    await waitFor(() => expect(screen.getByText(/^lida$/i)).toBeInTheDocument())
  })
})
