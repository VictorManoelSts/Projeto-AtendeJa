import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Medicos from '../pages/admin/Medicos'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/admin', () => ({
  listarMedicos:       vi.fn(),
  cadastrarMedico:     vi.fn(),
  vincularUnidade:     vi.fn(),
  alterarStatusMedico: vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'
import { listarMedicos, cadastrarMedico, vincularUnidade, alterarStatusMedico } from '../mocks/api/admin'

const mockAdmin = { id: 'adm-1', nome: 'Roberto Alves', perfil: 'ADMINISTRADOR' }

const mockMedicos = [
  { id: 'med-1', nome: 'Dr. Eduardo Rezende',     crm: 'CRM/SP 123456-7', especialidade: 'Clínica Geral', status: 'ATIVO'    },
  { id: 'med-2', nome: 'Dra. Fernanda Oliveira',  crm: 'CRM/SP 234567-8', especialidade: 'Cardiologia',   status: 'ATIVO'    },
  { id: 'med-3', nome: 'Dr. Marcos Augusto Nunes',crm: 'CRM/RJ 345678-9', especialidade: 'Ortopedia',     status: 'PLANTAO'  },
  { id: 'med-4', nome: 'Dra. Luciana Campos',     crm: 'CRM/SP 456789-0', especialidade: 'Ginecologia',   status: 'FERIAS'   },
  { id: 'med-5', nome: 'Dr. Henrique Bastos',     crm: 'CRM/MG 567890-1', especialidade: 'Urgência',      status: 'LICENCA'  },
]

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockAdmin, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/admin/medicos']}>
      <Medicos />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  listarMedicos.mockResolvedValue(mockMedicos)
  cadastrarMedico.mockResolvedValue({ id: 'med-new-1', nome: 'Dr. Novo', status: 'ATIVO' })
  vincularUnidade.mockResolvedValue({ id: 'med-1', idUnidade: 'uni-1' })
  alterarStatusMedico.mockResolvedValue({ id: 'med-1', status: 'FERIAS' })
})

describe('Medicos — admin', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /médicos/i })).toBeInTheDocument()
  })

  it('exibe os nomes de todos os médicos', async () => {
    renderPage()
    expect(await screen.findByText('Dr. Eduardo Rezende')).toBeInTheDocument()
    expect(screen.getByText('Dra. Fernanda Oliveira')).toBeInTheDocument()
    expect(screen.getByText('Dr. Marcos Augusto Nunes')).toBeInTheDocument()
  })

  it('exibe StatusBadge para cada médico', async () => {
    renderPage()
    await screen.findByText('Dr. Eduardo Rezende')
    // 5 médicos → 5 status badges
    expect(screen.getAllByTestId('status-badge').length).toBeGreaterThanOrEqual(5)
  })

  it('exibe botão "Cadastrar médico"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /cadastrar médico/i })).toBeInTheDocument()
  })

  it('exibe formulário com campos ao clicar em "Cadastrar médico"', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /cadastrar médico/i }))
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/crm/i)).toBeInTheDocument()
  })

  it('chama cadastrarMedico ao submeter o formulário', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /cadastrar médico/i }))
    await user.type(screen.getByLabelText(/nome/i), 'Dr. Novo')
    await user.type(screen.getByLabelText(/crm/i), 'CRM/SP 999999-9')
    await user.click(screen.getByRole('button', { name: /^salvar$/i }))
    await waitFor(() =>
      expect(cadastrarMedico).toHaveBeenCalledWith(expect.objectContaining({
        nome: 'Dr. Novo',
        crm:  'CRM/SP 999999-9',
      }))
    )
  })

  it('exibe input de unidade ao clicar em "Vincular unidade"', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Dr. Eduardo Rezende')
    await user.click(screen.getAllByRole('button', { name: /vincular unidade/i })[0])
    expect(screen.getByPlaceholderText(/id da unidade/i)).toBeInTheDocument()
  })

  it('chama vincularUnidade ao confirmar', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Dr. Eduardo Rezende')
    await user.click(screen.getAllByRole('button', { name: /vincular unidade/i })[0])
    await user.type(screen.getByPlaceholderText(/id da unidade/i), 'uni-1')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    await waitFor(() => expect(vincularUnidade).toHaveBeenCalledWith('med-1', 'uni-1'))
  })

  it('chama alterarStatusMedico ao mudar o select de status', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Dr. Eduardo Rezende')
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'FERIAS')
    await waitFor(() => expect(alterarStatusMedico).toHaveBeenCalledWith('med-1', 'FERIAS'))
  })

  it('exibe o status atual no select do primeiro médico', async () => {
    renderPage()
    await screen.findByText('Dr. Eduardo Rezende')
    const selects = screen.getAllByRole('combobox')
    expect(selects[0].value).toBe('ATIVO')
  })
})
