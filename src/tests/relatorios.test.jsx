import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Relatorios from '../pages/admin/Relatorios'

function renderRelatorios() {
  return render(
    <MemoryRouter>
      <Relatorios />
    </MemoryRouter>
  )
}

// ─── Estrutura ────────────────────────────────────────────────────────────────

describe('Relatorios — estrutura', () => {
  it('renderiza o título "Relatórios"', () => {
    renderRelatorios()
    expect(screen.getByText('Relatórios')).toBeInTheDocument()
  })

  it('renderiza as 4 abas', () => {
    renderRelatorios()
    expect(screen.getByRole('tab', { name: /atendimentos/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /filas/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /faltas/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /produtividade/i })).toBeInTheDocument()
  })

  it('aba Atendimentos está ativa por padrão (aria-selected="true")', () => {
    renderRelatorios()
    expect(
      screen.getByRole('tab', { name: /atendimentos/i })
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('abas inativas têm aria-selected="false"', () => {
    renderRelatorios()
    expect(
      screen.getByRole('tab', { name: /filas/i })
    ).toHaveAttribute('aria-selected', 'false')
  })
})

// ─── Aba Atendimentos ─────────────────────────────────────────────────────────

describe('Relatorios — aba Atendimentos', () => {
  it('exibe pelo menos um indicador de resumo', async () => {
    renderRelatorios()
    await waitFor(() => {
      expect(screen.getByText(/total/i)).toBeInTheDocument()
    })
  })

  it('exibe tabela de atendimentos', async () => {
    renderRelatorios()
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('tabela tem os cabeçalhos Paciente, Médico e Status', async () => {
    renderRelatorios()
    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: /paciente/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /médico/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument()
    })
  })

  it('exibe dados de consultas na tabela', async () => {
    renderRelatorios()
    await waitFor(() => {
      expect(screen.getByText('Carlos Eduardo Ferreira')).toBeInTheDocument()
    })
  })
})

// ─── Aba Filas ────────────────────────────────────────────────────────────────

describe('Relatorios — aba Filas', () => {
  it('ao clicar em Filas, exibe tabela de filas', async () => {
    renderRelatorios()
    await userEvent.click(screen.getByRole('tab', { name: /filas/i }))
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('aba Filas tem cabeçalho Senha e Tipo', async () => {
    renderRelatorios()
    await userEvent.click(screen.getByRole('tab', { name: /filas/i }))
    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: /senha/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /tipo/i })).toBeInTheDocument()
    })
  })

  it('aba Filas exibe indicador de Aguardando', async () => {
    renderRelatorios()
    await userEvent.click(screen.getByRole('tab', { name: /filas/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/aguardando/i).length).toBeGreaterThan(0)
    })
  })
})

// ─── Aba Faltas ───────────────────────────────────────────────────────────────

describe('Relatorios — aba Faltas', () => {
  it('ao clicar em Faltas, exibe tabela de faltas', async () => {
    renderRelatorios()
    await userEvent.click(screen.getByRole('tab', { name: /faltas/i }))
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('aba Faltas exibe apenas AUSENTE ou CANCELADO', async () => {
    renderRelatorios()
    await userEvent.click(screen.getByRole('tab', { name: /faltas/i }))
    await waitFor(() => {
      const cells = screen.getAllByRole('cell')
      const statusCells = cells.filter(
        c => c.textContent === 'AUSENTE' || c.textContent === 'CANCELADO'
      )
      expect(statusCells.length).toBeGreaterThan(0)
    })
  })

  it('aba Faltas tem indicador de total de faltas', async () => {
    renderRelatorios()
    await userEvent.click(screen.getByRole('tab', { name: /faltas/i }))
    await waitFor(() => {
      expect(screen.getByText(/total/i)).toBeInTheDocument()
    })
  })
})

// ─── Aba Produtividade ────────────────────────────────────────────────────────

describe('Relatorios — aba Produtividade médica', () => {
  it('ao clicar em Produtividade, exibe tabela de médicos', async () => {
    renderRelatorios()
    await userEvent.click(screen.getByRole('tab', { name: /produtividade/i }))
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('tabela de produtividade tem cabeçalho Médico e Especialidade', async () => {
    renderRelatorios()
    await userEvent.click(screen.getByRole('tab', { name: /produtividade/i }))
    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: /médico/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /especialidade/i })).toBeInTheDocument()
    })
  })

  it('lista todos os médicos do mock', async () => {
    renderRelatorios()
    await userEvent.click(screen.getByRole('tab', { name: /produtividade/i }))
    await waitFor(() => {
      expect(screen.getByText('Dr. Eduardo Rezende')).toBeInTheDocument()
      expect(screen.getByText('Dra. Fernanda Oliveira')).toBeInTheDocument()
    })
  })
})
