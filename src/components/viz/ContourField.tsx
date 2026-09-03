import { useEffect, useRef } from 'react'
import { useTheme, vizPalette, rgba } from '@/lib/theme'

/**
 * A slowly morphing topographic field: the level sets of a scalar function that
 * drifts over time, drawn with marching squares.
 *
 * This is the group's own subject matter used as decoration. Every demo on the
 * site draws contours of an objective, and a constraint is a level set, so the
 * background is the same picture at a larger scale rather than an unrelated
 * gradient.
 *
 * Lines rather than blur means it stays crisp at any size, costs almost nothing
 * to draw, and never reads as a smudge.
 */

const COLS = 68
const ROWS = 44
const LEVELS = 9
const FPS = 24

/** Six drifting Gaussian bumps. Their sum is the surface being contoured. */
const BUMPS = [
  { x: 0.24, y: 0.3, s: 0.3, a: 1.0, ax: 0.1, ay: 0.08, sx: 0.05, sy: 0.07, ph: 0 },
  { x: 0.72, y: 0.24, s: 0.26, a: 0.9, ax: 0.09, ay: 0.07, sx: 0.043, sy: 0.061, ph: 1.4 },
  { x: 0.52, y: 0.7, s: 0.32, a: -0.8, ax: 0.11, ay: 0.09, sx: 0.037, sy: 0.049, ph: 2.9 },
  { x: 0.86, y: 0.66, s: 0.24, a: 0.75, ax: 0.08, ay: 0.1, sx: 0.059, sy: 0.041, ph: 4.2 },
  { x: 0.12, y: 0.76, s: 0.22, a: 0.6, ax: 0.1, ay: 0.06, sx: 0.031, sy: 0.067, ph: 5.6 },
  { x: 0.44, y: 0.44, s: 0.4, a: -0.5, ax: 0.13, ay: 0.11, sx: 0.023, sy: 0.029, ph: 0.7 },
]

interface Props {
  className?: string
  intensity?: number
}

export default function ContourField({ className = '', intensity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const palette = vizPalette()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // One color per level, cycling the track hues from the inside out.
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
    const field = new Float32Array((COLS + 1) * (ROWS + 1))

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

    const sample = (t: number) => {
      for (let j = 0; j <= ROWS; j++) {
        const v = j / ROWS
        for (let i = 0; i <= COLS; i++) {
          const u = i / COLS
          let sum = 0
          for (const b of BUMPS) {
            const bx = b.x + Math.sin(t * b.sx + b.ph) * b.ax
            const by = b.y + Math.cos(t * b.sy + b.ph * 1.3) * b.ay
            const dx = (u - bx) / b.s
            const dy = (v - by) / b.s
            sum += b.a * Math.exp(-(dx * dx + dy * dy))
          }
          field[j * (COLS + 1) + i] = sum
        }
      }
    }

    const draw = (t: number) => {
      if (w === 0 || h === 0) return
      ctx.clearRect(0, 0, w, h)
      sample(t)

      const cw = w / COLS
      const ch = h / ROWS
      // Interpolate the crossing along each edge, so lines are smooth rather
      // than stepping from cell to cell.
      const lerp = (a: number, b: number, level: number) => (level - a) / (b - a)

      for (let l = 0; l < LEVELS; l++) {
        const level = -0.55 + (l / (LEVELS - 1)) * 1.5
        const color = hues[l % hues.length]
        ctx.beginPath()

        for (let j = 0; j < ROWS; j++) {
          for (let i = 0; i < COLS; i++) {
            const i0 = j * (COLS + 1) + i
            const tl = field[i0]
            const tr = field[i0 + 1]
            const bl = field[i0 + COLS + 1]
            const br = field[i0 + COLS + 2]

            // Marching squares: the four corners above or below the level give
            // 16 cases, and each case is one or two segments across the cell.
            let code = 0
            if (tl > level) code |= 8
            if (tr > level) code |= 4
            if (br > level) code |= 2
            if (bl > level) code |= 1
            if (code === 0 || code === 15) continue

            const x0 = i * cw
            const y0 = j * ch
            const top = { x: x0 + lerp(tl, tr, level) * cw, y: y0 }
            const right = { x: x0 + cw, y: y0 + lerp(tr, br, level) * ch }
            const bottom = { x: x0 + lerp(bl, br, level) * cw, y: y0 + ch }
            const left = { x: x0, y: y0 + lerp(tl, bl, level) * ch }

            const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
            }

            switch (code) {
              case 1:
              case 14:
                seg(left, bottom)
                break
              case 2:
              case 13:
                seg(bottom, right)
                break
              case 3:
              case 12:
                seg(left, right)
                break
              case 4:
              case 11:
                seg(top, right)
                break
              case 5:
                seg(left, top)
                seg(bottom, right)
                break
              case 6:
              case 9:
                seg(top, bottom)
                break
              case 7:
              case 8:
                seg(left, top)
                break
              case 10:
                seg(left, bottom)
                seg(top, right)
                break
            }
          }
        }

        // Inner levels sit closer to a peak, so they read as the focus.
        const depth = l / (LEVELS - 1)
        ctx.strokeStyle = rgba(color, (0.16 + depth * 0.5) * intensity)
        ctx.lineWidth = 0.9 + depth * 0.8
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    }

    const tick = (now: number) => {
      if (disposed) return
      if (onScreen && now - last >= 1000 / FPS) {
        last = now
        draw(now / 1000)
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    if (reduce) draw(0)
    else raf = requestAnimationFrame(tick)

    const resizeObserver = new ResizeObserver(() => {
      if (resize() && reduce) draw(0)
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
