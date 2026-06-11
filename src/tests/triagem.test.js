import { describe, it, expect, beforeEach } from 'vitest'
import { salvarTriagem, _resetTriagens } from '../mocks/api/triagens'
import { getFila, _resetFila } from '../mocks/api/fila'
import { listar, marcarLida, _resetNotificacoes } from '../mocks/api/notificacoes'

const dadosBase = {
  idPaciente: 'pac-1',
  idEnfermeiro: 'enf-1',
  perfil: 'ENFERMEIRO',
  queixaPrincipal: 'Dor torácica intensa com irradiação',
  sintomasApresentados: ['dor torácica', 'dispneia'],
  temperatura: 36.8,
  pressaoArterial: '160/100',
  frequenciaCardiaca: 110,
  saturacaoOxigenio: 93,
  nivelDor: 8,
  nivelRisco: 2,
}

beforeEach(() => {
  _resetFila([])
  _resetTriagens()
  _resetNotificacoes()
})

// ─── Pulseira e tempo por nível ───────────────────────────────────────────────

describe('salvarTriagem — pulseira e tempo por nível de risco', () => {
  it.each([
    [1, 'VERMELHA',   0],
    [2, 'LARANJA',   10],
    [3, 'AMARELA',   30],
    [4, 'VERDE',    120],
    [5, 'AZUL',     240],
  ])('nivelRisco %i → corPulseira %s, tempoMaximo %i min', async (nivel, cor, tempo) => {
    const triagem = await salvarTriagem({ ...dadosBase, nivelRisco: nivel })
    expect(triagem.corPulseira).toBe(cor)
    expect(triagem.tempoMaximoAtendimento).toBe(tempo)
  })
})

// ─── Validações ───────────────────────────────────────────────────────────────

describe('salvarTriagem — validações de nivelRisco', () => {
  it('erro se nivelRisco é null', async () => {
    await expect(salvarTriagem({ ...dadosBase, nivelRisco: null }))
      .rejects.toThrow('obrigatório')
  })

  it('erro se nivelRisco é undefined (campo ausente)', async () => {
    const { nivelRisco: _, ...semRisco } = dadosBase
    await expect(salvarTriagem(semRisco)).rejects.toThrow('obrigatório')
  })

  it('erro se nivelRisco é 0 (abaixo do intervalo)', async () => {
    await expect(salvarTriagem({ ...dadosBase, nivelRisco: 0 }))
      .rejects.toThrow('1 e 5')
  })

  it('erro se nivelRisco é 6 (acima do intervalo)', async () => {
    await expect(salvarTriagem({ ...dadosBase, nivelRisco: 6 }))
      .rejects.toThrow('1 e 5')
  })
})

describe('salvarTriagem — validações de queixa e perfil', () => {
  it('erro se queixaPrincipal está vazia', async () => {
    await expect(salvarTriagem({ ...dadosBase, queixaPrincipal: '' }))
      .rejects.toThrow('obrigatória')
  })

  it('erro se queixaPrincipal é apenas espaços', async () => {
    await expect(salvarTriagem({ ...dadosBase, queixaPrincipal: '   ' }))
      .rejects.toThrow('obrigatória')
  })

  it('erro se perfil é PACIENTE', async () => {
    await expect(salvarTriagem({ ...dadosBase, perfil: 'PACIENTE' }))
      .rejects.toThrow('Perfil inválido')
  })

  it('erro se perfil é RECEPCIONISTA', async () => {
    await expect(salvarTriagem({ ...dadosBase, perfil: 'RECEPCIONISTA' }))
      .rejects.toThrow('Perfil inválido')
  })

  it('aceita perfil MEDICO', async () => {
    const triagem = await salvarTriagem({ ...dadosBase, perfil: 'MEDICO', idMedico: 'med-1' })
    expect(triagem.entradaNaFila).toBe(true)
  })
})

// ─── Integração com fila ─────────────────────────────────────────────────────

describe('salvarTriagem — integração com fila EMERGENCIA', () => {
  it('retorna entradaNaFila = true e senhaGerada com prefixo EM', async () => {
    const triagem = await salvarTriagem(dadosBase)
    expect(triagem.entradaNaFila).toBe(true)
    expect(triagem.senhaGerada).toMatch(/^EM/)
  })

  it('paciente aparece na fila EMERGENCIA após salvar triagem', async () => {
    await salvarTriagem(dadosBase)
    const fila = await getFila('EMERGENCIA')
    expect(fila.some(e => e.idPaciente === 'pac-1')).toBe(true)
  })
})

// ─── Notificações ─────────────────────────────────────────────────────────────

describe('listar notificações', () => {
  it('retorna apenas notificações do usuário informado', async () => {
    const lista = await listar('pac-2')
    expect(lista.length).toBeGreaterThan(0)
    expect(lista.every(n => n.idUsuario === 'pac-2')).toBe(true)
  })

  it('retorna lista vazia quando usuário não possui notificações', async () => {
    const lista = await listar('pac-inexistente')
    expect(lista).toHaveLength(0)
  })
})

describe('marcarLida', () => {
  it('seta lida = true na notificação não lida', async () => {
    const resultado = await marcarLida('ntf-1') // lida: false no mock inicial
    expect(resultado.lida).toBe(true)
  })

  it('notificação já lida permanece lida', async () => {
    const resultado = await marcarLida('ntf-3') // lida: true no mock inicial
    expect(resultado.lida).toBe(true)
  })

  it('rejeita quando notificação não é encontrada', async () => {
    await expect(marcarLida('ntf-inexistente')).rejects.toThrow('não encontrada')
  })
})
