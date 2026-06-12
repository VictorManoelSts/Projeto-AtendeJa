import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Fila from '../pages/paciente/Fila'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/fila', () => ({
  getFila:           vi.fn(),
  entrarNaFila:      vi.fn(),
  sairDaFila:        vi.fn(),
  getMinhaposicao:   vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'
import { getFila, entrarNaFila, sairDaFila, getMinhaposicao } from '../mocks/api/fila'

const mockUsuario = { id: 'pac-1', nome: 'Carlos Ferreira', perfil: 'PACIENTE' }

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockUsuario, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/paciente/fila']}>
      <Fila />
    </MemoryRouter>
  )
}

const entradaAtiva = {
  id: 'fil-1', idPaciente: 'pac-1', tipoFila: 'CONSULTA',
  senha: 'CM001', nivelRisco: null, prioridade: 'NORMAL',
  horarioEntrada: '2026-06-12T09:00:00', status: 'AGUARDANDO',
  posicaoOriginal: 5,
}

const posicaoInfo = { posicao: 3, tempoEstimado: 30, senha: 'CM001' }

beforeEach(() => {
  vi.clearAllMocks()
  getFila.mockResolvedValue([])
  entrarNaFila.mockResolvedValue({ ...entradaAtiva })
  sairDaFila.mockResolvedValue({ ...entradaAtiva, status: 'CANCELADO' })
  getMinhaposicao.mockResolvedValue(posicaoInfo)
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------- SEM FILA ----------

describe('Fila — sem fila ativa', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /fila/i })).toBeInTheDocument()
  })

  it('exibe mensagem "Você não está em nenhuma fila"', async () => {
    renderPage()
    expect(await screen.findByText(/você não está em nenhuma fila/i)).toBeInTheDocument()
  })

  it('exibe seletor de tipo com opções Consulta, Exame e Cirurgia', async () => {
    renderPage()
    await screen.findByText(/você não está em nenhuma fila/i)
    expect(screen.getByLabelText(/tipo de fila/i)).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /consulta/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /exame/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /cirurgia/i })).toBeInTheDocument()
  })

  it('exibe botão "Entrar na fila"', async () => {
    renderPage()
    expect(await screen.findByRole('button', { name: /entrar na fila/i })).toBeInTheDocument()
  })

  it('chama entrarNaFila com idPaciente e tipo ao clicar', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('button', { name: /entrar na fila/i })
    await user.click(screen.getByRole('button', { name: /entrar na fila/i }))
    await waitFor(() => expect(entrarNaFila).toHaveBeenCalledWith('pac-1', 'CONSULTA'))
  })

  it('exibe a senha após entrar na fila', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: /entrar na fila/i }))
    expect(await screen.findByText('CM001')).toBeInTheDocument()
  })

  it('exibe erro quando entrarNaFila() rejeita', async () => {
    entrarNaFila.mockRejectedValue(new Error('Paciente já possui uma fila ativa'))
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: /entrar na fila/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/fila ativa/i)
  })
})

// ---------- NA FILA ----------

describe('Fila — com fila ativa', () => {
  function renderComFila() {
    getFila
      .mockResolvedValueOnce([entradaAtiva])
      .mockResolvedValue([])
    renderPage()
  }

  it('exibe SenhaDisplay com a senha da fila', async () => {
    renderComFila()
    expect(await screen.findByText('CM001')).toBeInTheDocument()
  })

  it('exibe label do tipo de fila', async () => {
    renderComFila()
    const label = await screen.findByTestId('tipo-fila-label')
    expect(label).toHaveTextContent('CM')
  })

  it('exibe barra de progresso', async () => {
    renderComFila()
    await screen.findByText('CM001')
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('exibe posição atual com data-testid="posicao-value"', async () => {
    renderComFila()
    const el = await screen.findByTestId('posicao-value')
    expect(el).toHaveTextContent('3')
  })

  it('exibe tempo estimado com data-testid="tempo-value"', async () => {
    renderComFila()
    const el = await screen.findByTestId('tempo-value')
    expect(el).toHaveTextContent('30')
  })

  it('exibe StatusBadge com o status da fila', async () => {
    renderComFila()
    await screen.findByText('CM001')
    expect(screen.getByText('AGUARDANDO')).toBeInTheDocument()
  })

  it('exibe botão "Sair da fila"', async () => {
    renderComFila()
    expect(await screen.findByRole('button', { name: /sair da fila/i })).toBeInTheDocument()
  })

  it('exibe modal de confirmação ao clicar em "Sair da fila"', async () => {
    const user = userEvent.setup()
    renderComFila()
    await user.click(await screen.findByRole('button', { name: /sair da fila/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('chama sairDaFila com o id da entrada ao confirmar no modal', async () => {
    const user = userEvent.setup()
    renderComFila()
    await user.click(await screen.findByRole('button', { name: /sair da fila/i }))
    await user.click(screen.getByRole('button', { name: /confirmar saída/i }))
    await waitFor(() => expect(sairDaFila).toHaveBeenCalledWith('fil-1'))
  })

  it('volta para estado "sem fila" após confirmar saída', async () => {
    const user = userEvent.setup()
    renderComFila()
    await user.click(await screen.findByRole('button', { name: /sair da fila/i }))
    await user.click(screen.getByRole('button', { name: /confirmar saída/i }))
    expect(await screen.findByText(/você não está em nenhuma fila/i)).toBeInTheDocument()
  })

  it('fecha modal ao clicar em "Cancelar" sem sair da fila', async () => {
    const user = userEvent.setup()
    renderComFila()
    await user.click(await screen.findByRole('button', { name: /sair da fila/i }))
    await user.click(screen.getByRole('button', { name: /^cancelar$/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(sairDaFila).not.toHaveBeenCalled()
  })

  it('exibe erro quando sairDaFila() rejeita', async () => {
    sairDaFila.mockRejectedValue(new Error('Entrada não encontrada'))
    const user = userEvent.setup()
    renderComFila()
    await user.click(await screen.findByRole('button', { name: /sair da fila/i }))
    await user.click(screen.getByRole('button', { name: /confirmar saída/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/entrada não encontrada/i)
  })

  it('chama getMinhaposicao com o id da entrada ao carregar', async () => {
    renderComFila()
    await waitFor(() => expect(getMinhaposicao).toHaveBeenCalledWith('fil-1'))
  })

  it('registra setInterval de 30 s enquanto na fila', async () => {
    const spy = vi.spyOn(globalThis, 'setInterval')
    renderComFila()
    await screen.findByText('CM001')
    expect(spy).toHaveBeenCalledWith(expect.any(Function), 30_000)
    spy.mockRestore()
  })

  it('atualiza posicao via setInterval após 30 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    getMinhaposicao
      .mockResolvedValueOnce(posicaoInfo)
      .mockResolvedValue({ posicao: 2, tempoEstimado: 15, senha: 'CM001' })
    renderComFila()
    // aguarda chamada inicial
    await waitFor(() => expect(getMinhaposicao).toHaveBeenCalledTimes(1))
    await act(async () => { vi.advanceTimersByTime(30_000) })
    await waitFor(() => expect(getMinhaposicao).toHaveBeenCalledTimes(2))
  })
})
