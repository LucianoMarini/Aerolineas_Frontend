import { etiquetaFranja, formatearPorcentaje } from '../utils/formato.js'

const NOMBRES_DIA = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  miércoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  sábado: 'Sábado',
  domingo: 'Domingo',
}

function textoEfecto(efecto) {
  if (efecto === '+20%') return 'Sube por clima adverso (+20%)'
  if (efecto === 'sube') return 'Aumenta el riesgo'
  if (efecto === 'baja') return 'Reduce el riesgo'
  return 'Sin efecto'
}

function claseEfecto(efecto) {
  if (efecto === 'sube' || efecto === '+20%') return 'desglose__efecto--sube'
  if (efecto === 'baja') return 'desglose__efecto--baja'
  return 'desglose__efecto--sin-efecto'
}

function Factor({ nombre, valor, efecto, tasa, nota }) {
  const porcentaje =
    tasa === null || tasa === undefined
      ? null
      : Math.min(100, Math.max(0, Number(tasa) * 100))

  return (
    <div className="desglose__factor">
      <span className="desglose__nombre">{nombre}</span>
      <span className="desglose__valor">{valor}</span>
      <span className={`desglose__efecto ${claseEfecto(efecto)}`}>
        {textoEfecto(efecto)}
      </span>
      {porcentaje !== null ? (
        <>
          <div className="desglose__barra" aria-hidden="true">
            <span style={{ width: `${porcentaje}%` }} />
          </div>
          <span className="desglose__tasa">
            Tasa histórica: {formatearPorcentaje(tasa)}
          </span>
        </>
      ) : null}
      {nota ? <span className="desglose__tasa">{nota}</span> : null}
    </div>
  )
}

export default function DesgloseFactores({ desglose }) {
  if (!desglose) {
    return (
      <p className="muted texto-chico">
        No hay desglose disponible para este vuelo.
      </p>
    )
  }

  const dia = desglose.dia || {}
  const franja = desglose.franja || {}
  const clima = desglose.clima || {}
  const tasaDia = dia.tasa_cancelacion ?? dia.tasa_demora
  const tasaFranja = franja.tasa_cancelacion ?? franja.tasa_demora
  const tasaClima = clima.tasa_cancelacion ?? clima.tasa_demora

  return (
    <div className="desglose">
      <Factor
        nombre="Día de la semana"
        valor={NOMBRES_DIA[dia.valor] || dia.valor || '—'}
        efecto={dia.efecto}
        tasa={tasaDia}
      />
      <Factor
        nombre="Franja horaria"
        valor={etiquetaFranja(franja.valor)}
        efecto={franja.efecto}
        tasa={tasaFranja}
      />
      <Factor
        nombre="Clima en el origen"
        valor={clima.adverso ? 'Adverso' : 'Favorable'}
        efecto={clima.efecto}
        tasa={tasaClima}
      />
    </div>
  )
}
