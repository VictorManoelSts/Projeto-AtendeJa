import { consultas as _consultasInicial } from '../data/consultas'
import { medicos } from '../data/medicos'

const STATUS_DISPONIVEL = new Set(['ATIVO', 'PLANTAO'])
const LIMITE_CANCELAMENTOS_30_DIAS = 2

let _estado = []
let _contador = 0

function _carregarEstado(dados) {
  _estado = dados.map(c => ({ ...c }))
  _contador = _estado.length
}

_carregarEstado(_consultasInicial)

export function _resetConsultas(dados = _consultasInicial) {
  _carregarEstado(dados)
}

export function agendar(dados) {
  const medico = medicos.find(m => m.id === dados.idMedico)
  if (!medico || !STATUS_DISPONIVEL.has(medico.status)) {
    return Promise.reject(new Error('Médico indisponível'))
  }

  _contador++
  const nova = {
    contadorCancelamentos: 0,
    status: 'AGENDADO',
    ...dados,
    id: `con-new-${_contador}`,
  }
  _estado.push(nova)
  return Promise.resolve({ ...nova })
}

export function listar(idPaciente) {
  return Promise.resolve(_estado.filter(c => c.idPaciente === idPaciente).map(c => ({ ...c })))
}

function _cancelamentosRecentes(idPaciente) {
  const limite = new Date()
  limite.setDate(limite.getDate() - 30)
  return _estado.filter(
    c =>
      c.idPaciente === idPaciente &&
      c.status === 'CANCELADO' &&
      c.dataCancelamento &&
      new Date(c.dataCancelamento) >= limite
  ).length
}

export function cancelar(id) {
  const consulta = _estado.find(c => c.id === id)
  if (!consulta) {
    return Promise.reject(new Error('Consulta não encontrada'))
  }

  if (_cancelamentosRecentes(consulta.idPaciente) >= LIMITE_CANCELAMENTOS_30_DIAS) {
    return Promise.reject(new Error('Limite de cancelamentos atingido para o período de 30 dias'))
  }

  consulta.status = 'CANCELADO'
  consulta.contadorCancelamentos = (consulta.contadorCancelamentos ?? 0) + 1
  consulta.dataCancelamento = new Date().toISOString()

  return Promise.resolve({ ...consulta })
}

export function confirmarCheckin(id, origemCheckin) {
  const consulta = _estado.find(c => c.id === id)
  if (!consulta) {
    return Promise.reject(new Error('Consulta não encontrada'))
  }
  consulta.status = 'CONFIRMADO'
  consulta.origemCheckin = origemCheckin
  consulta.dataCheckin = new Date().toISOString()
  return Promise.resolve({ ...consulta })
}

export function reagendar(id, data, motivo) {
  if (!motivo?.trim()) {
    return Promise.reject(new Error('Motivo é obrigatório para reagendamento'))
  }

  const consulta = _estado.find(c => c.id === id)
  if (!consulta) {
    return Promise.reject(new Error('Consulta não encontrada'))
  }

  consulta.dataHora = data
  consulta.motivoReagendamento = motivo

  return Promise.resolve({ ...consulta })
}
