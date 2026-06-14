import SenhaDisplay from './SenhaDisplay'
import StatusBadge from './StatusBadge'
import PulseiraBadge from './PulseiraBadge'
import Badge from './Badge'

// SLA por nível Manchester em minutos (protocolo imutável)
const SLA_POR_NIVEL = { 1: 0, 2: 10, 3: 60, 4: 120, 5: 240 }

const LABEL_PRIORIDADE = {
  GESTANTE:      'Gestante',
  IDOSO:         'Idoso 60+',
  IDOSO_80_MAIS: 'Idoso 80+',
  PCD:           'PCD',
}

const VARIANTE_PRIORIDADE = {
  GESTANTE:      'orange',
  IDOSO:         'warning',
  IDOSO_80_MAIS: 'danger',
  PCD:           'info',
}

export default function FilaCard({ paciente, posicao, tempoEstimado, status, onSairDaFila }) {
  const sla = SLA_POR_NIVEL[paciente.nivelRisco]
  const critico = typeof tempoEstimado === 'number' && sla > 0 && tempoEstimado <= sla * 0.2
  const temPrioridade = paciente.prioridade && paciente.prioridade !== 'NORMAL'

  return (
    <div
      className="w-full md:max-w-md mx-auto"
      style={{
        background: 'var(--color-bg-white)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-6)',
      }}
    >
      {critico && (
        <div
          role="alert"
          style={{
            color: 'var(--color-danger)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
            marginBottom: 'var(--space-2)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          Tempo crítico — atendimento próximo do prazo
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <SenhaDisplay senha={paciente.senha} />
        <StatusBadge status={status} />
      </div>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-1)' }}>
        Posição {posicao}
      </p>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-3)' }}>
        Tempo estimado: {typeof tempoEstimado === 'number' ? `${tempoEstimado} min` : tempoEstimado}
      </p>

      {paciente.nivelRisco && (
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <PulseiraBadge nivel={paciente.nivelRisco} />
        </div>
      )}

      {temPrioridade && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Badge
            texto={LABEL_PRIORIDADE[paciente.prioridade] ?? paciente.prioridade}
            variante={VARIANTE_PRIORIDADE[paciente.prioridade] ?? 'neutral'}
          />
        </div>
      )}

      <button
        onClick={() => onSairDaFila(paciente.id)}
        style={{
          background: 'var(--color-bg-white)',
          border: '0.5px solid var(--color-danger-bg)',
          color: 'var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2) var(--space-4)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
          minHeight: '44px',
          width: '100%',
        }}
      >
        Sair da fila
      </button>
    </div>
  )
}
