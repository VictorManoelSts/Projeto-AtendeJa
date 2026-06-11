import { describe, it, expect, beforeEach } from 'vitest'
import {
  getFila,
  entrarNaFila,
  chamarProximo,
  marcarAusente,
  sairDaFila,
  getMinhaposicao,
  _resetFila,
} from '../mocks/api/fila'

function entrada(overrides = {}) {
  return {
    id: 'fil-t1',
    idPaciente: 'pac-test',
    tipoFila: 'CONSULTA',
    senha: 'CM001',
    nivelRisco: 4,
    prioridade: 'NORMAL',
    horarioEntrada: '2026-01-01T08:00:00',
    status: 'AGUARDANDO',
    posicaoOriginal: 1,
    ...overrides,
  }
}

// Garante estado limpo antes de cada teste
beforeEach(() => _resetFila([]))

// ─── Ordenação ────────────────────────────────────────────────────────────────

describe('getFila — ordenação', () => {
  it('nivelRisco tem precedência sobre prioridade legal', async () => {
    _resetFila([
      entrada({ id: 't1', idPaciente: 'p1', nivelRisco: 3, prioridade: 'IDOSO_80_MAIS', horarioEntrada: '2026-01-01T08:00:00' }),
      entrada({ id: 't2', idPaciente: 'p2', nivelRisco: 2, prioridade: 'NORMAL',       horarioEntrada: '2026-01-01T09:00:00' }),
    ])
    const fila = await getFila('CONSULTA')
    expect(fila[0].id).toBe('t2') // risco 2 antes de risco 3, mesmo NORMAL
  })

  it('IDOSO_80_MAIS antes de GESTANTE em empate de nivelRisco', async () => {
    _resetFila([
      entrada({ id: 't1', idPaciente: 'p1', nivelRisco: 3, prioridade: 'GESTANTE',    horarioEntrada: '2026-01-01T08:00:00' }),
      entrada({ id: 't2', idPaciente: 'p2', nivelRisco: 3, prioridade: 'IDOSO_80_MAIS', horarioEntrada: '2026-01-01T09:00:00' }),
    ])
    const fila = await getFila('CONSULTA')
    expect(fila[0].id).toBe('t2')
    expect(fila[1].id).toBe('t1')
  })

  it('empate total de risco e prioridade ordenado por horarioEntrada (FIFO)', async () => {
    _resetFila([
      entrada({ id: 't1', idPaciente: 'p1', nivelRisco: 4, prioridade: 'NORMAL', horarioEntrada: '2026-01-01T10:00:00' }),
      entrada({ id: 't2', idPaciente: 'p2', nivelRisco: 4, prioridade: 'NORMAL', horarioEntrada: '2026-01-01T08:00:00' }),
    ])
    const fila = await getFila('CONSULTA')
    expect(fila[0].id).toBe('t2') // entrou mais cedo
  })
})

// ─── entrarNaFila ─────────────────────────────────────────────────────────────

describe('entrarNaFila — validações', () => {
  it('rejeita se paciente já tem fila ativa', async () => {
    _resetFila([entrada({ idPaciente: 'pac-1', status: 'AGUARDANDO' })])
    await expect(entrarNaFila('pac-1', 'EXAME')).rejects.toThrow('fila ativa')
  })

  it('rejeita também se fila ativa for CHAMADO', async () => {
    _resetFila([entrada({ idPaciente: 'pac-1', status: 'CHAMADO' })])
    await expect(entrarNaFila('pac-1', 'CONSULTA')).rejects.toThrow('fila ativa')
  })

  it('rejeita se fila atingiu 70 pacientes ativos', async () => {
    _resetFila(
      Array.from({ length: 70 }, (_, i) =>
        entrada({ id: `fil-${i}`, idPaciente: `pac-x${i}`, senha: `CM${String(i + 1).padStart(3, '0')}`, posicaoOriginal: i + 1 })
      )
    )
    await expect(entrarNaFila('pac-novo', 'CONSULTA')).rejects.toThrow('limite máximo')
  })
})

describe('entrarNaFila — senha com prefixo correto', () => {
  it.each([
    ['CONSULTA', 'CM'],
    ['EXAME',    'EX'],
    ['CIRURGIA', 'CI'],
    ['EMERGENCIA', 'EM'],
  ])('tipo %s gera prefixo %s', async (tipo, prefixo) => {
    const nova = await entrarNaFila('pac-1', tipo)
    expect(nova.senha).toMatch(new RegExp(`^${prefixo}`))
  })
})

// ─── Operações de status ──────────────────────────────────────────────────────

describe('chamarProximo', () => {
  it('muda status do próximo AGUARDANDO para CHAMADO', async () => {
    _resetFila([entrada({ id: 'fil-1', idPaciente: 'p1', status: 'AGUARDANDO' })])
    const chamado = await chamarProximo('CONSULTA')
    expect(chamado.status).toBe('CHAMADO')
    const fila = await getFila('CONSULTA')
    expect(fila[0].status).toBe('CHAMADO')
  })

  it('respeita ordenação ao escolher o próximo', async () => {
    _resetFila([
      entrada({ id: 'fil-a', idPaciente: 'p1', nivelRisco: 5, prioridade: 'NORMAL',       status: 'AGUARDANDO', horarioEntrada: '2026-01-01T08:00:00' }),
      entrada({ id: 'fil-b', idPaciente: 'p2', nivelRisco: 2, prioridade: 'IDOSO_80_MAIS', status: 'AGUARDANDO', horarioEntrada: '2026-01-01T09:00:00' }),
    ])
    const chamado = await chamarProximo('CONSULTA')
    expect(chamado.id).toBe('fil-b') // risco 2 tem prioridade
  })
})

describe('marcarAusente', () => {
  it('muda status para AUSENTE', async () => {
    _resetFila([entrada({ id: 'fil-1', idPaciente: 'p1', status: 'CHAMADO' })])
    const resultado = await marcarAusente('fil-1')
    expect(resultado.status).toBe('AUSENTE')
  })
})

describe('sairDaFila', () => {
  it('muda status para CANCELADO', async () => {
    _resetFila([entrada({ id: 'fil-1', idPaciente: 'p1', status: 'AGUARDANDO' })])
    const resultado = await sairDaFila('fil-1')
    expect(resultado.status).toBe('CANCELADO')
  })

  it('preserva posicaoOriginal quando saindo antes de ser chamado', async () => {
    _resetFila([entrada({ id: 'fil-1', idPaciente: 'p1', status: 'AGUARDANDO', posicaoOriginal: 3 })])
    const resultado = await sairDaFila('fil-1')
    expect(resultado.posicaoOriginal).toBe(3)
  })
})

// ─── getMinhaposicao ──────────────────────────────────────────────────────────

describe('getMinhaposicao', () => {
  it('retorna posicao, tempoEstimado e senha', async () => {
    _resetFila([
      entrada({ id: 'fil-1', idPaciente: 'p1', senha: 'CM001', status: 'AGUARDANDO', horarioEntrada: '2026-01-01T08:00:00', posicaoOriginal: 1 }),
      entrada({ id: 'fil-2', idPaciente: 'p2', senha: 'CM002', status: 'AGUARDANDO', horarioEntrada: '2026-01-01T09:00:00', posicaoOriginal: 2 }),
    ])
    const resultado = await getMinhaposicao('fil-2')
    expect(resultado).toHaveProperty('posicao')
    expect(resultado).toHaveProperty('tempoEstimado')
    expect(resultado.senha).toBe('CM002')
    expect(resultado.posicao).toBe(2) // fil-1 entrou antes
  })

  it('posicao 1 para o primeiro da fila', async () => {
    _resetFila([entrada({ id: 'fil-1', idPaciente: 'p1', senha: 'CM001', status: 'AGUARDANDO' })])
    const resultado = await getMinhaposicao('fil-1')
    expect(resultado.posicao).toBe(1)
    expect(resultado.tempoEstimado).toBe(0)
  })
})
