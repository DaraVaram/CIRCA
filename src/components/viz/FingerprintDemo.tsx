import { useMemo, useState } from 'react'
import { rgba } from '@/lib/theme'
import { useCanvasPainter } from './useCanvasPainter'

/**
 * Applied and Trustworthy ML track.
 *
 * A Wi-Fi fingerprinting system locates you by comparing the signal strengths
 * you see against a survey. That only works while distinct places produce
 * distinct readings. Access points are the anchors of that guarantee, and they
 * are also the attack surface: take enough of them down and different rooms
 * start looking identical.
 *
 * Each cell here holds an RSSI vector from the live access points. A cell is
 * counted as resolvable when no other cell sits within a small distance of it
 * in that vector space. Switch access points off and watch the guarantee go.
 */

const GRID = 16
const AP_POSITIONS: [number, number][] = [
  [0.1, 0.12],
  [0.88, 0.14],
  [0.5, 0.5],
  [0.12, 0.86],
  [0.9, 0.88],
  [0.68, 0.28],
]
/** Below this vector distance two cells are treated as indistinguishable. */
const AMBIGUITY = 2.6

/** Log-distance path loss, the standard indoor model. */
function rssi(cell: [number, number], ap: [number, number]): number {
  const d = Math.max(0.04, Math.hypot(cell[0] - ap[0], cell[1] - ap[1]))
  return -30 - 10 * 2.8 * Math.log10(d / 0.04)
}

const CELLS: [number, number][] = (() => {
  const out: [number, number][] = []
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      out.push([(c + 0.5) / GRID, (r + 0.5) / GRID])
    }
  }
  return out
})()

/** Full RSSI table, computed once. Disabling an access point drops a column. */
const TABLE = CELLS.map((cell) => AP_POSITIONS.map((ap) => rssi(cell, ap)))

function resolve(active: boolean[]) {
  const cols = active.flatMap((on, i) => (on ? [i] : []))
  if (cols.length === 0) return { resolvable: CELLS.map(() => false), count: 0 }

  const vectors = TABLE.map((row) => cols.map((i) => row[i]))
  const resolvable = vectors.map((v, i) => {
    for (let j = 0; j < vectors.length; j++) {
      if (i === j) continue
      let sq = 0
      for (let k = 0; k < v.length; k++) sq += (v[k] - vectors[j][k]) ** 2
      if (Math.sqrt(sq) < AMBIGUITY) return false
    }
    return true
  })
  return { resolvable, count: resolvable.filter(Boolean).length }
}

interface Props {
  ambient?: boolean
  className?: string
}

export default function FingerprintDemo({ ambient = false, className = '' }: Props) {
  const [active, setActive] = useState<boolean[]>(() => AP_POSITIONS.map(() => true))
  const { resolvable, count } = useMemo(() => resolve(active), [active])
  const pct = Math.round((count / CELLS.length) * 100)

  const canvasRef = useCanvasPainter(
    ({ ctx, w, h, palette }) => {
      const dim = ambient ? 0.55 : 1
      const size = Math.min(w, h)
      const ox = (w - size) / 2
      const oy = (h - size) / 2
      const cell = size / GRID
      const good = palette.track.applied
      const bad = palette.accent

      CELLS.forEach((c, i) => {
        const x = ox + (c[0] - 0.5 / GRID) * size
        const y = oy + (c[1] - 0.5 / GRID) * size
        ctx.fillStyle = resolvable[i]
          ? rgba(good, 0.3 * dim)
          : rgba(bad, 0.34 * dim)
        ctx.fillRect(x + 0.7, y + 0.7, cell - 1.4, cell - 1.4)
      })

      // Access points on top of the grid.
      AP_POSITIONS.forEach((ap, i) => {
        const x = ox + ap[0] * size
        const y = oy + ap[1] * size
        const on = active[i]
        const color = on ? palette.body : palette.faint

        if (on) {
          ctx.beginPath()
          ctx.arc(x, y, 13, 0, Math.PI * 2)
          ctx.strokeStyle = rgba(palette.track.applied, 0.4 * dim)
          ctx.lineWidth = 1
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(x, y, 7, 0, Math.PI * 2)
        ctx.fillStyle = rgba(palette.surface, 0.95)
        ctx.fill()
        ctx.strokeStyle = rgba(color, dim)
        ctx.lineWidth = 1.6
        ctx.stroke()

        if (!on) {
          // Struck through when disabled.
          ctx.beginPath()
          ctx.moveTo(x - 5, y - 5)
          ctx.lineTo(x + 5, y + 5)
          ctx.strokeStyle = rgba(palette.accent, 0.9 * dim)
          ctx.lineWidth = 1.6
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(x, y, 2.4, 0, Math.PI * 2)
          ctx.fillStyle = rgba(color, dim)
          ctx.fill()
        }
      })
    },
    [active, resolvable, ambient],
  )

  const toggleNearest = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.min(rect.width, rect.height)
    const ox = (rect.width - size) / 2
    const oy = (rect.height - size) / 2
    const u = (e.clientX - rect.left - ox) / size
    const v = (e.clientY - rect.top - oy) / size

    let best = -1
    let bestD = Infinity
    AP_POSITIONS.forEach((ap, i) => {
      const d = Math.hypot(ap[0] - u, ap[1] - v)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    // Only toggle when the click actually landed on an access point.
    if (best >= 0 && bestD < 0.06) {
      setActive((prev) => prev.map((on, i) => (i === best ? !on : on)))
    }
  }

  if (ambient) {
    return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />
  }

  const liveAps = active.filter(Boolean).length

  return (
    <div className={className}>
      <div
        className="aspect-square w-full cursor-pointer touch-none"
        onPointerDown={toggleNearest}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          role="img"
          aria-label={`A ${GRID} by ${GRID} floor grid with ${liveAps} of ${AP_POSITIONS.length} access points live. ${pct} percent of locations remain uniquely identifiable.`}
        />
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <Swatch color="var(--color-track-applied)" label="Uniquely identifiable" />
          <Swatch color="var(--color-signal-400)" label="Ambiguous" />
        </div>

        <div className="flex flex-wrap gap-2">
          {AP_POSITIONS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive((prev) => prev.map((on, j) => (j === i ? !on : on)))}
              aria-pressed={active[i]}
              className={`rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                active[i]
                  ? 'border-track-applied/50 bg-track-applied/10 text-track-applied'
                  : 'border-ink-700 text-slate-600 line-through'
              }`}
            >
              AP {i + 1}
            </button>
          ))}
        </div>

        <dl className="grid grid-cols-3 gap-4 border-t border-ink-800 pt-4">
          <Stat value={`${liveAps}/${AP_POSITIONS.length}`} label="access points live" />
          <Stat value={`${pct}%`} label="locations resolvable" />
          <Stat value={String(CELLS.length - count)} label="ambiguous cells" />
        </dl>

        <p className="text-xs leading-relaxed text-slate-500">
          {pct > 90
            ? 'With the full set of anchors, almost every cell has a signature no other cell shares. Click an access point to take it offline.'
            : pct > 55
              ? 'Coverage is degrading unevenly. The cells that fail first are the ones whose remaining anchors are nearly collinear with them.'
              : 'The system has lost its guarantee. Whole regions now look alike, and a position estimate inside them is a guess.'}
        </p>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="font-mono text-lg text-slate-100 tabular-nums">{value}</dd>
      <dt className="mt-0.5 text-[11px] text-slate-500">{label}</dt>
    </div>
  )
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-slate-400">
      <span
        className="h-2.5 w-2.5 rounded-[2px]"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 45%, transparent)` }}
      />
      {label}
    </span>
  )
}
