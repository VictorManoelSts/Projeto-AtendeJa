import { notificacoes as _notificacoesInicial } from '../data/notificacoes'

let _estado = []

function _carregarEstado(dados) {
  _estado = dados.map(n => ({ ...n }))
}

_carregarEstado(_notificacoesInicial)

export function _resetNotificacoes(dados = _notificacoesInicial) {
  _carregarEstado(dados)
}

export function listar(idUsuario) {
  return Promise.resolve(_estado.filter(n => n.idUsuario === idUsuario).map(n => ({ ...n })))
}

export function marcarLida(id) {
  const notif = _estado.find(n => n.id === id)
  if (!notif) {
    return Promise.reject(new Error('Notificação não encontrada'))
  }
  notif.lida = true
  return Promise.resolve({ ...notif })
}
