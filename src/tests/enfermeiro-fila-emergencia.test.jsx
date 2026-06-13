import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import FilaEmergencia from '../pages/enfermeiro/FilaEmergencia'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/fila', () => ({
  getFila:       vi.fn(),
  chamarProximo: vi.fn(),
  marcarAusente: vi.fn(),
  sairDaFila:    vi.fn(),
}))
vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', prioridade: 'NORMAL'        },
    { id: 'pac-2', nome: 'Maria Aparecida Santos',  prioridade: 'GESTANTE'      },
    { id: 'pac-3', nome: 'José Antônio Lima',        prioridade: 'IDOSO'         },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { getFila, chamarProximo, marcarAusente, sairDaFila } from '../mocks/api/fila'

const mockEnfermeiro = { id: 'enf-1', nome: 'Enfermeira Joana', perfil: 'ENFERMEIRO' }

// Tempo fixo: 2026-06-13T10:00:00
const NOW = new Date('2026-06-13T10:00:00').getTime()

// nivelRisco=3 → SLA 30 min. 80% = 24 min.
// normal: 10 min espera (33%)  → sem alerta
// preventiva: 25 min espera (83%) → alerta preventivo
// crítica: 35 min espera (117%)  → alerta crítico

const entradaNormal = {
  id: 'fil-em-1', idPaciente: 'pac-1', tipoFila: 'EMERGENCIA',
  senha: 'EM001', nivelRisco: 3, prioridade: 'NORMAL',
  horarioEntrada: new Date(NOW - 10 * 60 * 1000).toISOString(),
  status: 'AGUARDANDO', posicaoOriginal: 1,
}

const entradaPreventiva = {
  id: 'fil-em-2', idPaciente: 'pac-2', tipoFila: 'EMERGENCIA',
  senha: 'EM002', nivelRisco: 3, prioridade: 'GESTANTE',
  horarioEntrada: new Date(NOW - 25 * 60 * 1000).toISOString(),
  status: 'CHAMADO', posicaoOriginal: 2,
}

const entradaCritica = {
  id: 'fil-em-3', idPaciente: 'pac-3', tipoFila: 'EMERGENCIA',
  senha: 'EM003', nivelRisco: 3, prioridade: 'IDOSO',
  horarioEntrada: new Date(NOW - 35 * 60 * 1000).toISOString(),
  status: 'AGUARDANDO', posicaoOriginal: 3,
}

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockEnfermeiro, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/enfermeiro/fila']}>
      <FilaEmergencia />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
  getFila.mockResolvedValue([entradaNormal, entradaPreventiva, entradaCritica])
  chamarProximo.mockResolvedValue({ ...entradaNormal, status: 'CHAMADO' })
  marcarAusente.mockResolvedValue({ ...entradaNormal, status: 'AUSENTE' })
  sairDaFila.mockResolvedValue({ ...entradaNormal, status: 'CANCELADO' })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('FilaEmergencia — enfermeiro', () => {
  /* ── Estrutura básica ─────────────────────────────────────── */
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /fila.*emergência/i })).toBeInTheDocument()
  })

  it('exibe a senha de cada entrada', async () => {
    renderPage()
    expect(await screen.findByText('EM001')).toBeInTheDocument()
    expect(screen.getByText('EM002')).toBeInTheDocument()
    expect(screen.getByText('EM003')).toBeInTheDocument()
  })

  it('exibe PulseiraBadge para cada entrada', async () => {
    renderPage()
    await screen.findByText('EM001')
    expect(screen.getAllByTestId('pulseira-circle')).toHaveLength(3)
  })

  it('exibe o nome do paciente de cada entrada', async () => {
    renderPage()
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
    expect(screen.getByText('Maria Aparecida Santos')).toBeInTheDocument()
    expect(screen.getByText('José Antônio Lima')).toBeInTheDocument()
  })

  it('exibe a prioridade legal de cada entrada', async () => {
    renderPage()
    expect(await screen.findByText('NORMAL')).toBeInTheDocument()
    expect(screen.getByText('GESTANTE')).toBeInTheDocument()
    expect(screen.getByText('IDOSO')).toBeInTheDocument()
  })

  it('exibe o tempo de espera da entrada normal', async () => {
    renderPage()
    expect(await screen.findByText(/10 min/)).toBeInTheDocument()
  })

  it('exibe StatusBadge para cada entrada', async () => {
    renderPage()
    // entradaNormal + entradaCritica = 2 com AGUARDANDO
    expect(await screen.findByText('CHAMADO')).toBeInTheDocument()
    expect(screen.getAllByText('AGUARDANDO')).toHaveLength(2)
  })

  /* ── Alertas de SLA ───────────────────────────────────────── */
  it('linha preventiva (>80% SLA) tem data-testid="row-sla-preventivo"', async () => {
    renderPage()
    await screen.findByText('EM001')
    expect(screen.getByTestId('row-sla-preventivo')).toBeInTheDocument()
  })

  it('linha crítica (SLA excedido) tem data-testid="row-sla-critico"', async () => {
    renderPage()
    await screen.findByText('EM001')
    expect(screen.getByTestId('row-sla-critico')).toBeInTheDocument()
  })

  it('células de tempo em alerta têm role="alert"', async () => {
    renderPage()
    await screen.findByText('EM001')
    // preventiva + crítica = pelo menos 2 alertas
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(2)
  })

  /* ── Botão no topo ────────────────────────────────────────── */
  it('botão "Chamar Próximo" chama chamarProximo com EMERGENCIA', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('EM001')
    await user.click(screen.getByRole('button', { name: /chamar próximo/i }))
    await waitFor(() => expect(chamarProximo).toHaveBeenCalledWith('EMERGENCIA'))
  })

  /* ── Botões por linha ─────────────────────────────────────── */
  it('botão "Ausente" chama marcarAusente com o id da entrada', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('EM001')
    await user.click(screen.getAllByRole('button', { name: /ausente/i })[0])
    await waitFor(() => expect(marcarAusente).toHaveBeenCalledWith('fil-em-1'))
  })

  it('botão "Cancelar" chama sairDaFila com o id da entrada', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('EM001')
    await user.click(screen.getAllByRole('button', { name: /cancelar/i })[0])
    await waitFor(() => expect(sairDaFila).toHaveBeenCalledWith('fil-em-1'))
  })

  it('remove a entrada da lista após marcar ausente', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('EM001')
    await user.click(screen.getAllByRole('button', { name: /ausente/i })[0])
    await waitFor(() => expect(screen.queryByText('EM001')).not.toBeInTheDocument())
  })

  it('exibe "Fila vazia" quando não há entradas', async () => {
    getFila.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/fila vazia/i)).toBeInTheDocument()
  })
})
