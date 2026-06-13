const VARIANTS = {
  success: { bg: 'var(--color-success-bg)',  color: 'var(--color-success-text)' },
  warning: { bg: 'var(--color-warning-bg)',  color: 'var(--color-warning-text)' },
  danger:  { bg: 'var(--color-danger-bg)',   color: 'var(--color-danger-text)' },
  orange:  { bg: 'var(--color-orange-bg)',   color: 'var(--color-orange-text)' },
  neutral: { bg: 'var(--color-primary-bg)',  color: 'var(--color-primary-light)' },
  info:    { bg: 'var(--color-primary-bg)',  color: 'var(--color-primary-light)' },
}

export default function Badge({ texto, variante = 'neutral', 'data-testid': testId }) {
  const { bg, color } = VARIANTS[variante] ?? VARIANTS.neutral
  return (
    <span
      data-testid={testId}
      style={{
        backgroundColor: bg,
        color,
        borderRadius: 'var(--radius-full)',
        padding: '3px 10px',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </span>
  )
}
