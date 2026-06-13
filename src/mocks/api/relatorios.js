import { consultas } from '../data/consultas'
import { fila } from '../data/fila'
import { medicos } from '../data/medicos'
import { pacientes } from '../data/pacientes'

export function getAtendimentos() {
  const enriched = consultas.map(c => ({
    ...c,
    nomePaciente: pacientes.find(p => p.id === c.idPaciente)?.nome ?? '—',
    nomeMedico:   medicos.find(m => m.id === c.idMedico)?.nome ?? '—',
  }))
  return Promise.resolve(enriched)
}

export function getDadosFila() {
  return Promise.resolve(fila)
}

export function getFaltas() {
  const faltas = fila.filter(f => f.status === 'AUSENTE' || f.status === 'CANCELADO')
  return Promise.resolve(faltas)
}

export function getProdutividadeMedica() {
  const stats = medicos.map(med => {
    const atendimentos = consultas.filter(c => c.idMedico === med.id)
    const concluidos   = atendimentos.filter(c => c.status === 'CONCLUIDO').length
    return {
      id: med.id,
      nome: med.nome,
      especialidade: med.especialidade,
      status: med.status,
      totalAtendimentos: atendimentos.length,
      concluidos,
    }
  })
  return Promise.resolve(stats)
}
