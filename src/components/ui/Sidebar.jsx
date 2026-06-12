import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'

function getIniciais(nome = '') {
  const partes = nome.trim().split(/\s+/)
  if (partes.length === 1) return partes[0][0]?.toUpperCase() ?? ''
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

const SIDEBAR_BG = '#0F172A'
const SIDEBAR_BORDER = '#1E293B'

function NavContent({ links, usuario, onLogout }) {
  const iniciais = getIniciais(usuario?.nome)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '16px' }}>
      {/* Logo */}
      <div style={{ padding: '0 16px 16px', color: '#CBD5E1', fontWeight: 600, fontSize: 'var(--text-base)', whiteSpace: 'nowrap' }}>
        AtendeJá
      </div>

      {/* Avatar + nome */}
      <div style={{ padding: '0 12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '36px', height: '36px', borderRadius: '9999px',
            background: '#1E293B', color: '#94A3B8', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 'var(--text-xs)',
          }}
          aria-hidden="true"
        >
          {iniciais}
        </div>
        <div className="hidden lg:block" style={{ overflow: 'hidden' }}>
          <p style={{ color: '#E2E8F0', fontSize: 'var(--text-xs)', fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {usuario?.nome}
          </p>
          <p style={{ color: '#64748B', fontSize: 'var(--text-xs)', margin: 0 }}>
            {usuario?.perfil}
          </p>
        </div>
      </div>

      {/* Links */}
      <nav style={{ flex: 1 }} aria-label="Menu principal">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                color: isActive ? '#CBD5E1' : '#64748B',
                background: isActive ? '#1E293B' : 'transparent',
                borderRight: isActive ? '2px solid #94A3B8' : '2px solid transparent',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                minHeight: '44px',
                whiteSpace: 'nowrap',
              })}
            >
              {Icon && <Icon size={16} aria-hidden="true" />}
              <span className="hidden lg:inline">{link.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        aria-label="Sair"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          color: '#475569',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          width: '100%',
          minHeight: '44px',
        }}
      >
        <LogOut size={16} aria-hidden="true" />
        <span className="hidden lg:inline">Sair</span>
      </button>
    </div>
  )
}

export default function Sidebar({ links = [], usuario = {}, isOpen = false, onClose = () => {}, onLogout = () => {} }) {
  return (
    <>
      {/* Drawer mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: SIDEBAR_BG, borderRight: `0.5px solid ${SIDEBAR_BORDER}` }}
        aria-label="Menu lateral"
      >
        <NavContent links={links} usuario={usuario} onLogout={onLogout} />
      </aside>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar tablet / desktop */}
      <aside
        className="hidden md:flex flex-col w-14 lg:w-60"
        style={{ background: SIDEBAR_BG, borderRight: `0.5px solid ${SIDEBAR_BORDER}`, minHeight: '100vh' }}
        aria-label="Menu lateral"
      >
        <NavContent links={links} usuario={usuario} onLogout={onLogout} />
      </aside>
    </>
  )
}
