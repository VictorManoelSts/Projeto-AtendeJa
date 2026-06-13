import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Triagem from '../pages/enfermeiro/Triagem'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/triagens', () => ({ salvarTriagem: vi.fn() }))
vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', cpf: '823.456.789-01', dataNascimento: '1990-03-15', prioridade: 'NORMAL'   },
    { id: 'pac-2', nome: 'Maria Aparecida Santos',  cpf: '234.567.890-12', dataNascimento: '1998-07-22', prioridade: 'GESTANTE' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { salvarTriagem } from '../mocks/api/triagens'

const mockEnfermeiro = { id: 'enf-1', nome: 'Enfermeira Joana', perfil: 'ENFERMEIRO' }

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockEnfermeiro, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/enfermeiro/triagem']}>
      <Triagem />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  salvarTriagem.mockResolvedValue({
    id: 'tri-new', idPaciente: 'pac-1', nivelRisco: 2,
    corPulseira: 'LARANJA', tempoMaximoAtendimento: 10, senhaGerada: 'EM001',
  })
})

describe('Triagem — enfermeiro', () => {
  /* ── Cabeçalho ──────────────────────────────────────────── */
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /triagem/i })).toBeInTheDocument()
  })

  /* ── Seção 1 — Busca ─────────────────────────────────────── */
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

  it('exibe "Paciente não encontrado" quando busca sem resultado', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'xyzXYZ999')
    expect(await screen.findByText(/paciente não encontrado/i)).toBeInTheDocument()
  })

  /* ── Seção 2 — Queixa e sintomas ────────────────────────── */
  it('exibe textarea "Queixa principal" com label associado', () => {
    renderPage()
    expect(screen.getByLabelText(/queixa principal/i)).toBeInTheDocument()
  })

  it('exibe textarea "Sintomas apresentados" com label associado', () => {
    renderPage()
    expect(screen.getByLabelText(/sintomas/i)).toBeInTheDocument()
  })

  /* ── Seção 3 — Sinais vitais ─────────────────────────────── */
  it('exibe campo de temperatura', () => {
    renderPage()
    expect(screen.getByLabelText(/temperatura/i)).toBeInTheDocument()
  })

  it('exibe campo de pressão arterial', () => {
    renderPage()
    expect(screen.getByLabelText(/pressão arterial/i)).toBeInTheDocument()
  })

  it('exibe campo de frequência cardíaca', () => {
    renderPage()
    expect(screen.getByLabelText(/frequência cardíaca/i)).toBeInTheDocument()
  })

  it('exibe campo de saturação de O₂', () => {
    renderPage()
    expect(screen.getByLabelText(/saturação/i)).toBeInTheDocument()
  })

  it('slider de nível de dor inicia em 0', () => {
    renderPage()
    expect(screen.getByRole('slider')).toHaveValue('0')
  })

  it('slider atualiza data-testid="dor-valor" ao mover', () => {
    renderPage()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '7' } })
    expect(screen.getByTestId('dor-valor')).toHaveTextContent('7')
  })

  /* ── Seção 4 — Classificação Manchester ─────────────────── */
  it('exibe 5 botões de classificação Manchester', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Emergência'    })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Muito urgente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Urgente'       })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pouco urgente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Não urgente'   })).toBeInTheDocument()
  })

  it('ao selecionar nível 2 exibe PulseiraBadge e tempo máximo de 10 min', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Muito urgente' }))
    expect(await screen.findByTestId('pulseira-circle')).toBeInTheDocument()
    expect(screen.getByTestId('tempo-maximo')).toHaveTextContent('10')
  })

  /* ── Submit ──────────────────────────────────────────────── */
  it('exibe botão "Salvar triagem e inserir na fila EM"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /salvar triagem/i })).toBeInTheDocument()
  })

  it('chama salvarTriagem com dados corretos ao submeter', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.type(screen.getByLabelText(/queixa principal/i), 'Dor de cabeça')
    await user.click(screen.getByRole('button', { name: 'Muito urgente' }))
    await user.click(screen.getByRole('button', { name: /salvar triagem/i }))
    await waitFor(() =>
      expect(salvarTriagem).toHaveBeenCalledWith(expect.objectContaining({
        idPaciente:      'pac-1',
        queixaPrincipal: 'Dor de cabeça',
        nivelRisco:      2,
        perfil:          'ENFERMEIRO',
      }))
    )
  })

  it('exibe senha EM gerada na confirmação após salvar', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.type(screen.getByLabelText(/queixa principal/i), 'Dor de cabeça')
    await user.click(screen.getByRole('button', { name: 'Muito urgente' }))
    await user.click(screen.getByRole('button', { name: /salvar triagem/i }))
    expect(await screen.findByText('EM001')).toBeInTheDocument()
  })

  it('exibe erro ao salvar sem campos obrigatórios preenchidos', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /salvar triagem/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('exibe erro quando salvarTriagem rejeita', async () => {
    const user = userEvent.setup()
    salvarTriagem.mockRejectedValue(new Error('Paciente já possui fila ativa'))
    renderPage()
    await user.type(screen.getByPlaceholderText(/cpf ou nome/i), 'Carlos')
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.type(screen.getByLabelText(/queixa principal/i), 'Dor')
    await user.click(screen.getByRole('button', { name: 'Muito urgente' }))
    await user.click(screen.getByRole('button', { name: /salvar triagem/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
