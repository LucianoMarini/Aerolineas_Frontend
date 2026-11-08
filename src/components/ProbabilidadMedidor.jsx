import { esPisoTecnico, formatearPorcentaje } from '../utils/formato.js'

export default function ProbabilidadMedidor({
  valor,
  nivel,
  texto,
  etiqueta = 'Probabilidad de cancelación',
  mostrarNota = true,
}) {
  const numero = Number(valor)
  const porcentaje =
    valor === null || valor === undefined || Number.isNaN(numero)
      ? null
      : Math.min(100, Math.max(0, numero * 100))
  const claseNivel = nivel ? `prob-medidor__valor--${nivel}` : ''
  const claseRelleno = nivel ? `prob-medidor__relleno--${nivel}` : ''

  return (
    <div className="prob-medidor">
      <span className="prob-medidor__etiqueta">{etiqueta}</span>
      <span className={`prob-medidor__valor ${claseNivel}`}>
        {texto || formatearPorcentaje(valor)}
      </span>
      <div
        className="prob-medidor__barra"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje ?? 0}
        aria-label={etiqueta}
      >
        <div
          className={`prob-medidor__relleno ${claseRelleno}`}
          style={{ width: `${porcentaje ?? 0}%` }}
        />
      </div>
      {mostrarNota && esPisoTecnico(valor) ? (
        <p className="prob-medidor__nota">
          Estimación con pocos datos: puede haber poca historia para esta ruta y
          aerolínea.
        </p>
      ) : null}
    </div>
  )
}
