import { describe, it, expect } from 'vitest'
import { getUsuarioLogado } from '../mocks/api/auth'

describe('auth mock', () => {
  it('retorna null quando nenhum usuário está autenticado', async () => {
    const resultado = await getUsuarioLogado()
    expect(resultado).toBeNull()
  })
})
