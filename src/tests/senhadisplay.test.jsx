import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SenhaDisplay from '../components/ui/SenhaDisplay'
import FilaCard from '../components/ui/FilaCard'
import Sidebar from '../components/ui/Sidebar'

// ─── SenhaDisplay ─────────────────────────────────────────────────────────────

describe('SenhaDisplay', () => {
  it('renderiza a senha', () => {
    render(<SenhaDisplay senha="CM023" />)
    expect(screen.getByText('CM023')).toBeInTheDocument()
  })

  it('usa --font-mono no estilo', () => {
    render(<SenhaDisplay senha="CM023" />)
    expect(screen.getByText('CM023').getAttribute('style')).toContain('var(--font-mono)')
  })

  it('usa --text-2xl no estilo', () => {
    render(<SenhaDisplay senha="CM023" />)
    expect(screen.getByText('CM023').getAttribute('style')).toContain('var(--text-2xl)')
  })

  it('usa --color-primary no estilo', () => {
    render(<SenhaDisplay senha="CM023" />)
    expect(screen.getByText('CM023').getAttribute('style')).toContain('var(--color-primary)')
  })

  it('aplica letter-spacing 0.05em', () => {
    render(<SenhaDisplay senha="CM023" />)
    expect(screen.getByText('CM023').getAttribute('style')).toContain('0.05em')
  })
})

// ─── FilaCard ────────────────────────────────────────────────────────────────

const pacienteBase = {
  id: 'pac-1',
  nome: 'Carlos Ferreira',
  senha: 'C001',
  nivelRisco: 3,
  prioridade: 'NORMAL',
}

// SLA nível 3 = 60 min → crítico quando tempoEstimado ≤ 12 min
describe('FilaCard', () => {
  it('exibe a senha via SenhaDisplay', () => {
    render(
      <FilaCard paciente={pacienteBase} posicao={2} tempoEstimado={30} status="AGUARDANDO" onSairDaFila={vi.fn()} />
    )
    expect(screen.getByText('C001')).toBeInTheDocument()
  })

  it('exibe a posição na fila', () => {
    render(
      <FilaCard paciente={pacienteBase} posicao={2} tempoEstimado={30} status="AGUARDANDO" onSairDaFila={vi.fn()} />
    )
    expect(screen.getByText(/posição.*2/i)).toBeInTheDocument()
  })

  it('exibe o tempo estimado', () => {
    render(
      <FilaCard paciente={pacienteBase} posicao={2} tempoEstimado={30} status="AGUARDANDO" onSairDaFila={vi.fn()} />
    )
    expect(screen.getByText(/30/)).toBeInTheDocument()
  })

  it('exibe o StatusBadge com o status correto', () => {
    render(
      <FilaCard paciente={pacienteBase} posicao={2} tempoEstimado={30} status="CHAMADO" onSairDaFila={vi.fn()} />
    )
    expect(screen.getByText('CHAMADO')).toBeInTheDocument()
  })

  it('exibe alerta role="alert" quando tempoEstimado <= 20% do SLA', () => {
    render(
      <FilaCard paciente={pacienteBase} posicao={2} tempoEstimado={10} status="AGUARDANDO" onSairDaFila={vi.fn()} />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('não exibe alerta quando tempoEstimado > 20% do SLA', () => {
    render(
      <FilaCard paciente={pacienteBase} posicao={2} tempoEstimado={30} status="AGUARDANDO" onSairDaFila={vi.fn()} />
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('exibe PulseiraBadge quando nivelRisco está presente', () => {
    const { container } = render(
      <FilaCard paciente={pacienteBase} posicao={1} tempoEstimado={40} status="AGUARDANDO" onSairDaFila={vi.fn()} />
    )
    expect(container.querySelector('[data-testid="pulseira-circle"]')).toBeInTheDocument()
  })

  it('não exibe PulseiraBadge quando nivelRisco é null', () => {
    const pacienteSemRisco = { ...pacienteBase, nivelRisco: null }
    const { container } = render(
      <FilaCard paciente={pacienteSemRisco} posicao={1} tempoEstimado={40} status="AGUARDANDO" onSairDaFila={vi.fn()} />
    )
    expect(container.querySelector('[data-testid="pulseira-circle"]')).not.toBeInTheDocument()
  })

  it('exibe badge de prioridade quando prioridade não é NORMAL', () => {
    const pacienteGestante = { ...pacienteBase, prioridade: 'GESTANTE' }
    render(
      <FilaCard paciente={pacienteGestante} posicao={1} tempoEstimado={40} status="AGUARDANDO" onSairDaFila={vi.fn()} />
    )
    expect(screen.getByText('Gestante')).toBeInTheDocument()
  })

  it('não exibe badge de prioridade quando prioridade é NORMAL', () => {
    render(
      <FilaCard paciente={pacienteBase} posicao={1} tempoEstimado={40} status="AGUARDANDO" onSairDaFila={vi.fn()} />
    )
    expect(screen.queryByText('NORMAL')).not.toBeInTheDocument()
  })

  it('chama onSairDaFila com o id do paciente ao clicar no botão', async () => {
    const onSairDaFila = vi.fn()
    const user = userEvent.setup()
    render(
      <FilaCard paciente={pacienteBase} posicao={1} tempoEstimado={40} status="AGUARDANDO" onSairDaFila={onSairDaFila} />
    )
    await user.click(screen.getByRole('button', { name: /sair da fila/i }))
    expect(onSairDaFila).toHaveBeenCalledWith('pac-1')
  })
})

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const MockIcon = (props) => <svg data-testid="mock-icon" {...props} />

const linksFixture = [
  { label: 'Dashboard', icon: MockIcon, path: '/paciente' },
  { label: 'Consultas', icon: MockIcon, path: '/paciente/consultas' },
]

const usuarioFixture = { nome: 'Carlos Ferreira', perfil: 'PACIENTE' }

describe('Sidebar', () => {
  it('renderiza o logo AtendeJá', () => {
    render(
      <MemoryRouter initialEntries={['/paciente']}>
        <Sidebar links={linksFixture} usuario={usuarioFixture} onLogout={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getAllByText('AtendeJá')[0]).toBeInTheDocument()
  })

  it('exibe as iniciais do usuário no avatar', () => {
    render(
      <MemoryRouter initialEntries={['/paciente']}>
        <Sidebar links={linksFixture} usuario={usuarioFixture} onLogout={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getAllByText('CF')[0]).toBeInTheDocument()
  })

  it('renderiza todos os links', () => {
    render(
      <MemoryRouter initialEntries={['/paciente']}>
        <Sidebar links={linksFixture} usuario={usuarioFixture} onLogout={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Consultas').length).toBeGreaterThan(0)
  })

  it('marca o link ativo com aria-current="page"', () => {
    render(
      <MemoryRouter initialEntries={['/paciente']}>
        <Sidebar links={linksFixture} usuario={usuarioFixture} onLogout={vi.fn()} />
      </MemoryRouter>
    )
    const activeLinks = screen.getAllByRole('link', { name: /dashboard/i })
    const active = activeLinks.find(l => l.getAttribute('aria-current') === 'page')
    expect(active).toBeDefined()
  })

  it('chama onLogout ao clicar no botão de sair', async () => {
    const onLogout = vi.fn()
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/paciente']}>
        <Sidebar links={linksFixture} usuario={usuarioFixture} onLogout={onLogout} />
      </MemoryRouter>
    )
    await user.click(screen.getAllByRole('button', { name: /sair/i })[0])
    expect(onLogout).toHaveBeenCalledOnce()
  })
})
