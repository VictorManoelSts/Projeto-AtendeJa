import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [credencial, setCredencial] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!credencial.trim()) {
      setErro('Informe o CPF ou e-mail')
      return
    }
    if (!senha.trim()) {
      setErro('Informe a senha')
      return
    }

    setCarregando(true)
    try {
      await login(credencial.trim(), senha)
    } catch (err) {
      setErro(err.message ?? 'Erro ao fazer login')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        className="w-full max-w-sm"
        style={{
          background: '#F8FAFC',
          border: '0.5px solid #CBD5E1',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8) var(--space-6)',
        }}
      >
        <h1
          style={{
            color: '#1E293B',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            margin: '0 0 var(--space-1)',
          }}
        >
          AtendeJá
        </h1>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
            margin: '0 0 var(--space-6)',
          }}
        >
          Acesse sua área de atendimento
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* CPF ou e-mail */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="credencial"
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              CPF ou e-mail
            </label>
            <input
              id="credencial"
              type="text"
              value={credencial}
              onChange={e => setCredencial(e.target.value)}
              autoComplete="off"
              style={{
                width: '100%',
                border: '0.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-sm)',
                color: '#1E293B',
                background: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Senha */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="senha"
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                autoComplete="new-password"
                style={{
                  width: '100%',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2) 36px var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  color: '#1E293B',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(v => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {mostrarSenha
                  ? <EyeOff size={16} aria-hidden="true" />
                  : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <p
              role="alert"
              style={{
                color: 'var(--color-danger)',
                fontSize: 'var(--text-xs)',
                margin: '0 0 var(--space-3)',
              }}
            >
              {erro}
            </p>
          )}

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%',
              background: '#1E293B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: carregando ? 'not-allowed' : 'pointer',
              minHeight: '44px',
            }}
          >
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        {/* Links */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            alignItems: 'center',
          }}
        >
          <a href="#" style={{ color: '#475569', fontSize: 'var(--text-xs)' }}>
            Esqueci minha senha
          </a>
          <a href="#" style={{ color: '#475569', fontSize: 'var(--text-xs)' }}>
            Criar conta
          </a>
        </div>
      </div>
    </div>
  )
}
