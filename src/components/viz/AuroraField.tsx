import { useEffect, useRef } from 'react'
import { useTheme, vizPalette } from '@/lib/theme'

/**
 * The drifting color field behind the hero.
 *
 * Five soft blobs, one per research track, moving on incommensurate Lissajous
 * paths so the field never visibly repeats. Two details do most of the work:
 *
 * 1. Blending follows the ground. On paper the blobs `multiply`, so overlaps
 *    deepen the way wet ink does. On the dark ground they use `lighter`, so
 *    overlaps glow. Additive blending on white would be invisible, and
 *    multiply on near-black would be mud.
 *
 * 2. The field is rendered at a fraction of the display resolution and scaled
 *    up, then a fixed noise tile is composited over it. The upscale supplies
 *    the softness and the noise supplies the particulate grain, which together
 *    read as depth rather than as a CSS gradient.
 *
 * Cost is kept low by rendering small, capping the frame rate, and stopping the
 * loop entirely when the canvas leaves the viewport.
 */

const SCALE = 0.22
const FPS = 30
const NOISE_TILE = 128

/**
 * One blob per track, spread across the whole field so every hue reads. Bunch
 * them and the overlaps average out to a single muddy color. Phase offsets are
 * mutually irrational-ish, so the field never returns to a pose you have seen.
 *
 * `w` weights the per-blob alpha: yellows and greens barely register against a
 * warm ground under multiply, so they get more, and the rose that already
 * dominates gets less.
 */
const BLOBS = [
  { track: 'optimization', cx: 0.30, cy: 0.26, r: 0.46, ax: 0.10, ay: 0.08, sx: 0.031, sy: 0.043, ph: 0, w: 0.85 },
  { track: 'efficient-ml', cx: 0.78, cy: 0.30, r: 0.44, ax: 0.09, ay: 0.07, sx: 0.023, sy: 0.037, ph: 3.1, w: 1.35 },
  { track: 'wireless', cx: 0.60, cy: 0.70, r: 0.42, ax: 0.11, ay: 0.09, sx: 0.027, sy: 0.019, ph: 1.7, w: 1.0 },
  { track: 'generative', cx: 0.40, cy: 0.74, r: 0.38, ax: 0.08, ay: 0.08, sx: 0.041, sy: 0.029, ph: 4.6, w: 0.9 },
  { track: 'applied', cx: 0.90, cy: 0.62, r: 0.40, ax: 0.10, ay: 0.10, sx: 0.017, sy: 0.033, ph: 5.9, w: 1.3 },
] as const

/** Deterministic noise tile, built once and reused for every instance. */
let noiseTile: HTMLCanvasElement | null = null
function getNoiseTile(): HTMLCanvasElement {
  if (noiseTile) return noiseTile
  const c = document.createElement('canvas')
  c.width = NOISE_TILE
  c.height = NOISE_TILE
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(NOISE_TILE, NOISE_TILE)
  // Small LCG rather than Math.random, so the grain is identical every load
  // and cannot shimmer between renders.
  let seed = 0x9e3779b9
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const v = 128 + ((seed >>> 24) - 128) * 0.55
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  noiseTile = c
  return c
}

interface Props {
  className?: string
  /** Scales every blob's opacity. Lower it behind dense text. */
  intensity?: number
}

export default function AuroraField({ className = '', intensity = 1 }: Props) {
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

    // Paper takes ink that deepens where it overlaps. The dark ground takes
    // light that adds where it overlaps.
    const blend: GlobalCompositeOperation = light ? 'multiply' : 'lighter'
    const alpha = (light ? 0.34 : 0.15) * intensity

    let w = 0
    let h = 0
    let raf = 0
    let last = 0
    let disposed = false
    let onScreen = true

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      w = Math.max(2, Math.round(rect.width * SCALE))
      h = Math.max(2, Math.round(rect.height * SCALE))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      return true
    }

    const draw = (t: number) => {
      if (w === 0 || h === 0) return
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      // Paper starts white so multiply has something to darken. The dark
      // ground starts transparent so the page color shows through.
      if (light) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
      } else {
        ctx.clearRect(0, 0, w, h)
      }

      ctx.globalCompositeOperation = blend
      const span = Math.max(w, h)

      for (const b of BLOBS) {
        const x = (b.cx + Math.sin(t * b.sx + b.ph) * b.ax) * w
        const y = (b.cy + Math.cos(t * b.sy + b.ph * 1.3) * b.ay) * h
        // Breathe the radius slightly, so blobs do not read as rigid discs.
        const r = b.r * span * (1 + Math.sin(t * b.sx * 0.7 + b.ph) * 0.12)
        const color = palette.track[b.track as keyof typeof palette.track]

        const a = alpha * b.w
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, withAlpha(color, a))
        g.addColorStop(0.45, withAlpha(color, a * 0.5))
        g.addColorStop(1, withAlpha(color, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Grain. `overlay` keeps mid-gray neutral, so the tile adds texture
      // without shifting the hue or lifting the black point.
      ctx.globalCompositeOperation = 'overlay'
      ctx.globalAlpha = light ? 0.42 : 0.22
      const tile = getNoiseTile()
      for (let ty = 0; ty < h; ty += NOISE_TILE) {
        for (let tx = 0; tx < w; tx += NOISE_TILE) {
          ctx.drawImage(tile, tx, ty)
        }
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const tick = (now: number) => {
      if (disposed) return
      if (onScreen && now - last >= 1000 / FPS) {
        last = now
        draw(now / 1000)
      }
      raf = requestAnimationFrame(tick)
    }

    if (!resize()) {
      // Laid out at zero, for example inside a collapsed parent. The observer
      // below picks it up as soon as it has a size.
    }

    if (reduce) {
      draw(0)
    } else {
      raf = requestAnimationFrame(tick)
    }

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

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      aria-hidden="true"
      // The canvas is a fraction of its display size, so let the browser
      // smooth the upscale. That blur is the effect, not an artifact.
      style={{ imageRendering: 'auto' }}
    />
  )
}

/** Applies an alpha to a hex or rgb() color from the theme. */
function withAlpha(color: string, a: number): string {
  const c = color.trim()
  if (c.startsWith('#')) {
    const full = c.length === 4 ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}` : c
    const n = parseInt(full.slice(1), 16)
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
  }
  const nums = c.match(/[\d.]+/g)
  if (nums && nums.length >= 3) {
    return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${a})`
  }
  return c
}
