import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Agenda from '../pages/medico/Agenda'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))

vi.mock('../mocks/data/consultas', () => {
  const hoje = new Date().toISOString().slice(0, 10)
  return {
    consultas: [
      { id: 'con-a1', idMedico: 'med-1', idPaciente: 'pac-1', dataHora: `${hoje}T09:00:00`, status: 'AGENDADO',        tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0 },
      { id: 'con-a2', idMedico: 'med-1', idPaciente: 'pac-4', dataHora: `${hoje}T10:30:00`, status: 'EM_ATENDIMENTO',  tipoConsulta: 'RETORNO',          contadorCancelamentos: 0 },
      { id: 'con-a3', idMedico: 'med-1', idPaciente: 'pac-1', dataHora: `${hoje}T14:00:00`, status: 'CONFIRMADO',      tipoConsulta: 'RETORNO',          contadorCancelamentos: 0 },
      // outro médico — não deve aparecer
      { id: 'con-a4', idMedico: 'med-2', idPaciente: 'pac-3', dataHora: `${hoje}T11:00:00`, status: 'AGENDADO',        tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0 },
    ],
  }
})

vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', dataNascimento: '1990-03-15', prioridade: 'NORMAL' },
    { id: 'pac-4', nome: 'Benedita Rosa Carvalho',  dataNascimento: '1942-05-08', prioridade: 'IDOSO_80_MAIS' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'

const mockMedico = { id: 'med-1', nome: 'Dr. Eduardo Rezende', perfil: 'MEDICO' }

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockMedico, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/medico/agenda']}>
      <Agenda />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Agenda — médico', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /agenda/i })).toBeInTheDocument()
  })

  it('lista os horários das consultas do médico no dia', () => {
    renderPage()
    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.getByText('10:30')).toBeInTheDocument()
    expect(screen.getByText('14:00')).toBeInTheDocument()
  })

  it('não exibe consultas de outro médico', () => {
    renderPage()
    // con-a4 é de med-2 às 11:00 — não deve aparecer
    expect(screen.queryByText('11:00')).not.toBeInTheDocument()
  })

  it('exibe o nome do paciente de cada consulta', () => {
    renderPage()
    expect(screen.getAllByText('Carlos Eduardo Ferreira').length).toBeGreaterThan(0)
    expect(screen.getByText('Benedita Rosa Carvalho')).toBeInTheDocument()
  })

  it('exibe StatusBadge para cada item da agenda', () => {
    renderPage()
    expect(screen.getByText('AGENDADO')).toBeInTheDocument()
    expect(screen.getByText('EM_ATENDIMENTO')).toBeInTheDocument()
    expect(screen.getByText('CONFIRMADO')).toBeInTheDocument()
  })

  it('destaca o item EM_ATENDIMENTO com data-testid="agenda-item-atual"', () => {
    renderPage()
    const itemAtual = screen.getByTestId('agenda-item-atual')
    expect(itemAtual).toBeInTheDocument()
  })

  it('o item atual contém a hora 10:30 e "Benedita"', () => {
    renderPage()
    const itemAtual = screen.getByTestId('agenda-item-atual')
    expect(itemAtual).toHaveTextContent('10:30')
    expect(itemAtual).toHaveTextContent('Benedita')
  })

  it('exibe 3 itens para este médico (excluindo med-2)', () => {
    renderPage()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('exibe "Sem consultas agendadas" quando não há consultas para o dia', () => {
    // Médico sem consultas no mock (med-9 não existe nos dados)
    useAuth.mockReturnValue({ usuario: { id: 'med-9', nome: 'Sem Consultas', perfil: 'MEDICO' }, logout: vi.fn() })
    render(
      <MemoryRouter initialEntries={['/medico/agenda']}>
        <Agenda />
      </MemoryRouter>
    )
    expect(screen.getByText(/sem consultas agendadas/i)).toBeInTheDocument()
  })
})
