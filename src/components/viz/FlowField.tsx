import { useEffect, useRef } from 'react'
import { useTheme, vizPalette, rgba } from '@/lib/theme'

/**
 * Descent trajectories, drawn at scale.
 *
 * Particles are released across the frame and follow the gradient of a drifting
 * potential, leaving trails. What you are watching is the same thing the
 * optimization demo shows with two paths, run with a few thousand of them, so
 * the background illustrates the group's own subject rather than borrowing
 * decoration from somewhere else.
 *
 * Trails come from painting a low-alpha wash over the previous frame instead of
 * clearing it, which is cheap and gives the streaks their length for free.
 */

const BASE_COUNT = 1400
/** Reference area the base count was tuned against, in CSS pixels. */
const BASE_AREA = 620 * 420
const FPS = 30
const SPEED = 0.0026
const LIFE = 190

/** The potential whose gradient the particles follow. */
const WELLS = [
  { x: 0.26, y: 0.32, a: 1.0, ax: 0.09, ay: 0.07, sx: 0.041, sy: 0.053, ph: 0 },
  { x: 0.74, y: 0.26, a: 0.85, ax: 0.08, ay: 0.09, sx: 0.033, sy: 0.047, ph: 1.9 },
  { x: 0.56, y: 0.74, a: -0.7, ax: 0.1, ay: 0.08, sx: 0.027, sy: 0.037, ph: 3.4 },
  { x: 0.9, y: 0.62, a: 0.6, ax: 0.07, ay: 0.1, sx: 0.049, sy: 0.031, ph: 5.1 },
]

interface Props {
  className?: string
  intensity?: number
}

export default function FlowField({ className = '', intensity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const palette = vizPalette()
    const light = theme === 'light'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hues = [
      palette.track.optimization,
      palette.track['efficient-ml'],
      palette.track.wireless,
      palette.track.generative,
      palette.track.applied,
    ]

    let w = 0
    let h = 0
    let raf = 0
    let last = 0
    let disposed = false
    let onScreen = true

    // Deterministic spawn, so the field looks the same on every load.
    let seed = 0x2545f491
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }

    // Density, not count, is what makes the field read. A fixed count spread
    // over a wide hero thins out until the streaks disappear, so scale it to
    // the area actually being covered.
    let count = BASE_COUNT
    let px = new Float32Array(BASE_COUNT)
    let py = new Float32Array(BASE_COUNT)
    let age = new Float32Array(BASE_COUNT)
    let hue = new Uint8Array(BASE_COUNT)

    const spawn = (i: number) => {
      px[i] = rnd()
      py[i] = rnd()
      age[i] = rnd() * LIFE
      hue[i] = Math.floor(rnd() * hues.length)
    }
    const allocate = () => {
      const target = Math.round(
        BASE_COUNT * Math.min(3, Math.max(0.6, (w * h) / BASE_AREA)),
      )
      if (target === count && px.length === target) return
      count = target
      px = new Float32Array(count)
      py = new Float32Array(count)
      age = new Float32Array(count)
      hue = new Uint8Array(count)
      for (let i = 0; i < count; i++) spawn(i)
    }

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
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, w, h)
      }
      return true
    }

    /** Gradient of the drifting potential at (u, v). */
    const grad = (u: number, v: number, t: number): [number, number] => {
      let gx = 0
      let gy = 0
      for (const c of WELLS) {
        const cx = c.x + Math.sin(t * c.sx + c.ph) * c.ax
        const cy = c.y + Math.cos(t * c.sy + c.ph * 1.3) * c.ay
        const dx = u - cx
        const dy = v - cy
        const d2 = dx * dx + dy * dy + 0.004
        const f = c.a / (d2 * d2)
        gx -= dx * f
        gy -= dy * f
      }
      // Rotate a little, so trajectories curve around the wells instead of
      // diving straight in and piling up.
      return [gx * 0.86 - gy * 0.5, gy * 0.86 + gx * 0.5]
    }

    const step = (t: number) => {
      if (w === 0 || h === 0) return

      // Wash instead of clear: the previous frame survives at reduced opacity,
      // which is what makes a moving dot read as a streak.
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = light ? 'rgba(251, 248, 247, 0.075)' : 'rgba(10, 7, 8, 0.085)'
      ctx.fillRect(0, 0, w, h)

      ctx.globalCompositeOperation = light ? 'multiply' : 'lighter'
      ctx.lineWidth = 1
      ctx.lineCap = 'round'

      for (let i = 0; i < count; i++) {
        const [gx, gy] = grad(px[i], py[i], t)
        const m = Math.hypot(gx, gy) + 1e-6
        const nx = px[i] + (gx / m) * SPEED
        const ny = py[i] + (gy / m) * SPEED

        ctx.beginPath()
        ctx.moveTo(px[i] * w, py[i] * h)
        ctx.lineTo(nx * w, ny * h)
        // Fade in and out over the particle's life, so nothing pops.
        const life = age[i] / LIFE
        const fade = Math.sin(life * Math.PI)
        ctx.strokeStyle = rgba(hues[hue[i]], (light ? 0.62 : 0.5) * fade * intensity)
        ctx.stroke()

        px[i] = nx
        py[i] = ny
        age[i] += 1

        if (age[i] > LIFE || nx < -0.05 || nx > 1.05 || ny < -0.05 || ny > 1.05) spawn(i)
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const tick = (now: number) => {
      if (disposed) return
      if (onScreen && now - last >= 1000 / FPS) {
        last = now
        step(now / 1000)
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    allocate()
    if (reduce) {
      // Run a fixed number of steps to lay down a still field.
      for (let k = 0; k < 90; k++) step(k * 0.04)
    } else {
      raf = requestAnimationFrame(tick)
    }

    const resizeObserver = new ResizeObserver(() => {
      if (resize()) allocate()
    })
    resizeObserver.observe(canvas)
    const intersectionObserver = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
    })
    intersectionObserver.observe(canvas)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [theme, intensity])

  return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />
}
