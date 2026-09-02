import { useMemo, useState } from 'react'
import { rgba } from '@/lib/theme'
import { useCanvasPainter } from './useCanvasPainter'

/**
 * Generative and Representation Learning track.
 *
 * Class structure is not present in the input and fully formed in the output.
 * It emerges gradually, layer by layer, and the interesting question is how
 * fast and how far. Each class starts drawn from one shared distribution and is
 * pushed toward its own center as depth increases, while within-class spread
 * contracts.
 *
 * The readout is a Fisher-style separation ratio: between-class scatter over
 * within-class scatter. That single number is what the group's empirical work
 * on vision transformers tracks across depth.
 */

const CLASSES = 3
const PER_CLASS = 90
const DEPTH_MAX = 12

/** Deterministic sampler, so the layout is stable across renders and reloads. */
function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Box-Muller, for round Gaussian blobs rather than square uniform ones. */
function gaussianPair(rng: () => number): [number, number] {
  const u = Math.max(rng(), 1e-9)
  const v = rng()
  const r = Math.sqrt(-2 * Math.log(u))
  return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)]
}

interface Point {
  cls: number
  /** Offset from the class center, fixed for the life of the point. */
  ox: number
  oy: number
}

const POINTS: Point[] = (() => {
  const rng = makeRng(20260902)
  const out: Point[] = []
  for (let c = 0; c < CLASSES; c++) {
    for (let i = 0; i < PER_CLASS; i++) {
      const [ox, oy] = gaussianPair(rng)
      out.push({ cls: c, ox, oy })
    }
  }
  return out
})()

/** Class centers on a circle, so no class is privileged by position. */
const CENTERS = Array.from({ length: CLASSES }, (_, c) => {
  const a = (c / CLASSES) * Math.PI * 2 - Math.PI / 2
  return [Math.cos(a) * 0.62, Math.sin(a) * 0.62] as [number, number]
})

/**
 * Positions at a given depth. Centers separate along a saturating curve while
 * within-class spread contracts, which is the behavior reported empirically.
 */
function layout(depth: number) {
  const t = depth / DEPTH_MAX
  const separation = 1 - Math.exp(-3.1 * t)
  const spread = 0.34 * (1 - 0.62 * separation)

  const positions = POINTS.map((p) => {
    const [cx, cy] = CENTERS[p.cls]
    return {
      cls: p.cls,
      x: cx * separation + p.ox * spread,
      y: cy * separation + p.oy * spread,
    }
  })

  // Fisher-style ratio of between-class to within-class scatter.
  const globalX = positions.reduce((a, p) => a + p.x, 0) / positions.length
  const globalY = positions.reduce((a, p) => a + p.y, 0) / positions.length
  let between = 0
  let within = 0
  for (let c = 0; c < CLASSES; c++) {
    const members = positions.filter((p) => p.cls === c)
    const mx = members.reduce((a, p) => a + p.x, 0) / members.length
    const my = members.reduce((a, p) => a + p.y, 0) / members.length
    between += members.length * ((mx - globalX) ** 2 + (my - globalY) ** 2)
    for (const p of members) within += (p.x - mx) ** 2 + (p.y - my) ** 2
  }
  return { positions, ratio: within > 0 ? between / within : 0 }
}

interface Props {
  ambient?: boolean
  className?: string
}

export default function SeparationDemo({ ambient = false, className = '' }: Props) {
  const [depth, setDepth] = useState(ambient ? 8 : 4)
  const { positions, ratio } = useMemo(() => layout(depth), [depth])

  const canvasRef = useCanvasPainter(
    ({ ctx, w, h, palette }) => {
      const dim = ambient ? 0.55 : 1
      const scale = Math.min(w, h) / 2.5
      const px = (x: number) => w / 2 + x * scale
      const py = (y: number) => h / 2 + y * scale

      const colors = [
        palette.track.generative,
        palette.accent,
        palette.track['efficient-ml'],
      ]

      // Class hulls, drawn as one-sigma circles around each center.
      for (let c = 0; c < CLASSES; c++) {
        const members = positions.filter((p) => p.cls === c)
        const mx = members.reduce((a, p) => a + p.x, 0) / members.length
        const my = members.reduce((a, p) => a + p.y, 0) / members.length
        const sd = Math.sqrt(
          members.reduce((a, p) => a + (p.x - mx) ** 2 + (p.y - my) ** 2, 0) / members.length,
        )
        ctx.beginPath()
        ctx.arc(px(mx), py(my), sd * scale, 0, Math.PI * 2)
        ctx.strokeStyle = rgba(colors[c], 0.3 * dim)
        ctx.lineWidth = 1
        ctx.setLineDash([3, 4])
        ctx.stroke()
        ctx.setLineDash([])
      }

      for (const p of positions) {
        ctx.beginPath()
        ctx.arc(px(p.x), py(p.y), 2.6, 0, Math.PI * 2)
        ctx.fillStyle = rgba(colors[p.cls], 0.78 * dim)
        ctx.fill()
      }
    },
    [positions, ambient],
  )

  if (ambient) {
    return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />
  }

  return (
    <div className={className}>
      <div className="aspect-square w-full sm:aspect-4/3">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          role="img"
          aria-label={`Three classes of points at network depth ${depth}, with a separation ratio of ${ratio.toFixed(2)}.`}
        />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="depth" className="font-mono text-xs tracking-wider text-slate-400">
              layer {depth} of {DEPTH_MAX}
            </label>
            <span className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
              network depth
            </span>
          </div>
          <input
            id="depth"
            type="range"
            min={0}
            max={DEPTH_MAX}
            step={1}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="mt-2 w-full accent-track-generative"
          />
        </div>

        <dl className="grid grid-cols-2 gap-4 border-t border-ink-800 pt-4">
          <Stat value={ratio.toFixed(2)} label="between / within scatter" />
          <Stat
            value={depth === 0 ? 'none' : ratio > 3 ? 'linear' : 'partial'}
            label="separability"
          />
        </dl>

        <p className="text-xs leading-relaxed text-slate-500">
          {depth === 0
            ? 'At the input every class is drawn from the same distribution. Nothing separates them yet.'
            : ratio > 3
              ? 'The classes are now linearly separable and the gain per layer has flattened. The layers after this point are doing something other than separating.'
              : 'Between-class distance grows while within-class spread contracts. Most of the separation is bought in the early layers.'}
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
