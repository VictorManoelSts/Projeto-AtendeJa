import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Prontuario from '../pages/paciente/Prontuario'

vi.mock('../contexts/AuthContext',  () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/prontuario',  () => ({ getProntuario: vi.fn() }))

import { useAuth } from '../contexts/AuthContext'
import { getProntuario } from '../mocks/api/prontuario'

const mockUsuario = { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', perfil: 'PACIENTE' }

const prontuarioCompleto = {
  id: 'prt-1',
  idPaciente: 'pac-1',
  historicoClinco: 'Paciente sem comorbidades. Episódio de cefaleia.',
  alergias: ['dipirona', 'penicilina'],
  doencasCronicas: ['hipertensão arterial'],
  medicamentosUsoContinuo: ['losartana 50 mg/dia'],
}

function renderPage() {
  useAuth.mockReturnValue({ usuario: mockUsuario, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={['/paciente/prontuario']}>
      <Prontuario />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getProntuario.mockResolvedValue({ ...prontuarioCompleto })
})

describe('Prontuario — paciente', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /prontu/i })).toBeInTheDocument()
  })

  it('chama getProntuario com o id do paciente ao montar', async () => {
    renderPage()
    await waitFor(() => expect(getProntuario).toHaveBeenCalledWith('pac-1'))
  })

  it('exibe o histórico clínico', async () => {
    renderPage()
    expect(await screen.findByText(/cefaleia/i)).toBeInTheDocument()
  })

  it('exibe cada alergia listada', async () => {
    renderPage()
    expect(await screen.findByText('dipirona')).toBeInTheDocument()
    expect(screen.getByText('penicilina')).toBeInTheDocument()
  })

  it('exibe cada doença crônica', async () => {
    renderPage()
    expect(await screen.findByText(/hipertens/i)).toBeInTheDocument()
  })

  it('exibe cada medicamento de uso contínuo', async () => {
    renderPage()
    expect(await screen.findByText(/losartana/i)).toBeInTheDocument()
  })

  it('exibe aviso quando não há alergias registradas', async () => {
    getProntuario.mockResolvedValue({ ...prontuarioCompleto, alergias: [] })
    renderPage()
    expect(await screen.findByText(/nenhuma alergia/i)).toBeInTheDocument()
  })

  it('exibe aviso quando não há doenças crônicas', async () => {
    getProntuario.mockResolvedValue({ ...prontuarioCompleto, doencasCronicas: [] })
    renderPage()
    expect(await screen.findByText(/nenhuma doença/i)).toBeInTheDocument()
  })

  it('exibe mensagem de erro quando getProntuario rejeita', async () => {
    getProntuario.mockRejectedValue(new Error('Prontuário não encontrado'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent(/não encontrado/i)
  })

  it('não renderiza nenhum campo editável (sem inputs nem textareas)', async () => {
    renderPage()
    await screen.findByText(/cefaleia/i)
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
  })
})
