import { useEffect, useMemo, useRef, useState } from 'react'
import { rgba, useTheme, vizPalette } from '@/lib/theme'

/**
 * A working illustration of the group's optimization track.
 *
 * Two quadratic objectives disagree. Plain gradient descent follows the primary
 * objective alone and walks straight past the secondary one. Priority-constrained
 * descent keeps the primary direction and deforms it by the minimum amount needed
 * to also make progress on the secondary objective:
 *
 *     d  = -grad f1                       (primary descent direction)
 *     u  = -grad f2 / |grad f2|           (secondary descent direction)
 *     d' = d + max(0, tau*|d| - <d,u>)*u  (minimum-deviation correction)
 *
 * At tau = 0 the secondary objective is ignored unless the primary step would
 * actively climb it. At tau = 1 every step must align fully with descending it.
 * The correction is zero whenever the primary step already satisfies the
 * constraint, which is what "minimum deviation" buys you.
 *
 * The sweep runs once when the canvas scrolls into view and then rests at the
 * solved state. No React state is touched per frame, and the rAF chain ends.
 */

interface Quadratic {
  cx: number
  cy: number
  a: number
  b: number
  theta: number
}

const PRIMARY: Quadratic = { cx: 0.72, cy: -0.42, a: 1.0, b: 3.2, theta: -0.5 }
const SECONDARY: Quadratic = { cx: -0.58, cy: 0.66, a: 2.0, b: 1.15, theta: 0.35 }
const START: [number, number] = [-1.02, -0.88]

const STEPS = 240
const LEARNING_RATE = 0.03
const DURATION = 3600

function grad(q: Quadratic, x: number, y: number): [number, number] {
  const dx = x - q.cx
  const dy = y - q.cy
  const c = Math.cos(q.theta)
  const s = Math.sin(q.theta)
  const u = dx * c + dy * s
  const v = -dx * s + dy * c
  const gu = 2 * q.a * u
  const gv = 2 * q.b * v
  return [gu * c - gv * s, gu * s + gv * c]
}

/** Plain gradient descent on the primary objective only. */
function plainPath(): [number, number][] {
  const path: [number, number][] = []
  let [x, y] = START
  for (let i = 0; i < STEPS; i++) {
    path.push([x, y])
    const [gx, gy] = grad(PRIMARY, x, y)
    x -= LEARNING_RATE * gx
    y -= LEARNING_RATE * gy
  }
  return path
}

/** Priority-constrained descent: primary direction, minimally corrected. */
function constrainedPath(tau: number): [number, number][] {
  const path: [number, number][] = []
  let [x, y] = START
  for (let i = 0; i < STEPS; i++) {
    path.push([x, y])

    const [g1x, g1y] = grad(PRIMARY, x, y)
    let dx = -g1x
    let dy = -g1y

    const [g2x, g2y] = grad(SECONDARY, x, y)
    const g2n = Math.hypot(g2x, g2y)

    if (g2n > 1e-9) {
      // Unit direction that descends the secondary objective.
      const ux = -g2x / g2n
      const uy = -g2y / g2n
      const dNorm = Math.hypot(dx, dy)
      const deficit = tau * dNorm - (dx * ux + dy * uy)
      if (deficit > 0) {
        dx += deficit * ux
        dy += deficit * uy
      }
    }

    x += LEARNING_RATE * dx
    y += LEARNING_RATE * dy
  }
  return path
}

interface Props {
  /** Ambient mode drops the controls and dims everything for use behind text. */
  ambient?: boolean
  className?: string
}

export default function ConstrainedDescent({ ambient = false, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const replayRef = useRef<(() => void) | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [tau, setTau] = useState(ambient ? 0.6 : 0.5)
  const theme = useTheme()

  const paths = useMemo(
    () => ({ plain: plainPath(), constrained: constrainedPath(tau) }),
    [tau],
  )
  const pathsRef = useRef(paths)
  pathsRef.current = paths

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const palette = vizPalette()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let start: number | null = null
    let disposed = false

    // CSS pixel size of the backing store, kept in sync by the ResizeObserver
    // below. Sizing never happens inside draw(): writing canvas.width changes
    // the element and would re-fire the observers that drive the animation.
    let w = 0
    let h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      w = rect.width
      h = rect.height
      const bw = Math.round(w * dpr)
      const bh = Math.round(h * dpr)
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      return true
    }

    const draw = (progress: number) => {
      if (w === 0 || h === 0) return
      ctx.clearRect(0, 0, w, h)

      // World [-1.6, 1.6] mapped to the canvas, preserving aspect ratio.
      const span = 3.2
      const scale = Math.min(w, h) / span
      const ox = w / 2
      const oy = h / 2
      const px = (x: number) => ox + x * scale
      const py = (y: number) => oy - y * scale

      const dim = ambient ? 0.62 : 1

      const contour = (q: Quadratic, level: number, color: string) => {
        ctx.beginPath()
        ctx.ellipse(
          px(q.cx),
          py(q.cy),
          Math.sqrt(level / q.a) * scale,
          Math.sqrt(level / q.b) * scale,
          -q.theta,
          0,
          Math.PI * 2,
        )
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Primary objective: the landscape being descended.
      for (let i = 1; i <= 7; i++) {
        contour(PRIMARY, (i * 0.3) ** 2, rgba(palette.neutral, 0.2 * dim))
      }
      // Secondary objective: the competing constraint.
      for (let i = 1; i <= 5; i++) {
        contour(SECONDARY, (i * 0.32) ** 2, rgba(palette.track['efficient-ml'], 0.22 * dim))
      }

      const drawPath = (
        pts: [number, number][],
        color: string,
        width: number,
        dashed: boolean,
      ) => {
        const n = Math.max(2, Math.floor(pts.length * progress))
        ctx.beginPath()
        ctx.moveTo(px(pts[0][0]), py(pts[0][1]))
        for (let i = 1; i < n; i++) ctx.lineTo(px(pts[i][0]), py(pts[i][1]))
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.setLineDash(dashed ? [4, 5] : [])
        ctx.stroke()
        ctx.setLineDash([])

        const head = pts[Math.min(n, pts.length) - 1]
        ctx.beginPath()
        ctx.arc(px(head[0]), py(head[1]), width * 1.9, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }

      drawPath(pathsRef.current.plain, rgba(palette.neutral, 0.5 * dim), 1.5, true)
      drawPath(pathsRef.current.constrained, rgba(palette.accent, 0.95 * dim), 2.25, false)

      const minimum = (q: Quadratic, color: string) => {
        ctx.beginPath()
        ctx.arc(px(q.cx), py(q.cy), 3, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px(q.cx), py(q.cy), 8, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.stroke()
      }
      minimum(PRIMARY, rgba(palette.neutral, 0.85 * dim))
      minimum(SECONDARY, rgba(palette.track['efficient-ml'], 0.8 * dim))

      ctx.beginPath()
      ctx.arc(px(START[0]), py(START[1]), 3, 0, Math.PI * 2)
      ctx.fillStyle = rgba(palette.neutral, 0.8 * dim)
      ctx.fill()
    }

    // One sweep, then rest at the solved state. The rAF chain ends when the
    // sweep completes, so an idle tab costs nothing.
    let playing = false
    let progress = reduce ? 1 : 0

    const tick = (t: number) => {
      if (disposed) return
      if (start === null) start = t
      progress = Math.min(1, (t - start) / DURATION)
      draw(progress)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        playing = false
      }
    }

    const play = () => {
      if (disposed || playing || reduce) return
      playing = true
      start = null
      raf = requestAnimationFrame(tick)
    }

    const resizeObserver = new ResizeObserver(() => {
      // Repaint at the current progress. Never restart the sweep from here.
      if (resize()) draw(progress)
    })
    resizeObserver.observe(canvas)

    if (reduce) {
      if (resize()) draw(1)
    } else {
      resize()
      // Start once the canvas is on screen. `playing` keeps repeat callbacks
      // from restarting a sweep that is already running.
      const observer = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) play()
        },
        { threshold: 0.2 },
      )
      observer.observe(canvas)
      observerRef.current = observer
    }

    replayRef.current = play

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      observerRef.current?.disconnect()
      observerRef.current = null
      replayRef.current = null
    }
  }, [ambient, tau, theme])

  if (ambient) {
    return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />
  }

  return (
    <div className={`rounded-xl border border-ink-700/60 bg-ink-900/50 p-5 ${className}`}>
      <div className="aspect-square w-full sm:aspect-4/3">
        <canvas
          ref={canvasRef}
          onPointerEnter={() => replayRef.current?.()}
          className="h-full w-full"
          role="img"
          aria-label="Two descent trajectories over competing quadratic objectives. Plain gradient descent runs straight to the primary minimum, while priority-constrained descent bends to make progress on the secondary objective as well."
        />
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <Legend color="var(--color-signal-400)" label="Priority-constrained descent" />
          <Legend color="var(--viz-neutral)" label="Plain gradient descent" dashed />
          <Legend color="var(--color-track-efficient-ml)" label="Secondary objective" />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="tau" className="font-mono text-xs tracking-wider text-slate-400">
              &tau; = {tau.toFixed(2)}
            </label>
            <span className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
              constraint strength
            </span>
          </div>
          <input
            id="tau"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={tau}
            onChange={(e) => setTau(Number(e.target.value))}
            className="mt-2 w-full accent-signal-400"
          />
          <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
            {tau < 0.08
              ? 'At zero, the secondary objective only intervenes when the primary step would actively climb it.'
              : tau > 0.85
                ? 'Near one, every step must align with descending the secondary objective, and the primary path is heavily deformed.'
                : 'Each step keeps the primary descent direction and is corrected by the smallest amount that still guarantees progress on the secondary objective.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-slate-400">
      <svg width="18" height="8" aria-hidden="true">
        <line
          x1="0"
          y1="4"
          x2="18"
          y2="4"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? '3 3' : undefined}
        />
      </svg>
      {label}
    </span>
  )
}
