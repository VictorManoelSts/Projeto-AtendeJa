import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProntuarioPaciente from '../pages/medico/ProntuarioPaciente'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../mocks/api/prontuario', () => ({ getProntuario: vi.fn() }))
vi.mock('../mocks/data/consultas', () => ({
  consultas: [
    { id: 'con-1', idMedico: 'med-1', idPaciente: 'pac-1', dataHora: '2026-05-10T09:00:00', tipoConsulta: 'CONSULTA_INICIAL', status: 'CONCLUIDO', motivoConsulta: 'Cefaleia persistente', contadorCancelamentos: 0 },
    { id: 'con-2', idMedico: 'med-2', idPaciente: 'pac-3', dataHora: '2026-05-15T10:00:00', tipoConsulta: 'RETORNO',          status: 'CONCLUIDO', motivoConsulta: 'Acompanhamento HAS',   contadorCancelamentos: 0 },
  ],
}))
vi.mock('../mocks/data/pacientes', () => ({
  pacientes: [
    { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', dataNascimento: '1990-03-15', prioridade: 'NORMAL' },
  ],
}))

import { useAuth } from '../contexts/AuthContext'
import { getProntuario } from '../mocks/api/prontuario'

const mockMedico = { id: 'med-1', nome: 'Dr. Eduardo Rezende', perfil: 'MEDICO' }

const mockProntuario = {
  id: 'prt-1',
  idPaciente: 'pac-1',
  historicoClinco: 'Sem comorbidades conhecidas.',
  alergias: ['dipirona'],
  doencasCronicas: ['hipertensão'],
  medicamentosUsoContinuo: ['losartana 50 mg/dia'],
}

function renderPage(idPaciente = 'pac-1', medico = mockMedico) {
  useAuth.mockReturnValue({ usuario: medico, logout: vi.fn() })
  render(
    <MemoryRouter initialEntries={[`/medico/prontuario/${idPaciente}`]}>
      <Routes>
        <Route path="/medico/prontuario/:idPaciente" element={<ProntuarioPaciente />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getProntuario.mockResolvedValue(mockProntuario)
})

describe('ProntuarioPaciente — médico', () => {
  it('renderiza o título da página', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /prontuário/i })).toBeInTheDocument()
  })

  it('exibe o nome do paciente', async () => {
    renderPage()
    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
  })

  it('exibe histórico clínico', async () => {
    renderPage()
    expect(await screen.findByText('Sem comorbidades conhecidas.')).toBeInTheDocument()
  })

  it('exibe diagnósticos (doencasCronicas)', async () => {
    renderPage()
    expect(await screen.findByText('hipertensão')).toBeInTheDocument()
  })

  it('exibe alergias', async () => {
    renderPage()
    expect(await screen.findByText('dipirona')).toBeInTheDocument()
  })

  it('exibe medicamentos de uso contínuo', async () => {
    renderPage()
    expect(await screen.findByText('losartana 50 mg/dia')).toBeInTheDocument()
  })

  it('exibe consultas anteriores do paciente com este médico', async () => {
    renderPage()
    expect(await screen.findByText(/cefaleia persistente/i)).toBeInTheDocument()
  })

  it('não exibe consultas de outros médicos', async () => {
    renderPage()
    await screen.findByText('Carlos Eduardo Ferreira')
    expect(screen.queryByText(/acompanhamento has/i)).not.toBeInTheDocument()
  })

  it('exibe "Acesso não autorizado" quando médico não tem vínculo com o paciente', async () => {
    const medicoSemVinculo = { id: 'med-99', nome: 'Sem Vínculo', perfil: 'MEDICO' }
    renderPage('pac-1', medicoSemVinculo)
    expect(await screen.findByText(/acesso não autorizado/i)).toBeInTheDocument()
  })

  it('exibe erro quando getProntuario rejeita', async () => {
    getProntuario.mockRejectedValue(new Error('Prontuário não encontrado'))
    renderPage()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
