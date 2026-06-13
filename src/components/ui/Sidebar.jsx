import { useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'

function getIniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '??'
  if (partes.length === 1) return (partes[0][0] ?? '').toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export default function Sidebar({
  links = [],
  usuario = {},
  isOpen = false,
  onClose = () => {},
  onLogout = () => {},
}) {
  const { pathname } = useLocation()
  const iniciais = getIniciais(usuario?.nome)

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          data-testid="sidebar-overlay"
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 md:hidden bg-black/40"
        />
      )}

      {/*
        Sidebar — único <aside> com três estados via Tailwind:
        mobile (<md)  : drawer fixo, oculto ou visível via translate
        tablet (md–lg): sticky, largura 56px, apenas ícones
        desktop (lg+) : sticky, largura 240px, ícones + labels
      */}
      <aside
        data-testid="sidebar"
        aria-label="Menu lateral"
        className={[
          'fixed inset-y-0 left-0 z-50',
          'md:sticky md:top-0 md:h-screen md:flex-shrink-0',
          'w-64 md:w-14 lg:w-60',
          'flex flex-col',
          'transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        ].join(' ')}
        style={{ background: '#0F172A', borderRight: '0.5px solid #1E293B' }}
      >

        {/* Logo */}
        <div
          className="flex items-center px-4 py-4"
          style={{ borderBottom: '0.5px solid #1E293B', minHeight: 52 }}
        >
          <span style={{
            color: '#CBD5E1',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-bold)',
            whiteSpace: 'nowrap',
          }}>
            AtendeJá
          </span>
        </div>

        {/* Avatar + info do usuário */}
        <div
          className="flex items-center gap-2 px-3 py-3"
          style={{ borderBottom: '0.5px solid #1E293B' }}
        >
          <div
            data-testid="sidebar-avatar"
            aria-hidden="true"
            style={{
              width: 36, height: 36,
              borderRadius: '9999px',
              background: '#1E293B',
              color: '#94A3B8',
              fontWeight: 'var(--font-bold)',
              fontSize: 'var(--text-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {iniciais}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p
              className="truncate"
              style={{
                color: '#E2E8F0',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
                margin: 0,
              }}
            >
              {usuario?.nome}
            </p>
            <p
              className="truncate"
              style={{ color: '#64748B', fontSize: 'var(--text-xs)', margin: 0 }}
            >
              {usuario?.perfil}
            </p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Menu principal">
          {links.map(({ label, icon: Icon, href, path, active }) => {
            const linkTarget = href ?? path ?? '#'
            // Suporta active explícito (novo) e detecção por rota (legado)
            const isActive = active !== undefined ? active : pathname === linkTarget
            return (
            <div key={label} className="relative group px-2 py-0.5">
              <a
                href={linkTarget}
                aria-current={isActive ? 'page' : undefined}
                title={label}
                className="flex items-center gap-3 rounded-md px-2 py-2 w-full transition-colors"
                style={{
                  background: isActive ? '#1E293B' : 'transparent',
                  color: isActive ? '#CBD5E1' : '#64748B',
                  borderRight: isActive ? '2px solid #94A3B8' : '2px solid transparent',
                  textDecoration: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {Icon && <Icon size={16} aria-hidden="true" />}
                <span
                  data-testid="nav-label"
                  className="hidden lg:inline"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {label}
                </span>
              </a>

              {/* Tooltip para tablet (md–lg) — aparece no hover via group */}
              <div
                role="tooltip"
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded
                           pointer-events-none whitespace-nowrap z-[60]
                           hidden group-hover:block lg:hidden"
                style={{
                  background: '#1E293B',
                  color: '#CBD5E1',
                  fontSize: 'var(--text-xs)',
                  border: '0.5px solid #475569',
                }}
              >
                {label}
              </div>
            </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: '0.5px solid #1E293B' }} className="px-2 py-3">
          <button
            aria-label="Sair"
            onClick={onLogout}
            className="flex items-center gap-3 w-full rounded-md px-2 py-2"
            style={{
              color: '#475569',
              fontSize: 'var(--text-sm)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="hidden lg:inline" style={{ whiteSpace: 'nowrap' }}>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
