const TEXTO_POR_DEFECTO =
  'La probabilidad de cancelación y retraso solo aplica a vuelos PROGRAMADOS. Los vuelos que ya partieron o arribaron muestran probabilidades no disponibles.'

export default function Disclaimer({ texto }) {
  return (
    <div className="disclaimer">
      <span className="disclaimer__icono" aria-hidden="true">
        i
      </span>
      <p>{texto || TEXTO_POR_DEFECTO}</p>
    </div>
  )
}
