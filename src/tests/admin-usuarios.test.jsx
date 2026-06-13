import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Usuarios from '../pages/admin/Usuarios'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/admin', () => ({
  listarUsuarios:  vi.fn(),
  criarUsuario:    vi.fn(),
  desativarUsuario:vi.fn(),
  excluirUsuario:  vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'
import { listarUsuarios, criarUsuario, desativarUsuario, excluirUsuario } from '../mocks/api/admin'

const mockAdmin  = { id: 'adm-1', nome: 'Roberto Alves', perfil: 'ADMINISTRADOR' }

const mockUsuarios = [
  { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', email: 'carlos.ferreira@email.com', perfil: 'PACIENTE',        status: 'ATIVO'   },
  { id: 'med-1', nome: 'Dr. Eduardo Rezende',     email: 'eduardo.rezende@atendeja.com', perfil: 'MEDICO',       status: 'ATIVO'   },
  { id: 'enf-1', nome: 'Ana Paula Sousa',         email: 'ana.sousa@atendeja.com',      perfil: 'ENFERMEIRO',    status: 'ATIVO'   },
  { id: 'rec-1', nome: 'Juliana Martins',         email: 'juliana.martins@atendeja.com', perfil: 'RECEPCIONISTA', status: 'ATIVO'  },
  { id: 'adm-1', nome: 'Roberto Alves',           email: 'roberto.alves@atendeja.com',  perfil: 'ADMINISTRADOR', status: 'INATIVO' },
]

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockAdmin, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/admin/usuarios']}>
      <Usuarios />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  listarUsuarios.mockResolvedValue(mockUsuarios)
  criarUsuario.mockResolvedValue({ id: 'usr-new-1', nome: 'Novo Usuario', perfil: 'PACIENTE', status: 'ATIVO' })
  desativarUsuario.mockResolvedValue({ id: 'pac-1', status: 'INATIVO' })
  excluirUsuario.mockResolvedValue({ id: 'pac-1' })
})

describe('Usuarios — admin', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /usuários/i })).toBeInTheDocument()
  })

  it('exibe todos os usuários carregados', async () => {
    renderPage()
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
    expect(screen.getByText('Dr. Eduardo Rezende')).toBeInTheDocument()
    expect(screen.getByText('Ana Paula Sousa')).toBeInTheDocument()
    expect(screen.getByText('Juliana Martins')).toBeInTheDocument()
    // Roberto Alves aparece na Sidebar (usuário logado) e na tabela
    expect(screen.getAllByText('Roberto Alves').length).toBeGreaterThanOrEqual(1)
  })

  it('exibe botão "Criar usuário"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /criar usuário/i })).toBeInTheDocument()
  })

  it('exibe formulário ao clicar em "Criar usuário"', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /criar usuário/i }))
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/perfil/i)).toBeInTheDocument()
  })

  it('chama criarUsuario ao submeter o formulário', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /criar usuário/i }))
    await user.type(screen.getByLabelText(/nome/i), 'Novo Usuario')
    await user.type(screen.getByLabelText(/e-mail/i), 'novo@atendeja.com')
    await user.selectOptions(screen.getByLabelText(/perfil/i), 'PACIENTE')
    await user.click(screen.getByRole('button', { name: /^salvar$/i }))
    await waitFor(() =>
      expect(criarUsuario).toHaveBeenCalledWith(expect.objectContaining({
        nome: 'Novo Usuario',
        email: 'novo@atendeja.com',
        perfil: 'PACIENTE',
      }))
    )
  })

  it('filtra por perfil MEDICO mostrando apenas médico', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.click(screen.getByRole('button', { name: /^medico$/i }))
    expect(screen.getByText('Dr. Eduardo Rezende')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Eduardo Ferreira')).not.toBeInTheDocument()
  })

  it('filtra por status INATIVO mostrando apenas inativos', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.click(screen.getByRole('button', { name: /inativo/i }))
    // Badge INATIVO aparece na linha de Roberto Alves (único INATIVO)
    expect(screen.getByText('INATIVO')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Eduardo Ferreira')).not.toBeInTheDocument()
  })

  it('chama desativarUsuario com o id ao clicar em Desativar', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.click(screen.getAllByRole('button', { name: /desativar/i })[0])
    await waitFor(() => expect(desativarUsuario).toHaveBeenCalledWith('pac-1'))
  })

  it('chama excluirUsuario com o id ao clicar em Excluir', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.click(screen.getAllByRole('button', { name: /excluir/i })[0])
    await waitFor(() => expect(excluirUsuario).toHaveBeenCalledWith('pac-1'))
  })

  it('remove usuário da lista após excluir', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Carlos Eduardo Ferreira')
    await user.click(screen.getAllByRole('button', { name: /excluir/i })[0])
    await waitFor(() => expect(screen.queryByText('Carlos Eduardo Ferreira')).not.toBeInTheDocument())
  })
})
