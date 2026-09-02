import { useEffect, useRef, useState } from 'react'
import { metrics } from '@/lib/metrics'

/** Counts from zero to `value` once the strip scrolls into view. */
function useCountUp(value: number, active: boolean) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    let raf = 0
    let start: number | null = null
    const DURATION = 1400
    const tick = (t: number) => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / DURATION)
      // Ease-out cubic, so it decelerates into the final number.
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, active])

  return display
}

export default function MetricsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="border-b border-ink-800 bg-ink-900/40">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-ink-800 px-6 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
        {metrics.map((metric) => (
          <MetricCell key={metric.key} metric={metric} active={visible} />
        ))}
      </dl>
    </div>
  )
}

function MetricCell({
  metric,
  active,
}: {
  metric: (typeof metrics)[number]
  active: boolean
}) {
  const display = useCountUp(metric.value, active)

  return (
    <div className="group relative px-2 py-8 lg:px-6">
      <dd className="font-mono text-3xl font-medium tracking-tight text-slate-50 tabular-nums sm:text-4xl">
        {display.toLocaleString()}
        {metric.suffix && <span className="text-signal-400">{metric.suffix}</span>}
      </dd>
      <dt className="mt-2 text-sm text-slate-400">{metric.label}</dt>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
        {metric.derived && (
          <span
            className="h-1 w-1 shrink-0 rounded-full bg-signal-500"
            title="Computed from the site's own data"
          />
        )}
        {metric.detail}
      </p>
    </div>
  )
}
