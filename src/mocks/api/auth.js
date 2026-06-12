const _usuarios = [
  { id: 'pac-1', nome: 'Carlos Eduardo Ferreira', email: 'carlos.ferreira@email.com', perfil: 'PACIENTE' },
  { id: 'med-1', nome: 'Dr. Eduardo Rezende', email: 'eduardo.rezende@atendeja.com', perfil: 'MEDICO' },
  { id: 'enf-1', nome: 'Ana Paula Sousa', email: 'ana.sousa@atendeja.com', perfil: 'ENFERMEIRO' },
  { id: 'rec-1', nome: 'Juliana Martins', email: 'juliana.martins@atendeja.com', perfil: 'RECEPCIONISTA' },
  { id: 'adm-1', nome: 'Roberto Alves', email: 'roberto.alves@atendeja.com', perfil: 'ADMINISTRADOR' },
]

const _senhas = {
  'carlos.ferreira@email.com': '123456',
  'eduardo.rezende@atendeja.com': '123456',
  'ana.sousa@atendeja.com': '123456',
  'juliana.martins@atendeja.com': '123456',
  'roberto.alves@atendeja.com': '123456',
}

let _sessao = null

export function login(email, senha) {
  const usuario = _usuarios.find(u => u.email === email)
  if (!usuario || _senhas[email] !== senha) {
    return Promise.reject(new Error('Credenciais inválidas'))
  }
  _sessao = { usuario, token: `mock-token-${usuario.id}` }
  return Promise.resolve({ usuario: _sessao.usuario, token: _sessao.token })
}

export function logout() {
  _sessao = null
  return Promise.resolve()
}

export function getUsuarioLogado() {
  return Promise.resolve(_sessao?.usuario ?? null)
}
