export default function SenhaDisplay({ senha }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--color-primary)',
        letterSpacing: '0.05em',
      }}
    >
      {senha}
    </span>
  )
}
