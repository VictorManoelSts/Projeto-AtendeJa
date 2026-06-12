// Cores imutáveis — protocolo Manchester. Não parametrizar.
const PULSEIRAS = {
  1: { label: 'Emergência',    dot: 'var(--color-pulseira-1)', bg: 'var(--color-pulseira-1-bg)', color: 'var(--color-danger-text)' },
  2: { label: 'Muito urgente', dot: 'var(--color-pulseira-2)', bg: 'var(--color-pulseira-2-bg)', color: 'var(--color-orange-text)' },
  3: { label: 'Urgente',       dot: 'var(--color-pulseira-3)', bg: 'var(--color-pulseira-3-bg)', color: 'var(--color-warning-text)' },
  4: { label: 'Pouco urgente', dot: 'var(--color-pulseira-4)', bg: 'var(--color-pulseira-4-bg)', color: 'var(--color-success-text)' },
  5: { label: 'Não urgente',   dot: 'var(--color-pulseira-5)', bg: 'var(--color-pulseira-5-bg)', color: 'var(--color-primary-light)' },
}

export default function PulseiraBadge({ nivel }) {
  const pulseira = PULSEIRAS[nivel]
  if (!pulseira) return null

  return (
    <span
      style={{
        backgroundColor: pulseira.bg,
        color: pulseira.color,
        borderRadius: 'var(--radius-full)',
        padding: '3px 10px',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        data-testid="pulseira-circle"
        aria-hidden="true"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: pulseira.dot,
          flexShrink: 0,
        }}
      />
      {pulseira.label}
    </span>
  )
}
