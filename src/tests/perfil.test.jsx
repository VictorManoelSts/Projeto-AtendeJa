import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Perfil from '../pages/paciente/Perfil'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    {
      id: 'pac-1',
      nome: 'Carlos Eduardo Ferreira',
      cpf: '823.456.789-01',
      dataNascimento: '1990-03-15',
      sexo: 'M',
      telefone: '(11) 98234-5678',
      email: 'carlos.ferreira@email.com',
      tipoSanguineo: 'O+',
      prioridade: 'NORMAL',
    },
  ],
}))

import { useAuth } from '../contexts/AuthContext'

const mockUsuario = { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', email: 'carlos.ferreira@email.com', perfil: 'PACIENTE' }

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockUsuario, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/paciente/perfil']}>
      <Perfil />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Perfil — paciente', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /perfil/i })).toBeInTheDocument()
  })

  it('exibe o nome completo do paciente', () => {
    renderPage()
    expect(screen.getAllByText('Carlos Eduardo Ferreira').length).toBeGreaterThan(0)
  })

  it('exibe o CPF', () => {
    renderPage()
    expect(screen.getByText('823.456.789-01')).toBeInTheDocument()
  })

  it('exibe o e-mail', () => {
    renderPage()
    expect(screen.getByText('carlos.ferreira@email.com')).toBeInTheDocument()
  })

  it('exibe a data de nascimento formatada', () => {
    renderPage()
    // "1990-03-15" → "15/03/1990"
    expect(screen.getByText('15/03/1990')).toBeInTheDocument()
  })

  it('exibe o tipo sanguíneo', () => {
    renderPage()
    expect(screen.getByText('O+')).toBeInTheDocument()
  })

  it('exibe o telefone', () => {
    renderPage()
    expect(screen.getByText('(11) 98234-5678')).toBeInTheDocument()
  })

  it('exibe botão "Editar"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
  })

  it('exibe botão "Alterar Senha"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /alterar senha/i })).toBeInTheDocument()
  })

  it('exibe botão "Exportar Dados"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /exportar dados/i })).toBeInTheDocument()
  })
})
