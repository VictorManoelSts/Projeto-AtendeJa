import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Checkin from '../pages/paciente/Checkin'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/consultas', () => ({ listar: vi.fn() }))
vi.mock('../mocks/api/fila',      () => ({ entrarNaFila: vi.fn() }))
vi.mock('../mocks/data/medicos', () => ({
  medicos: [
    { id: 'med-1', nome: 'Dr. Eduardo Rezende', especialidade: 'Clínica Geral', status: 'ATIVO' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { listar } from '../mocks/api/consultas'
import { entrarNaFila } from '../mocks/api/fila'

const mockUsuario = { id: 'pac-1', nome: 'Carlos Ferreira', perfil: 'PACIENTE' }

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockUsuario, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/paciente/checkin']}>
      <Checkin />
    </MemoryRouter>
  )
}

function isoEmMinutos(minutos) {
  const d = new Date(Date.now() + minutos * 60_000)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

beforeEach(() => {
  vi.clearAllMocks()
  listar.mockResolvedValue([])
  entrarNaFila.mockResolvedValue({ id: 'fil-1', senha: 'CM001', status: 'AGUARDANDO' })
})

describe('Checkin — paciente', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /check-in/i })).toBeInTheDocument()
  })

  it('exibe mensagem quando não há consulta disponível para check-in', async () => {
    listar.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/sem consulta disponível/i)).toBeInTheDocument()
  })

  it('exibe nome do médico da próxima consulta', async () => {
    listar.mockResolvedValue([{
      id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
      dataHora: isoEmMinutos(20), status: 'AGENDADO',
      tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0,
    }])
    renderPage()
    expect(await screen.findByText('Dr. Eduardo Rezende')).toBeInTheDocument()
  })

  it('botão "Confirmar presença" está habilitado quando consulta é em ≤ 30 min', async () => {
    listar.mockResolvedValue([{
      id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
      dataHora: isoEmMinutos(20), status: 'AGENDADO',
      tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0,
    }])
    renderPage()
    const btn = await screen.findByRole('button', { name: /confirmar presença/i })
    expect(btn).not.toBeDisabled()
  })

  it('botão "Confirmar presença" está desabilitado quando consulta é em > 30 min', async () => {
    listar.mockResolvedValue([{
      id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
      dataHora: isoEmMinutos(60), status: 'AGENDADO',
      tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0,
    }])
    renderPage()
    const btn = await screen.findByRole('button', { name: /confirmar presença/i })
    expect(btn).toBeDisabled()
  })

  it('chama entrarNaFila com idPaciente e tipo correto (CONSULTA_INICIAL → CONSULTA)', async () => {
    const user = userEvent.setup()
    listar.mockResolvedValue([{
      id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
      dataHora: isoEmMinutos(15), status: 'AGENDADO',
      tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0,
    }])
    renderPage()
    await user.click(await screen.findByRole('button', { name: /confirmar presença/i }))
    await waitFor(() => expect(entrarNaFila).toHaveBeenCalledWith('pac-1', 'CONSULTA'))
  })

  it('exibe a senha da fila após confirmar presença com sucesso', async () => {
    const user = userEvent.setup()
    listar.mockResolvedValue([{
      id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
      dataHora: isoEmMinutos(15), status: 'AGENDADO',
      tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0,
    }])
    renderPage()
    await user.click(await screen.findByRole('button', { name: /confirmar presença/i }))
    expect(await screen.findByText('CM001')).toBeInTheDocument()
  })

  it('exibe erro quando entrarNaFila() rejeita', async () => {
    entrarNaFila.mockRejectedValue(new Error('Paciente já possui uma fila ativa'))
    const user = userEvent.setup()
    listar.mockResolvedValue([{
      id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
      dataHora: isoEmMinutos(15), status: 'AGENDADO',
      tipoConsulta: 'CONSULTA_INICIAL', contadorCancelamentos: 0,
    }])
    renderPage()
    await user.click(await screen.findByRole('button', { name: /confirmar presença/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/fila ativa/i)
  })

  it('consulta CONFIRMADO também aparece para check-in', async () => {
    listar.mockResolvedValue([{
      id: 'con-1', idPaciente: 'pac-1', idMedico: 'med-1',
      dataHora: isoEmMinutos(10), status: 'CONFIRMADO',
      tipoConsulta: 'RETORNO', contadorCancelamentos: 0,
    }])
    renderPage()
    expect(await screen.findByRole('button', { name: /confirmar presença/i })).toBeInTheDocument()
  })
})
