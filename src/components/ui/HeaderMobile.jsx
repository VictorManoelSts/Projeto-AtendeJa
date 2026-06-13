import { Menu, Bell } from 'lucide-react'

export default function HeaderMobile({ onToggle, notificacoes = 0 }) {
  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
      style={{
        height: 52,
        background: '#0F172A',
        borderBottom: '0.5px solid #1E293B',
      }}
    >
      {/* Hamburguer */}
      <button
        aria-label="Abrir menu"
        onClick={onToggle}
        style={{
          color: '#CBD5E1',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: 0,
          minWidth: 44,
          minHeight: 44,
          justifyContent: 'center',
        }}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Logo centralizado */}
      <span style={{
        color: '#CBD5E1',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-bold)',
      }}>
        AtendeJá
      </span>

      {/* Sino de notificações */}
      <button
        aria-label="Notificações"
        style={{
          color: '#CBD5E1',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          padding: 0,
          minWidth: 44,
          minHeight: 44,
          justifyContent: 'center',
        }}
      >
        <Bell size={20} aria-hidden="true" />
        {notificacoes > 0 && (
          <span
            data-testid="notif-badge"
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              background: 'var(--color-danger)',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 'var(--font-bold)',
              borderRadius: '9999px',
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {notificacoes}
          </span>
        )}
      </button>
    </header>
  )
}
