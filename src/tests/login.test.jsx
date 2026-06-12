import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'

function renderLogin(loginFn = vi.fn().mockResolvedValue()) {
  useAuth.mockReturnValue({ login: loginFn })
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login — estrutura', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza o título AtendeJá', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: /atendejá/i })).toBeInTheDocument()
  })

  it('renderiza subtítulo', () => {
    renderLogin()
    expect(screen.getByText(/acesse sua área/i)).toBeInTheDocument()
  })

  it('campo CPF/e-mail tem label e autocomplete="off"', () => {
    renderLogin()
    const input = screen.getByLabelText(/cpf ou e-mail/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('autocomplete', 'off')
  })

  it('campo senha tem label e autocomplete="new-password"', () => {
    renderLogin()
    const input = screen.getByLabelText(/^senha/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('autocomplete', 'new-password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('renderiza botão Entrar', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument()
  })

  it('exibe link "Esqueci minha senha"', () => {
    renderLogin()
    expect(screen.getByText(/esqueci minha senha/i)).toBeInTheDocument()
  })

  it('exibe link "Criar conta"', () => {
    renderLogin()
    expect(screen.getByText(/criar conta/i)).toBeInTheDocument()
  })
})

describe('Login — toggle de senha', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exibe ícone Eye e tipo password por padrão', () => {
    renderLogin()
    expect(screen.getByLabelText(/^senha/i)).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: /mostrar senha/i })).toBeInTheDocument()
  })

  it('alterna para texto ao clicar em mostrar senha', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: /mostrar senha/i }))
    expect(screen.getByLabelText(/^senha/i)).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /ocultar senha/i })).toBeInTheDocument()
  })

  it('volta para password ao clicar em ocultar senha', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: /mostrar senha/i }))
    await user.click(screen.getByRole('button', { name: /ocultar senha/i }))
    expect(screen.getByLabelText(/^senha/i)).toHaveAttribute('type', 'password')
  })
})

describe('Login — validação', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exibe erro se CPF/e-mail estiver vazio', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/informe o cpf ou e-mail/i)
  })

  it('exibe erro se senha estiver vazia', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText(/cpf ou e-mail/i), 'carlos@email.com')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/informe a senha/i)
  })

  it('não chama login() quando campos estão vazios', async () => {
    const mockLogin = vi.fn()
    const user = userEvent.setup()
    renderLogin(mockLogin)
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))
    expect(mockLogin).not.toHaveBeenCalled()
  })
})

describe('Login — submit', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama login() com credencial e senha preenchidas', async () => {
    const mockLogin = vi.fn().mockResolvedValue()
    const user = userEvent.setup()
    renderLogin(mockLogin)
    await user.type(screen.getByLabelText(/cpf ou e-mail/i), 'carlos.ferreira@email.com')
    await user.type(screen.getByLabelText(/^senha/i), '123456')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))
    expect(mockLogin).toHaveBeenCalledWith('carlos.ferreira@email.com', '123456')
  })

  it('exibe mensagem de erro quando login() rejeita', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Credenciais inválidas'))
    const user = userEvent.setup()
    renderLogin(mockLogin)
    await user.type(screen.getByLabelText(/cpf ou e-mail/i), 'errado@email.com')
    await user.type(screen.getByLabelText(/^senha/i), 'errada')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/credenciais inválidas/i)
    )
  })

  it('limpa erro anterior ao tentar submeter novamente', async () => {
    const mockLogin = vi.fn()
      .mockRejectedValueOnce(new Error('Credenciais inválidas'))
      .mockResolvedValue()
    const user = userEvent.setup()
    renderLogin(mockLogin)
    await user.type(screen.getByLabelText(/cpf ou e-mail/i), 'email@test.com')
    await user.type(screen.getByLabelText(/^senha/i), 'errada')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    // segunda tentativa
    await user.clear(screen.getByLabelText(/^senha/i))
    await user.type(screen.getByLabelText(/^senha/i), 'certa')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})
