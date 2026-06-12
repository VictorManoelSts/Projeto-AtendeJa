import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Agendamento from '../pages/paciente/Agendamento'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/consultas',  () => ({ agendar: vi.fn() }))
vi.mock('../mocks/data/medicos', () => ({
  medicos: [
    { id: 'med-1', nome: 'Dr. Eduardo Rezende',  especialidade: 'Clínica Geral', status: 'ATIVO' },
    { id: 'med-2', nome: 'Dra. Fernanda Oliveira', especialidade: 'Cardiologia',   status: 'ATIVO' },
    { id: 'med-4', nome: 'Dra. Luciana Campos',  especialidade: 'Ginecologia',    status: 'FERIAS' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { agendar } from '../mocks/api/consultas'

const mockUsuario = { id: 'pac-1', nome: 'Carlos Ferreira', perfil: 'PACIENTE' }

function renderAgendamento() {
  useAuth.mockReturnValue({ usuario: mockUsuario, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/paciente/agendamento']}>
      <Agendamento />
    </MemoryRouter>
  )
}

async function preencherFormulario(user) {
  await user.selectOptions(screen.getByLabelText(/especialidade/i), 'Clínica Geral')
  await user.selectOptions(screen.getByLabelText(/tipo/i), 'CONSULTA_INICIAL')
  await user.selectOptions(screen.getByLabelText(/médico/i), 'med-1')
  await user.type(screen.getByLabelText(/data/i), '2026-12-20')
  await user.type(screen.getByLabelText(/horário/i), '09:00')
}

beforeEach(() => {
  vi.clearAllMocks()
  agendar.mockResolvedValue({ id: 'con-new', status: 'AGENDADO' })
})

describe('Agendamento — paciente', () => {
  it('renderiza campo especialidade com label', () => {
    renderAgendamento()
    expect(screen.getByLabelText(/especialidade/i)).toBeInTheDocument()
  })

  it('campo tipo tem as opções CONSULTA_INICIAL e RETORNO', () => {
    renderAgendamento()
    expect(screen.getByRole('option', { name: /consulta inicial/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /retorno/i })).toBeInTheDocument()
  })

  it('renderiza campo médico com label', () => {
    renderAgendamento()
    expect(screen.getByLabelText(/médico/i)).toBeInTheDocument()
  })

  it('renderiza campos data e horário', () => {
    renderAgendamento()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/horário/i)).toBeInTheDocument()
  })

  it('filtra médicos por especialidade mostrando somente ATIVO/PLANTAO', async () => {
    const user = userEvent.setup()
    renderAgendamento()
    await user.selectOptions(screen.getByLabelText(/especialidade/i), 'Clínica Geral')
    const medicoSelect = screen.getByLabelText(/médico/i)
    expect(medicoSelect).toHaveTextContent('Dr. Eduardo Rezende')
    expect(medicoSelect).not.toHaveTextContent('Dra. Luciana Campos')
  })

  it('não mostra médicos de outras especialidades', async () => {
    const user = userEvent.setup()
    renderAgendamento()
    await user.selectOptions(screen.getByLabelText(/especialidade/i), 'Clínica Geral')
    expect(screen.getByLabelText(/médico/i)).not.toHaveTextContent('Dra. Fernanda Oliveira')
  })

  it('exibe erro de validação ao submeter sem preencher campos', async () => {
    const user = userEvent.setup()
    renderAgendamento()
    await user.click(screen.getByRole('button', { name: /^agendar$/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('não chama agendar() quando campos estão vazios', async () => {
    const user = userEvent.setup()
    renderAgendamento()
    await user.click(screen.getByRole('button', { name: /^agendar$/i }))
    expect(agendar).not.toHaveBeenCalled()
  })

  it('chama agendar() com os dados corretos ao submeter', async () => {
    const user = userEvent.setup()
    renderAgendamento()
    await preencherFormulario(user)
    await user.click(screen.getByRole('button', { name: /^agendar$/i }))
    await waitFor(() => expect(agendar).toHaveBeenCalled())
    expect(agendar).toHaveBeenCalledWith(expect.objectContaining({
      idPaciente: 'pac-1',
      idMedico: 'med-1',
      tipoConsulta: 'CONSULTA_INICIAL',
    }))
  })

  it('exibe mensagem de sucesso após agendar', async () => {
    const user = userEvent.setup()
    renderAgendamento()
    await preencherFormulario(user)
    await user.click(screen.getByRole('button', { name: /^agendar$/i }))
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
    expect(screen.getByRole('status')).toHaveTextContent(/sucesso/i)
  })

  it('exibe erro quando agendar() rejeita', async () => {
    agendar.mockRejectedValue(new Error('Médico indisponível'))
    const user = userEvent.setup()
    renderAgendamento()
    await preencherFormulario(user)
    await user.click(screen.getByRole('button', { name: /^agendar$/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent(/médico indisponível/i)
  })

  it('botão Cancelar limpa o formulário', async () => {
    const user = userEvent.setup()
    renderAgendamento()
    await user.selectOptions(screen.getByLabelText(/especialidade/i), 'Clínica Geral')
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByLabelText(/especialidade/i)).toHaveValue('')
  })
})
