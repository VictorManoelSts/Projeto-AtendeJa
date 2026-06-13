import { medicos as _medicosInicial } from '../data/medicos'

const _usuariosInicial = [
  { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', email: 'carlos.ferreira@email.com',  perfil: 'PACIENTE',        status: 'ATIVO'   },
  { id: 'med-1', nome: 'Dr. Eduardo Rezende',     email: 'eduardo.rezende@atendeja.com', perfil: 'MEDICO',        status: 'ATIVO'   },
  { id: 'enf-1', nome: 'Ana Paula Sousa',         email: 'ana.sousa@atendeja.com',      perfil: 'ENFERMEIRO',     status: 'ATIVO'   },
  { id: 'rec-1', nome: 'Juliana Martins',         email: 'juliana.martins@atendeja.com', perfil: 'RECEPCIONISTA', status: 'ATIVO'   },
  { id: 'adm-1', nome: 'Roberto Alves',           email: 'roberto.alves@atendeja.com',  perfil: 'ADMINISTRADOR', status: 'INATIVO' },
]

let _usuarios  = _usuariosInicial.map(u => ({ ...u }))
let _contadorU = _usuarios.length

let _medicos   = _medicosInicial.map(m => ({ ...m }))
let _contadorM = _medicos.length

export function _resetAdmin() {
  _usuarios  = _usuariosInicial.map(u => ({ ...u }))
  _contadorU = _usuarios.length
  _medicos   = _medicosInicial.map(m => ({ ...m }))
  _contadorM = _medicos.length
}

/* ── Usuários ─────────────────────────────────────────────── */

export function listarUsuarios() {
  return Promise.resolve(_usuarios.map(u => ({ ...u })))
}

export function criarUsuario(dados) {
  _contadorU++
  const novo = { id: `usr-new-${_contadorU}`, status: 'ATIVO', ...dados }
  _usuarios.push(novo)
  return Promise.resolve({ ...novo })
}

export function desativarUsuario(id) {
  const u = _usuarios.find(u => u.id === id)
  if (!u) return Promise.reject(new Error('Usuário não encontrado'))
  u.status = u.status === 'ATIVO' ? 'INATIVO' : 'ATIVO'
  return Promise.resolve({ ...u })
}

export function excluirUsuario(id) {
  const idx = _usuarios.findIndex(u => u.id === id)
  if (idx === -1) return Promise.reject(new Error('Usuário não encontrado'))
  const [removido] = _usuarios.splice(idx, 1)
  return Promise.resolve({ ...removido })
}

/* ── Médicos ──────────────────────────────────────────────── */

export function listarMedicos() {
  return Promise.resolve(_medicos.map(m => ({ ...m })))
}

export function cadastrarMedico(dados) {
  _contadorM++
  const novo = { id: `med-new-${_contadorM}`, status: 'ATIVO', ...dados }
  _medicos.push(novo)
  return Promise.resolve({ ...novo })
}

export function vincularUnidade(idMedico, idUnidade) {
  const m = _medicos.find(m => m.id === idMedico)
  if (!m) return Promise.reject(new Error('Médico não encontrado'))
  m.idUnidade = idUnidade
  return Promise.resolve({ ...m })
}

export function alterarStatusMedico(idMedico, status) {
  const m = _medicos.find(m => m.id === idMedico)
  if (!m) return Promise.reject(new Error('Médico não encontrado'))
  m.status = status
  return Promise.resolve({ ...m })
}
