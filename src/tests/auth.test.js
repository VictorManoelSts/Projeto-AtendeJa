import { describe, it, expect, beforeEach } from 'vitest'
import { login, logout, getUsuarioLogado } from '../mocks/api/auth'

describe('auth mock — sessão', () => {
  beforeEach(async () => {
    await logout()
  })

  it('getUsuarioLogado retorna null antes do login', async () => {
    const resultado = await getUsuarioLogado()
    expect(resultado).toBeNull()
  })

  it('login com credenciais válidas retorna usuario e token', async () => {
    const resultado = await login('carlos.ferreira@email.com', '123456')
    expect(resultado).toHaveProperty('usuario')
    expect(resultado).toHaveProperty('token')
    expect(resultado.usuario.email).toBe('carlos.ferreira@email.com')
  })

  it('login com email inexistente lança "Credenciais inválidas"', async () => {
    await expect(login('naoexiste@email.com', '123456')).rejects.toThrow('Credenciais inválidas')
  })

  it('login com senha incorreta lança "Credenciais inválidas"', async () => {
    await expect(login('carlos.ferreira@email.com', 'errada')).rejects.toThrow('Credenciais inválidas')
  })

  it('getUsuarioLogado retorna o usuario após login bem-sucedido', async () => {
    await login('carlos.ferreira@email.com', '123456')
    const usuario = await getUsuarioLogado()
    expect(usuario).not.toBeNull()
    expect(usuario.email).toBe('carlos.ferreira@email.com')
  })

  it('logout limpa a sessão', async () => {
    await login('carlos.ferreira@email.com', '123456')
    await logout()
    const usuario = await getUsuarioLogado()
    expect(usuario).toBeNull()
  })
})

describe('auth mock — perfis', () => {
  beforeEach(async () => {
    await logout()
  })

  it('perfil PACIENTE retornado corretamente', async () => {
    const { usuario } = await login('carlos.ferreira@email.com', '123456')
    expect(usuario.perfil).toBe('PACIENTE')
  })

  it('perfil MEDICO retornado corretamente', async () => {
    const { usuario } = await login('eduardo.rezende@atendeja.com', '123456')
    expect(usuario.perfil).toBe('MEDICO')
  })

  it('perfil ENFERMEIRO retornado corretamente', async () => {
    const { usuario } = await login('ana.sousa@atendeja.com', '123456')
    expect(usuario.perfil).toBe('ENFERMEIRO')
  })

  it('perfil RECEPCIONISTA retornado corretamente', async () => {
    const { usuario } = await login('juliana.martins@atendeja.com', '123456')
    expect(usuario.perfil).toBe('RECEPCIONISTA')
  })

  it('perfil ADMINISTRADOR retornado corretamente', async () => {
    const { usuario } = await login('roberto.alves@atendeja.com', '123456')
    expect(usuario.perfil).toBe('ADMINISTRADOR')
  })
})
