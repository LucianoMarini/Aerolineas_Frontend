export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
}) {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
        {required ? <span className="form-field__req"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="form-field__hint">{hint}</p>
      ) : null}
    </div>
  )
}
