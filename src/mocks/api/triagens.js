import { triagens as _triagensInicial } from '../data/triagens'
import { entrarNaFila } from './fila'

// Mapa fixo — não parametrizar
const PULSEIRAS = {
  1: { cor: 'VERMELHA', tempo: 0 },
  2: { cor: 'LARANJA',  tempo: 10 },
  3: { cor: 'AMARELA',  tempo: 30 },
  4: { cor: 'VERDE',    tempo: 120 },
  5: { cor: 'AZUL',     tempo: 240 },
}

const PERFIS_AUTORIZADOS = new Set(['ENFERMEIRO', 'MEDICO'])

let _estado = []

function _carregarEstado(dados) {
  _estado = dados.map(t => ({ ...t }))
}

_carregarEstado(_triagensInicial)

export function _resetTriagens(dados = _triagensInicial) {
  _carregarEstado(dados)
}

export function salvarTriagem(dados) {
  if (!PERFIS_AUTORIZADOS.has(dados.perfil)) {
    return Promise.reject(new Error('Perfil inválido: triagem exige perfil ENFERMEIRO ou MEDICO'))
  }

  if (!dados.queixaPrincipal?.trim()) {
    return Promise.reject(new Error('Queixa principal é obrigatória'))
  }

  if (dados.nivelRisco == null) {
    return Promise.reject(new Error('nivelRisco é obrigatório'))
  }

  if (!Number.isInteger(dados.nivelRisco) || dados.nivelRisco < 1 || dados.nivelRisco > 5) {
    return Promise.reject(new Error('nivelRisco deve ser um inteiro entre 1 e 5'))
  }

  const { cor, tempo } = PULSEIRAS[dados.nivelRisco]

  return entrarNaFila(dados.idPaciente, 'EMERGENCIA').then(entrada => {
    const triagem = {
      id: `tri-new-${Date.now()}`,
      dataHora: new Date().toISOString(),
      ...dados,
      corPulseira: cor,
      tempoMaximoAtendimento: tempo,
      senhaGerada: entrada.senha,
      entradaNaFila: true,
    }
    _estado.push(triagem)
    return { ...triagem }
  })
}
