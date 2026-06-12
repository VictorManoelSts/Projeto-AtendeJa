import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../components/ui/Badge'
import PulseiraBadge from '../components/ui/PulseiraBadge'
import StatusBadge from '../components/ui/StatusBadge'

// ─── Badge ────────────────────────────────────────────────────────────────────

describe('Badge', () => {
  it('renderiza o texto recebido', () => {
    render(<Badge texto="Ativo" variante="success" />)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it.each([
    ['success', '--color-success-bg',  '--color-success-text'],
    ['warning', '--color-warning-bg',  '--color-warning-text'],
    ['danger',  '--color-danger-bg',   '--color-danger-text'],
    ['orange',  '--color-orange-bg',   '--color-orange-text'],
    ['neutral', '--color-primary-bg',  '--color-primary-light'],
    ['info',    '--color-primary-bg',  '--color-primary-light'],
  ])('variante "%s" usa os tokens %s e %s', (variante, bgToken, colorToken) => {
    render(<Badge texto="x" variante={variante} />)
    const style = screen.getByText('x').getAttribute('style')
    expect(style).toContain(`var(${bgToken})`)
    expect(style).toContain(`var(${colorToken})`)
  })

  it('aplica border-radius: var(--radius-full)', () => {
    render(<Badge texto="x" variante="neutral" />)
    const style = screen.getByText('x').getAttribute('style')
    expect(style).toContain('var(--radius-full)')
  })

  it('aplica font-size: var(--text-xs)', () => {
    render(<Badge texto="x" variante="neutral" />)
    const style = screen.getByText('x').getAttribute('style')
    expect(style).toContain('var(--text-xs)')
  })

  it('usa neutral como variante padrão quando nenhuma é passada', () => {
    render(<Badge texto="x" />)
    const style = screen.getByText('x').getAttribute('style')
    expect(style).toContain('var(--color-primary-bg)')
  })
})

// ─── PulseiraBadge ────────────────────────────────────────────────────────────

describe('PulseiraBadge', () => {
  it.each([
    [1, 'Emergência',    '--color-pulseira-1'],
    [2, 'Muito urgente', '--color-pulseira-2'],
    [3, 'Urgente',       '--color-pulseira-3'],
    [4, 'Pouco urgente', '--color-pulseira-4'],
    [5, 'Não urgente',   '--color-pulseira-5'],
  ])('nível %i renderiza label "%s" e aplica token %s no círculo', (nivel, label, token) => {
    const { container } = render(<PulseiraBadge nivel={nivel} />)
    expect(screen.getByText(label)).toBeInTheDocument()
    const circle = container.querySelector('[data-testid="pulseira-circle"]')
    expect(circle).toBeInTheDocument()
    expect(circle.getAttribute('style')).toContain(`var(${token})`)
  })

  it('não renderiza nada para nível inválido', () => {
    const { container } = render(<PulseiraBadge nivel={99} />)
    expect(container.firstChild).toBeNull()
  })

  it('círculo tem aria-hidden="true"', () => {
    const { container } = render(<PulseiraBadge nivel={1} />)
    const circle = container.querySelector('[data-testid="pulseira-circle"]')
    expect(circle).toHaveAttribute('aria-hidden', 'true')
  })
})

// ─── StatusBadge ──────────────────────────────────────────────────────────────

describe('StatusBadge', () => {
  it.each([
    ['AGUARDANDO',     '--color-primary-bg'],
    ['CHAMADO',        '--color-warning-bg'],
    ['EM_ATENDIMENTO', '--color-success-bg'],
    ['FINALIZADO',     '--color-primary-bg'],
    ['CANCELADO',      '--color-primary-bg'],
    ['AUSENTE',        '--color-danger-bg'],
  ])('status "%s" usa o token de fundo %s', (status, bgToken) => {
    render(<StatusBadge status={status} />)
    const badge = screen.getByText(status)
    expect(badge.getAttribute('style')).toContain(`var(${bgToken})`)
  })

  it('renderiza o texto do status como label', () => {
    render(<StatusBadge status="CHAMADO" />)
    expect(screen.getByText('CHAMADO')).toBeInTheDocument()
  })
})
