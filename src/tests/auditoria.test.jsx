import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Auditoria from '../pages/admin/Auditoria'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const adminUser  = { id: 'adm-1', nome: 'Roberto Alves',   perfil: 'ADMINISTRADOR' }
const medicoUser = { id: 'med-1', nome: 'Dr. Eduardo',     perfil: 'MEDICO' }

function renderAuditoria() {
  return render(
    <MemoryRouter>
      <Auditoria />
    </MemoryRouter>
  )
}

// ─── Controle de acesso ───────────────────────────────────────────────────────

describe('Auditoria — controle de acesso', () => {
  it('ADMINISTRADOR vê o título "Auditoria"', async () => {
    useAuth.mockReturnValue({ usuario: adminUser })
    renderAuditoria()
    await waitFor(() => {
      expect(screen.getByText('Auditoria')).toBeInTheDocument()
    })
  })

  it('perfil não-ADMINISTRADOR vê mensagem de acesso não autorizado', () => {
    useAuth.mockReturnValue({ usuario: medicoUser })
    renderAuditoria()
    expect(screen.getByText(/acesso não autorizado/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('usuário nulo vê mensagem de acesso não autorizado', () => {
    useAuth.mockReturnValue({ usuario: null })
    renderAuditoria()
    expect(screen.getByText(/acesso não autorizado/i)).toBeInTheDocument()
  })

  it('mensagem de acesso negado tem role="alert"', () => {
    useAuth.mockReturnValue({ usuario: medicoUser })
    renderAuditoria()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

// ─── Estrutura da tabela ──────────────────────────────────────────────────────

describe('Auditoria — estrutura', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ usuario: adminUser })
  })

  it('renderiza a tabela de auditoria', async () => {
    renderAuditoria()
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('tabela tem todas as 7 colunas exigidas', async () => {
    renderAuditoria()
    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: /usuário/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /ação/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /entidade/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /valor anterior/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /valor novo/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /data/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'IP' })).toBeInTheDocument()
    })
  })

  it('exibe dados dos registros de auditoria', async () => {
    renderAuditoria()
    await waitFor(() => {
      // Roberto Alves aparece em 2 linhas (aud-1 e aud-6)
      expect(screen.getAllByText('Roberto Alves').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Dr. Eduardo Rezende').length).toBeGreaterThan(0)
    })
  })

  it('exibe ações dos registros', async () => {
    renderAuditoria()
    await waitFor(() => {
      // Verifica célula da tabela (não confunde com <option> do select)
      expect(screen.getAllByRole('cell', { name: 'CHAMAR_PACIENTE' }).length).toBeGreaterThan(0)
    })
  })
})

// ─── Filtros ──────────────────────────────────────────────────────────────────

describe('Auditoria — filtros', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ usuario: adminUser })
  })

  it('exibe campo de busca por usuário', async () => {
    renderAuditoria()
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/buscar usuário/i)).toBeInTheDocument()
    })
  })

  it('exibe select de tipo de ação com label acessível', async () => {
    renderAuditoria()
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /tipo de ação/i })).toBeInTheDocument()
    })
  })

  it('exibe inputs de data início e data fim', async () => {
    renderAuditoria()
    await waitFor(() => {
      expect(screen.getByLabelText(/data início/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/data fim/i)).toBeInTheDocument()
    })
  })

  it('filtrar por nome de usuário remove registros não correspondentes', async () => {
    renderAuditoria()
    // Aguarda dados carregarem
    await waitFor(() => {
      expect(screen.getAllByText('Dr. Eduardo Rezende').length).toBeGreaterThan(0)
    })

    const input = screen.getByPlaceholderText(/buscar usuário/i)
    await userEvent.type(input, 'Roberto')

    await waitFor(() => {
      expect(screen.getAllByText('Roberto Alves').length).toBeGreaterThan(0)
      expect(screen.queryByText('Dr. Eduardo Rezende')).not.toBeInTheDocument()
    })
  })

  it('filtrar por tipo de ação remove registros de outras ações', async () => {
    renderAuditoria()
    // Aguarda dados carregarem (usa célula da tabela, não opção do select)
    await waitFor(() => {
      expect(screen.getAllByRole('cell', { name: 'CHAMAR_PACIENTE' }).length).toBeGreaterThan(0)
    })

    const select = screen.getByRole('combobox', { name: /tipo de ação/i })
    await userEvent.selectOptions(select, 'LOGIN')

    await waitFor(() => {
      // Verifica apenas células da tabela (a <option> ainda existe no DOM)
      expect(screen.queryByRole('cell', { name: 'CHAMAR_PACIENTE' })).not.toBeInTheDocument()
    })
  })

  it('limpar filtro de usuário restaura todos os registros', async () => {
    renderAuditoria()
    await waitFor(() => {
      expect(screen.getAllByText('Dr. Eduardo Rezende').length).toBeGreaterThan(0)
    })

    const input = screen.getByPlaceholderText(/buscar usuário/i)
    await userEvent.type(input, 'Roberto')

    await waitFor(() => {
      expect(screen.queryByText('Dr. Eduardo Rezende')).not.toBeInTheDocument()
    })

    await userEvent.clear(input)

    await waitFor(() => {
      expect(screen.getAllByText('Dr. Eduardo Rezende').length).toBeGreaterThan(0)
    })
  })
})
