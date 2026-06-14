import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LayoutDashboard, FileText } from 'lucide-react'
import Sidebar from '../components/ui/Sidebar'
import HeaderMobile from '../components/ui/HeaderMobile'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const links = [
  { label: 'Dashboard',   icon: LayoutDashboard, href: '/admin',             active: true  },
  { label: 'Relatórios',  icon: FileText,        href: '/admin/relatorios',  active: false },
]
const usuario = { nome: 'Roberto Alves', perfil: 'ADMINISTRADOR' }

function renderSidebar(props = {}) {
  return render(
    <MemoryRouter>
      <Sidebar
        links={links}
        usuario={usuario}
        isOpen={false}
        onClose={vi.fn()}
        onLogout={vi.fn()}
        {...props}
      />
    </MemoryRouter>
  )
}

// ─── Sidebar — estrutura ──────────────────────────────────────────────────────

describe('Sidebar — estrutura', () => {
  it('renderiza o logo "AtendeJá"', () => {
    renderSidebar()
    expect(screen.getByText('AtendeJá')).toBeInTheDocument()
  })

  it('renderiza todos os links de navegação', () => {
    renderSidebar()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /relatórios/i })).toBeInTheDocument()
  })

  it('link ativo tem aria-current="page"', () => {
    renderSidebar()
    const activeLink = screen.getByRole('link', { name: /dashboard/i })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
  })

  it('link inativo não tem aria-current', () => {
    renderSidebar()
    const inactiveLink = screen.getByRole('link', { name: /relatórios/i })
    expect(inactiveLink).not.toHaveAttribute('aria-current')
  })

  it('renderiza as iniciais do usuário no avatar', () => {
    renderSidebar()
    expect(screen.getByTestId('sidebar-avatar')).toHaveTextContent('RA')
  })

  it('botão de logout está presente', () => {
    renderSidebar()
    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument()
  })

  it('clicar em logout chama onLogout', () => {
    const onLogout = vi.fn()
    renderSidebar({ onLogout })
    fireEvent.click(screen.getByRole('button', { name: /sair/i }))
    expect(onLogout).toHaveBeenCalledOnce()
  })
})

// ─── Sidebar — drawer mobile ──────────────────────────────────────────────────

describe('Sidebar — drawer mobile', () => {
  it('quando fechado, aside tem classe -translate-x-full', () => {
    renderSidebar({ isOpen: false })
    const aside = screen.getByTestId('sidebar')
    expect(aside.className).toContain('-translate-x-full')
  })

  it('quando aberto, aside tem classe translate-x-0', () => {
    renderSidebar({ isOpen: true })
    const aside = screen.getByTestId('sidebar')
    expect(aside.className).toContain('translate-x-0')
    expect(aside.className).not.toMatch(/(?<![a-z])-translate-x-full/)
  })

  it('overlay aparece quando isOpen=true', () => {
    renderSidebar({ isOpen: true })
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument()
  })

  it('overlay não existe quando isOpen=false', () => {
    renderSidebar({ isOpen: false })
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument()
  })

  it('clicar no overlay chama onClose', () => {
    const onClose = vi.fn()
    renderSidebar({ isOpen: true, onClose })
    fireEvent.click(screen.getByTestId('sidebar-overlay'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})

// ─── Sidebar — responsividade ─────────────────────────────────────────────────

describe('Sidebar — responsividade', () => {
  it('labels dos links têm classe "hidden lg:inline"', () => {
    renderSidebar()
    const labels = screen.getAllByTestId('nav-label')
    labels.forEach(label => {
      expect(label.className).toContain('hidden')
      expect(label.className).toContain('lg:inline')
    })
  })

  it('tooltips de tablet estão presentes no DOM', () => {
    renderSidebar()
    const tooltips = screen.getAllByRole('tooltip')
    expect(tooltips.length).toBe(links.length)
  })

  it('tooltip de cada link exibe o label correto', () => {
    renderSidebar()
    const tooltips = screen.getAllByRole('tooltip')
    const textos = tooltips.map(t => t.textContent)
    expect(textos).toContain('Dashboard')
    expect(textos).toContain('Relatórios')
  })
})

// ─── HeaderMobile — estrutura ─────────────────────────────────────────────────

describe('HeaderMobile — estrutura', () => {
  it('tem classe md:hidden', () => {
    render(<HeaderMobile onToggle={vi.fn()} />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('md:hidden')
  })

  it('renderiza o logo "AtendeJá"', () => {
    render(<HeaderMobile onToggle={vi.fn()} />)
    expect(screen.getByText('AtendeJá')).toBeInTheDocument()
  })

  it('tem botão hamburguer com aria-label="Abrir menu"', () => {
    render(<HeaderMobile onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /abrir menu/i })).toBeInTheDocument()
  })

  it('tem botão de notificações com aria-label="Notificações"', () => {
    render(<HeaderMobile onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /notificações/i })).toBeInTheDocument()
  })

  it('exibe badge de notificações quando notificacoes > 0', () => {
    render(<HeaderMobile onToggle={vi.fn()} notificacoes={3} />)
    expect(screen.getByTestId('notif-badge')).toHaveTextContent('3')
  })

  it('não exibe badge quando notificacoes = 0', () => {
    render(<HeaderMobile onToggle={vi.fn()} notificacoes={0} />)
    expect(screen.queryByTestId('notif-badge')).not.toBeInTheDocument()
  })
})

// ─── HeaderMobile — interação ─────────────────────────────────────────────────

describe('HeaderMobile — interação', () => {
  it('clicar no hamburguer chama onToggle', () => {
    const onToggle = vi.fn()
    render(<HeaderMobile onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
