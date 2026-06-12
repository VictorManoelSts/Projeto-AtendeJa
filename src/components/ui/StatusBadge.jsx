import Badge from './Badge'

const STATUS_VARIANT = {
  AGUARDANDO:     'neutral',
  CHAMADO:        'warning',
  EM_ATENDIMENTO: 'success',
  FINALIZADO:     'neutral',
  CANCELADO:      'neutral',
  AUSENTE:        'danger',
}

export default function StatusBadge({ status }) {
  const variante = STATUS_VARIANT[status] ?? 'neutral'
  return <Badge texto={status} variante={variante} />
}
