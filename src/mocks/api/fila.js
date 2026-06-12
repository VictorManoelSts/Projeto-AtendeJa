import { fila as _filaInicial } from '../data/fila'
import { pacientes } from '../data/pacientes'

const PRIORIDADE_PESO = {
  IDOSO_80_MAIS: 1,
  GESTANTE:      2,
  IDOSO_60_79:   3,
  IDOSO:         3, // alias para dados legados
  PCD:           4,
  NORMAL:        5,
}

const PREFIXO = {
  CONSULTA:   'CM',
  EXAME:      'EX',
  CIRURGIA:   'CI',
  EMERGENCIA: 'EM',
}

const LIMITE = 70
const STATUS_ATIVO = new Set(['AGUARDANDO', 'CHAMADO', 'EM_ATENDIMENTO'])

let _estado = []
let _contadores = {}

function _carregarEstado(dados) {
  _estado = dados.map(e => ({ ...e }))
  _contadores = { CONSULTA: 0, EXAME: 0, CIRURGIA: 0, EMERGENCIA: 0 }
  // Inicializa contadores a partir das senhas existentes para evitar duplicatas
  _estado.forEach(e => {
    const pref = PREFIXO[e.tipoFila]
    if (!pref) return
    const num = parseInt(e.senha?.slice(pref.length), 10)
    if (!isNaN(num) && num > (_contadores[e.tipoFila] ?? 0)) {
      _contadores[e.tipoFila] = num
    }
  })
}

_carregarEstado(_filaInicial)

export function _resetFila(dados = _filaInicial) {
  _carregarEstado(dados)
}

function _isAtivo(e) {
  return STATUS_ATIVO.has(e.status)
}

function _ordenar(lista) {
  return [...lista].sort((a, b) => {
    // 1. nivelRisco — null vai para o final
    const ra = a.nivelRisco ?? 999
    const rb = b.nivelRisco ?? 999
    if (ra !== rb) return ra - rb

    // 2. prioridade legal
    const pa = PRIORIDADE_PESO[a.prioridade] ?? 5
    const pb = PRIORIDADE_PESO[b.prioridade] ?? 5
    if (pa !== pb) return pa - pb

    // 3. FIFO por horário de entrada
    return new Date(a.horarioEntrada) - new Date(b.horarioEntrada)
  })
}

export function getFila(tipo) {
  const ativos = _estado.filter(e => e.tipoFila === tipo && _isAtivo(e))
  return Promise.resolve(_ordenar(ativos))
}

export function entrarNaFila(idPaciente, tipo) {
  if (_estado.some(e => e.idPaciente === idPaciente && _isAtivo(e))) {
    return Promise.reject(new Error('Paciente já possui uma fila ativa'))
  }

  const ativosNoTipo = _estado.filter(e => e.tipoFila === tipo && _isAtivo(e))
  if (ativosNoTipo.length >= LIMITE) {
    return Promise.reject(new Error('Fila atingiu o limite máximo de 70 pacientes'))
  }

  const paciente = pacientes.find(p => p.id === idPaciente)
  const prioridade = paciente?.prioridade ?? 'NORMAL'

  _contadores[tipo] = (_contadores[tipo] ?? 0) + 1
  const senha = `${PREFIXO[tipo]}${String(_contadores[tipo]).padStart(3, '0')}`

  const novaEntrada = {
    id: `fil-new-${Date.now()}-${_contadores[tipo]}`,
    idPaciente,
    tipoFila: tipo,
    senha,
    nivelRisco: null,
    prioridade,
    horarioEntrada: new Date().toISOString(),
    status: 'AGUARDANDO',
    posicaoOriginal: ativosNoTipo.length + 1,
  }

  _estado.push(novaEntrada)
  return Promise.resolve({ ...novaEntrada })
}

export function chamarProximo(tipo) {
  const aguardando = _estado.filter(e => e.tipoFila === tipo && e.status === 'AGUARDANDO')
  const [proximo] = _ordenar(aguardando)

  if (!proximo) {
    return Promise.reject(new Error('Nenhum paciente aguardando'))
  }

  const entrada = _estado.find(e => e.id === proximo.id)
  entrada.status = 'CHAMADO'
  return Promise.resolve({ ...entrada })
}

export function marcarAusente(idFila) {
  const entrada = _estado.find(e => e.id === idFila)
  if (!entrada) {
    return Promise.reject(new Error('Entrada não encontrada'))
  }
  entrada.status = 'AUSENTE'
  return Promise.resolve({ ...entrada })
}

export function sairDaFila(idFila) {
  const entrada = _estado.find(e => e.id === idFila)
  if (!entrada) {
    return Promise.reject(new Error('Entrada não encontrada'))
  }
  entrada.status = 'CANCELADO'
  return Promise.resolve({ ...entrada })
}

export function getMinhaposicao(id) {
  const entrada = _estado.find(e => e.id === id)
  if (!entrada || !_isAtivo(entrada)) {
    return Promise.reject(new Error('Entrada não encontrada ou inativa'))
  }

  const aguardando = _estado.filter(e => e.tipoFila === entrada.tipoFila && e.status === 'AGUARDANDO')
  const ordenados = _ordenar(aguardando)
  const idx = ordenados.findIndex(e => e.id === id)
  const posicao = idx === -1 ? 0 : idx + 1
  const tempoEstimado = Math.max(0, (posicao - 1) * 15)

  return Promise.resolve({ posicao, tempoEstimado, senha: entrada.senha })
}
