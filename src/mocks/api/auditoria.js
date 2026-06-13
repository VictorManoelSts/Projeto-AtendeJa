import { auditoria } from '../data/auditoria'

export function getAuditoria() {
  return Promise.resolve([...auditoria])
}

export function getTiposAcao() {
  const acoes = [...new Set(auditoria.map(a => a.acao))]
  return Promise.resolve(acoes)
}
