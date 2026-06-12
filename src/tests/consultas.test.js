import { describe, it, expect, beforeEach } from 'vitest'
import { agendar, listar, cancelar, reagendar, _resetConsultas } from '../mocks/api/consultas'
import { getProntuario, atualizarProntuario, _resetProntuario } from '../mocks/api/prontuario'

function criarConsulta(overrides = {}) {
  return {
    id: 'con-t1',
    idPaciente: 'pac-1',
    idMedico: 'med-1',
    idUnidade: 'uni-1',
    dataHora: '2026-07-01T09:00:00',
    tipoConsulta: 'CONSULTA_INICIAL',
    status: 'AGENDADO',
    motivoConsulta: 'Consulta de rotina',
    contadorCancelamentos: 0,
    ...overrides,
  }
}

beforeEach(() => {
  _resetConsultas([])
  _resetProntuario()
})

// ─── agendar ─────────────────────────────────────────────────────────────────

describe('agendar', () => {
  it('cria consulta com dados válidos e status AGENDADO', async () => {
    const consulta = await agendar({
      idPaciente: 'pac-1',
      idMedico: 'med-1', // ATIVO
      idUnidade: 'uni-1',
      dataHora: '2026-07-01T09:00:00',
      tipoConsulta: 'CONSULTA_INICIAL',
      motivoConsulta: 'Dor de cabeça persistente',
    })
    expect(consulta).toHaveProperty('id')
    expect(consulta.status).toBe('AGENDADO')
    expect(consulta.contadorCancelamentos).toBe(0)
  })

  it('erro se médico está de férias (não disponível)', async () => {
    await expect(
      agendar({
        idPaciente: 'pac-1',
        idMedico: 'med-4', // FERIAS
        idUnidade: 'uni-1',
        dataHora: '2026-07-01T09:00:00',
        tipoConsulta: 'CONSULTA_INICIAL',
        motivoConsulta: 'Dor de cabeça',
      })
    ).rejects.toThrow('indisponível')
  })

  it('erro se médico está de licença (não disponível)', async () => {
    await expect(
      agendar({
        idPaciente: 'pac-1',
        idMedico: 'med-5', // LICENCA
        idUnidade: 'uni-1',
        dataHora: '2026-07-01T09:00:00',
        tipoConsulta: 'RETORNO',
        motivoConsulta: 'Acompanhamento',
      })
    ).rejects.toThrow('indisponível')
  })

  it('aceita médico em plantão', async () => {
    const consulta = await agendar({
      idPaciente: 'pac-2',
      idMedico: 'med-3', // PLANTAO
      idUnidade: 'uni-1',
      dataHora: '2026-07-01T10:00:00',
      tipoConsulta: 'URGENCIA',
      motivoConsulta: 'Dor intensa',
    })
    expect(consulta.status).toBe('AGENDADO')
  })
})

// ─── listar ───────────────────────────────────────────────────────────────────

describe('listar', () => {
  it('retorna apenas as consultas do paciente informado', async () => {
    _resetConsultas([
      criarConsulta({ id: 'c1', idPaciente: 'pac-1' }),
      criarConsulta({ id: 'c2', idPaciente: 'pac-2' }),
      criarConsulta({ id: 'c3', idPaciente: 'pac-1' }),
    ])
    const lista = await listar('pac-1')
    expect(lista).toHaveLength(2)
    expect(lista.every(c => c.idPaciente === 'pac-1')).toBe(true)
  })

  it('retorna lista vazia quando paciente não tem consultas', async () => {
    const lista = await listar('pac-inexistente')
    expect(lista).toHaveLength(0)
  })
})

// ─── cancelar ─────────────────────────────────────────────────────────────────

describe('cancelar', () => {
  it('muda status para CANCELADO e incrementa contadorCancelamentos', async () => {
    _resetConsultas([criarConsulta({ id: 'c1', contadorCancelamentos: 0 })])
    const resultado = await cancelar('c1')
    expect(resultado.status).toBe('CANCELADO')
    expect(resultado.contadorCancelamentos).toBe(1)
  })

  it('incrementa a partir de um valor existente', async () => {
    _resetConsultas([criarConsulta({ id: 'c1', contadorCancelamentos: 1 })])
    const resultado = await cancelar('c1')
    expect(resultado.contadorCancelamentos).toBe(2)
  })

  it('erro no terceiro cancelamento no período de 30 dias', async () => {
    const agora = new Date().toISOString()
    _resetConsultas([
      criarConsulta({ id: 'c1', status: 'CANCELADO', contadorCancelamentos: 1, dataCancelamento: agora }),
      criarConsulta({ id: 'c2', status: 'CANCELADO', contadorCancelamentos: 1, dataCancelamento: agora }),
      criarConsulta({ id: 'c3', status: 'AGENDADO',  contadorCancelamentos: 0 }),
    ])
    await expect(cancelar('c3')).rejects.toThrow('cancelamentos')
  })

  it('permite cancelar se os cancelamentos anteriores têm mais de 30 dias', async () => {
    const antigo = new Date()
    antigo.setDate(antigo.getDate() - 31)
    _resetConsultas([
      criarConsulta({ id: 'c1', status: 'CANCELADO', contadorCancelamentos: 1, dataCancelamento: antigo.toISOString() }),
      criarConsulta({ id: 'c2', status: 'CANCELADO', contadorCancelamentos: 1, dataCancelamento: antigo.toISOString() }),
      criarConsulta({ id: 'c3', status: 'AGENDADO',  contadorCancelamentos: 0 }),
    ])
    const resultado = await cancelar('c3')
    expect(resultado.status).toBe('CANCELADO')
  })
})

// ─── reagendar ────────────────────────────────────────────────────────────────

describe('reagendar', () => {
  it('atualiza dataHora e registra motivoReagendamento', async () => {
    _resetConsultas([criarConsulta({ id: 'c1' })])
    const resultado = await reagendar('c1', '2026-08-15T14:00:00', 'Conflito de agenda')
    expect(resultado.dataHora).toBe('2026-08-15T14:00:00')
    expect(resultado.motivoReagendamento).toBe('Conflito de agenda')
  })

  it('lança erro quando motivo está vazio', async () => {
    _resetConsultas([criarConsulta({ id: 'c1' })])
    await expect(reagendar('c1', '2026-08-15T14:00:00', '')).rejects.toThrow('obrigatório')
  })

  it('lança erro quando motivo contém apenas espaços', async () => {
    _resetConsultas([criarConsulta({ id: 'c1' })])
    await expect(reagendar('c1', '2026-08-15T14:00:00', '   ')).rejects.toThrow('obrigatório')
  })
})

// ─── getProntuario ────────────────────────────────────────────────────────────

describe('getProntuario', () => {
  it('retorna prontuário completo pelo idPaciente', async () => {
    const prontuario = await getProntuario('pac-1')
    expect(prontuario.idPaciente).toBe('pac-1')
    expect(prontuario).toHaveProperty('alergias')
    expect(prontuario).toHaveProperty('doencasCronicas')
    expect(prontuario).toHaveProperty('medicamentosUsoContinuo')
  })

  it('rejeita quando paciente não possui prontuário', async () => {
    await expect(getProntuario('pac-inexistente')).rejects.toThrow('não encontrado')
  })
})

// ─── atualizarProntuario ──────────────────────────────────────────────────────

describe('atualizarProntuario', () => {
  it('mescla os novos dados preservando campos não alterados', async () => {
    const atualizado = await atualizarProntuario('prt-1', {
      alergias: ['dipirona', 'penicilina'],
    })
    expect(atualizado.alergias).toContain('penicilina')
    expect(atualizado.idPaciente).toBe('pac-1') // campo preservado
  })

  it('rejeita quando prontuário não é encontrado', async () => {
    await expect(atualizarProntuario('prt-inexistente', { alergias: [] }))
      .rejects.toThrow('não encontrado')
  })
})
