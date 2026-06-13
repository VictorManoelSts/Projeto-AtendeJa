import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Atendimento from '../pages/medico/Atendimento'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/prontuario', () => ({
  getProntuario: vi.fn(),
  atualizarProntuario: vi.fn(),
}))
vi.mock('../mocks/api/fila', () => ({ encerrarAtendimento: vi.fn() }))
vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', dataNascimento: '1990-03-15', prioridade: 'NORMAL' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { getProntuario, atualizarProntuario } from '../mocks/api/prontuario'
import { encerrarAtendimento } from '../mocks/api/fila'

const mockMedico = { id: 'med-1', nome: 'Dr. Eduardo Rezende', perfil: 'MEDICO' }

const mockProntuario = {
  id: 'prt-1',
  idPaciente: 'pac-1',
  historicoClinco: 'Paciente sem comorbidades.',
  alergias: ['dipirona'],
  doencasCronicas: ['hipertensão'],
  medicamentosUsoContinuo: [],
}

function renderPage(idPaciente = 'pac-1', idFila = 'fil-1') {
  useAuth.mockReturnValue({ usuario: mockMedico, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={[`/medico/atendimento/${idPaciente}/${idFila}`]}>
      <Routes>
        <Route path="/medico/atendimento/:idPaciente/:idFila" element={<Atendimento />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getProntuario.mockResolvedValue(mockProntuario)
  atualizarProntuario.mockResolvedValue({ ...mockProntuario })
  encerrarAtendimento.mockResolvedValue({ id: 'fil-1', status: 'FINALIZADO' })
})

describe('Atendimento — médico', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /atendimento/i })).toBeInTheDocument()
  })

  it('exibe o nome do paciente', async () => {
    renderPage()
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
  })

  it('exibe a idade do paciente', async () => {
    renderPage()
    const el = await screen.findByTestId('paciente-idade')
    expect(el).toHaveTextContent(/\d+ anos/)
  })

  it('exibe o histórico clínico do prontuário', async () => {
    renderPage()
    expect(await screen.findByText('Paciente sem comorbidades.')).toBeInTheDocument()
  })

  it('exibe as alergias do paciente', async () => {
    renderPage()
    expect(await screen.findByText('dipirona')).toBeInTheDocument()
  })

  it('exibe campo "Queixa principal"', () => {
    renderPage()
    expect(screen.getByLabelText(/queixa principal/i)).toBeInTheDocument()
  })

  it('exibe campo "Diagnóstico"', () => {
    renderPage()
    expect(screen.getByLabelText(/diagnóstico/i)).toBeInTheDocument()
  })

  it('exibe campo "Observações"', () => {
    renderPage()
    expect(screen.getByLabelText(/observações/i)).toBeInTheDocument()
  })

  it('exibe botão "Solicitar Exame"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /solicitar exame/i })).toBeInTheDocument()
  })

  it('exibe botão "Emitir Prescrição"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /emitir prescrição/i })).toBeInTheDocument()
  })

  it('exibe botão "Finalizar Atendimento"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /finalizar atendimento/i })).toBeInTheDocument()
  })

  it('ao finalizar chama atualizarProntuario e encerrarAtendimento', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Paciente sem comorbidades.')
    await user.click(screen.getByRole('button', { name: /finalizar atendimento/i }))
    await waitFor(() => {
      expect(atualizarProntuario).toHaveBeenCalledWith('prt-1', expect.any(Object))
      expect(encerrarAtendimento).toHaveBeenCalledWith('fil-1')
    })
  })

  it('exibe erro quando atualizarProntuario rejeita', async () => {
    const user = userEvent.setup()
    atualizarProntuario.mockRejectedValue(new Error('Falha ao salvar'))
    renderPage()
    await screen.findByText('Paciente sem comorbidades.')
    await user.click(screen.getByRole('button', { name: /finalizar atendimento/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
