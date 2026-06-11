import { prontuarios as _prontuariosInicial } from '../data/prontuarios'

let _estado = []

function _carregarEstado(dados) {
  _estado = dados.map(p => ({ ...p }))
}

_carregarEstado(_prontuariosInicial)

export function _resetProntuario(dados = _prontuariosInicial) {
  _carregarEstado(dados)
}

export function getProntuario(idPaciente) {
  const prontuario = _estado.find(p => p.idPaciente === idPaciente)
  if (!prontuario) {
    return Promise.reject(new Error('Prontuário não encontrado'))
  }
  return Promise.resolve({ ...prontuario })
}

export function atualizarProntuario(id, dados) {
  const prontuario = _estado.find(p => p.id === id)
  if (!prontuario) {
    return Promise.reject(new Error('Prontuário não encontrado'))
  }
  Object.assign(prontuario, dados)
  return Promise.resolve({ ...prontuario })
}
