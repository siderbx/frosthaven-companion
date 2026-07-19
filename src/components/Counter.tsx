interface CounterProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (next: number) => void
}

export function Counter({ label, value, min = -Infinity, max = Infinity, step = 1, onChange }: CounterProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  return (
    <div className="counter-row">
      <span className="counter-label">{label}</span>
      <div className="counter-controls">
        <button
          type="button"
          className="counter-btn"
          onClick={() => onChange(clamp(value - step))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          className="counter-value"
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (!Number.isNaN(n)) onChange(clamp(n))
          }}
        />
        <button
          type="button"
          className="counter-btn"
          onClick={() => onChange(clamp(value + step))}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
