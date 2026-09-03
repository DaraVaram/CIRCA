import { useEffect, useRef } from 'react'
import { rgba, useTheme, vizPalette } from '@/lib/theme'

/**
 * The hero backdrop: contour lines with descent trajectories running across
 * them.
 *
 * Both halves come from one scalar field, which is the point. The contours are
 * its level sets and the streaks follow its gradient, so the streaks cross the
 * contours at right angles because that is what a gradient does. It is the same
 * picture the optimization demo draws with two paths, at wall scale.
 *
 * Three things keep it cheap:
 *
 * 1. Segments are batched. A stroke() per particle meant thousands of draw
 *    calls a frame, which is what made the first version slow. Segments are
 *    now collected into one Path2D per color and alpha bucket, so a frame costs
 *    a fixed handful of stroke calls no matter how many particles there are.
 * 2. The field is sampled onto a grid, and the gradient is read back from that
 *    grid by bilinear interpolation. Evaluating the wells per particle meant
 *    repeating the same work thousands of times over.
 * 3. The two layers run at different rates. Contours drift slowly enough to
 *    redraw a few times a second, and the field they share is recomputed on the
 *    same slow cadence.
 *
 * While the pointer is over the field, most new trajectories are released at
 * the cursor, so moving the mouse feeds the flow and the streaks visibly run
 * downhill away from it.
 */

const COLS = 56
const ROWS = 38
const LEVELS = 7

/** Trails need a wash rather than a clear, so this layer is its own canvas. */
const FLOW_SCALE = 0.62
const FLOW_FPS = 20
const CONTOUR_FPS = 5

const BASE_COUNT = 620
/** Area the base count was tuned against, in CSS pixels. */
const BASE_AREA = 620 * 420
const MAX_DENSITY = 1.8

const SPEED = 0.0028
const LIFE = 130
const ALPHA_STEPS = 4

/** Share of respawns that appear at the pointer rather than anywhere. */
const POINTER_SHARE = 0.72
/** Spawn disc around the pointer, as a fraction of the field's short side. */
const POINTER_RADIUS = 0.07

/** Wells whose sum is the surface being contoured and descended. */
const WELLS = [
  { x: 0.26, y: 0.32, a: 1.0, ax: 0.09, ay: 0.07, sx: 0.041, sy: 0.053, ph: 0, s: 0.3 },
  { x: 0.74, y: 0.26, a: 0.85, ax: 0.08, ay: 0.09, sx: 0.033, sy: 0.047, ph: 1.9, s: 0.27 },
  { x: 0.56, y: 0.74, a: -0.7, ax: 0.1, ay: 0.08, sx: 0.027, sy: 0.037, ph: 3.4, s: 0.32 },
  { x: 0.9, y: 0.62, a: 0.6, ax: 0.07, ay: 0.1, sx: 0.049, sy: 0.031, ph: 5.1, s: 0.24 },
  { x: 0.12, y: 0.78, a: 0.5, ax: 0.1, ay: 0.06, sx: 0.023, sy: 0.061, ph: 2.2, s: 0.26 },
]

interface Props {
  className?: string
  intensity?: number
}

export default function FieldBackdrop({ className = '', intensity = 1 }: Props) {
  const contourRef = useRef<HTMLCanvasElement>(null)
  const flowRef = useRef<HTMLCanvasElement>(null)
  const theme = useTheme()

  useEffect(() => {
    const contourCanvas = contourRef.current
    const flowCanvas = flowRef.current
    if (!contourCanvas || !flowCanvas) return
    const cctx = contourCanvas.getContext('2d')
    const fctx = flowCanvas.getContext('2d')
    if (!cctx || !fctx) return

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

    // Every color string the frame can need, built once. Formatting them per
    // particle per frame was thousands of throwaway strings a second.
    const flowColors: string[][] = hues.map((hue) =>
      Array.from({ length: ALPHA_STEPS }, (_, a) =>
        rgba(hue, (light ? 0.62 : 0.5) * ((a + 1) / ALPHA_STEPS) * intensity),
      ),
    )
    const contourColors = Array.from({ length: LEVELS }, (_, l) => {
      const depth = l / (LEVELS - 1)
      return rgba(hues[l % hues.length], (0.14 + depth * 0.4) * intensity)
    })
    // Trails fade by removing alpha, not by painting the page color over them.
    // Washing with an opaque paper tint converges to a solid sheet, which hid
    // the contour layer sitting underneath.
    const FADE = 0.09

    // Field values plus its gradient, all sampled on the same grid.
    const stride = COLS + 1
    const field = new Float32Array(stride * (ROWS + 1))
    const gradX = new Float32Array(stride * (ROWS + 1))
    const gradY = new Float32Array(stride * (ROWS + 1))

    let w = 0
    let h = 0
    let count = 0
    let px = new Float32Array(0)
    let py = new Float32Array(0)
    let age = new Float32Array(0)
    let hue = new Uint8Array(0)

    let seed = 0x2545f491
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }

    // Where new trajectories are released. While the pointer is over the field
    // most of them start there, so the cursor reads as feeding the flow, and
    // the rest keep the wider field from emptying out.
    const pointer = { x: 0.5, y: 0.5, active: false }
    let rect = { left: 0, top: 0, width: 1, height: 1 }

    const spawn = (i: number) => {
      if (pointer.active && rnd() < POINTER_SHARE) {
        // sqrt on the radius gives a disc with even density rather than a
        // clump at the middle. Correct for aspect so it stays round on screen.
        const a = rnd() * Math.PI * 2
        const r = Math.sqrt(rnd()) * POINTER_RADIUS
        const aspect = w > 0 && h > 0 ? h / w : 1
        px[i] = pointer.x + Math.cos(a) * r * aspect
        py[i] = pointer.y + Math.sin(a) * r
      } else {
        px[i] = rnd()
        py[i] = rnd()
      }
      // A respawn starts its life at zero so it fades in. Starting mid-life
      // would pop a fully opaque streak into existence.
      age[i] = 0
      hue[i] = Math.floor(rnd() * hues.length)
    }

    /** Initial population only, spread across the fade so they do not pulse together. */
    const seedInitial = (i: number) => {
      px[i] = rnd()
      py[i] = rnd()
      age[i] = rnd() * LIFE
      hue[i] = Math.floor(rnd() * hues.length)
    }

    const allocate = () => {
      // Density is what makes the field read, so it tracks area rather than
      // being a fixed count. The cap keeps a very wide hero from paying for
      // particles nobody can distinguish anyway.
      const target = Math.round(
        BASE_COUNT * Math.min(MAX_DENSITY, Math.max(0.5, (w * h) / BASE_AREA)),
      )
      if (target === count) return
      count = target
      px = new Float32Array(count)
      py = new Float32Array(count)
      age = new Float32Array(count)
      hue = new Uint8Array(count)
      for (let i = 0; i < count; i++) seedInitial(i)
    }

    const resize = () => {
      const rect0 = contourCanvas.getBoundingClientRect()
      if (rect0.width === 0 || rect0.height === 0) return false
      w = rect0.width
      h = rect0.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      // Contours are thin lines, so they get full device resolution.
      const cw = Math.round(w * dpr)
      const ch = Math.round(h * dpr)
      if (contourCanvas.width !== cw || contourCanvas.height !== ch) {
        contourCanvas.width = cw
        contourCanvas.height = ch
      }
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Streaks are soft, so this layer renders small and is scaled up by CSS.
      const fw = Math.max(2, Math.round(w * FLOW_SCALE))
      const fh = Math.max(2, Math.round(h * FLOW_SCALE))
      if (flowCanvas.width !== fw || flowCanvas.height !== fh) {
        flowCanvas.width = fw
        flowCanvas.height = fh
        fctx.clearRect(0, 0, fw, fh)
      }
      // Cached so pointermove does not force a layout read on every event.
      // Kept current by the scroll listener below.
      rect = { left: rect0.left, top: rect0.top, width: w, height: h }
      return true
    }

    /** Samples the wells onto the grid and takes central differences. */
    const sampleField = (t: number) => {
      const centers = WELLS.map((c) => ({
        x: c.x + Math.sin(t * c.sx + c.ph) * c.ax,
        y: c.y + Math.cos(t * c.sy + c.ph * 1.3) * c.ay,
        a: c.a,
        inv: 1 / (c.s * c.s),
      }))

      for (let j = 0; j <= ROWS; j++) {
        const v = j / ROWS
        for (let i = 0; i <= COLS; i++) {
          const u = i / COLS
          let sum = 0
          for (const c of centers) {
            const dx = u - c.x
            const dy = v - c.y
            sum += c.a * Math.exp(-(dx * dx + dy * dy) * c.inv)
          }
          field[j * stride + i] = sum
        }
      }

      // Reading the gradient off the same grid the contours come from is what
      // guarantees the streaks cross the lines square.
      for (let j = 0; j <= ROWS; j++) {
        for (let i = 0; i <= COLS; i++) {
          const k = j * stride + i
          const xa = field[j * stride + Math.max(0, i - 1)]
          const xb = field[j * stride + Math.min(COLS, i + 1)]
          const ya = field[Math.max(0, j - 1) * stride + i]
          const yb = field[Math.min(ROWS, j + 1) * stride + i]
          gradX[k] = xb - xa
          gradY[k] = yb - ya
        }
      }
    }

    const drawContours = () => {
      if (w === 0 || h === 0) return
      cctx.clearRect(0, 0, w, h)
      const cw = w / COLS
      const chh = h / ROWS

      for (let l = 0; l < LEVELS; l++) {
        const level = -0.5 + (l / (LEVELS - 1)) * 1.45
        const path = new Path2D()

        for (let j = 0; j < ROWS; j++) {
          for (let i = 0; i < COLS; i++) {
            const k = j * stride + i
            const tl = field[k]
            const tr = field[k + 1]
            const bl = field[k + stride]
            const br = field[k + stride + 1]

            let code = 0
            if (tl > level) code |= 8
            if (tr > level) code |= 4
            if (br > level) code |= 2
            if (bl > level) code |= 1
            if (code === 0 || code === 15) continue

            const x0 = i * cw
            const y0 = j * chh
            const tx = x0 + ((level - tl) / (tr - tl)) * cw
            const rx = x0 + cw
            const ry = y0 + ((level - tr) / (br - tr)) * chh
            const bx = x0 + ((level - bl) / (br - bl)) * cw
            const by = y0 + chh
            const ly = y0 + ((level - tl) / (bl - tl)) * chh

            const seg = (ax: number, ay: number, bx2: number, by2: number) => {
              path.moveTo(ax, ay)
              path.lineTo(bx2, by2)
            }
            switch (code) {
              case 1:
              case 14:
                seg(x0, ly, bx, by)
                break
              case 2:
              case 13:
                seg(bx, by, rx, ry)
                break
              case 3:
              case 12:
                seg(x0, ly, rx, ry)
                break
              case 4:
              case 11:
                seg(tx, y0, rx, ry)
                break
              case 5:
                seg(x0, ly, tx, y0)
                seg(bx, by, rx, ry)
                break
              case 6:
              case 9:
                seg(tx, y0, bx, by)
                break
              case 7:
              case 8:
                seg(x0, ly, tx, y0)
                break
              case 10:
                seg(x0, ly, bx, by)
                seg(tx, y0, rx, ry)
                break
            }
          }
        }

        cctx.strokeStyle = contourColors[l]
        cctx.lineWidth = 0.8 + (l / (LEVELS - 1)) * 0.5
        cctx.lineCap = 'round'
        cctx.stroke(path)
      }
    }

    const stepFlow = () => {
      const fw = flowCanvas.width
      const fh = flowCanvas.height
      if (fw === 0 || fh === 0 || count === 0) return

      fctx.globalCompositeOperation = 'destination-out'
      fctx.fillStyle = `rgba(0, 0, 0, ${FADE})`
      fctx.fillRect(0, 0, fw, fh)

      // One path per color and alpha bucket, filled in during the walk and
      // stroked once at the end. This is the whole optimization.
      const buckets: Path2D[] = []
      for (let k = 0; k < hues.length * ALPHA_STEPS; k++) buckets.push(new Path2D())

      for (let i = 0; i < count; i++) {
        const u = px[i]
        const v = py[i]

        // Bilinear gradient lookup off the shared grid.
        const gx = u * COLS
        const gy = v * ROWS
        let i0 = Math.floor(gx)
        let j0 = Math.floor(gy)
        if (i0 < 0) i0 = 0
        else if (i0 > COLS - 1) i0 = COLS - 1
        if (j0 < 0) j0 = 0
        else if (j0 > ROWS - 1) j0 = ROWS - 1
        const fx = gx - i0
        const fy = gy - j0
        const k00 = j0 * stride + i0
        const k10 = k00 + 1
        const k01 = k00 + stride
        const k11 = k01 + 1
        const w00 = (1 - fx) * (1 - fy)
        const w10 = fx * (1 - fy)
        const w01 = (1 - fx) * fy
        const w11 = fx * fy
        const dx = gradX[k00] * w00 + gradX[k10] * w10 + gradX[k01] * w01 + gradX[k11] * w11
        const dy = gradY[k00] * w00 + gradY[k10] * w10 + gradY[k01] * w01 + gradY[k11] * w11

        // Downhill, rotated slightly so trajectories curve around a well
        // instead of diving in and piling up at the bottom.
        let vx = -dx * 0.86 + dy * 0.5
        let vy = -dy * 0.86 - dx * 0.5
        const m = Math.sqrt(vx * vx + vy * vy) || 1
        vx /= m
        vy /= m

        const nx = u + vx * SPEED
        const ny = v + vy * SPEED

        const life = age[i] / LIFE
        // Triangular fade rather than a sine, which costs a call per particle.
        const fade = life < 0.5 ? life * 2 : (1 - life) * 2
        let bucket = (fade * ALPHA_STEPS) | 0
        if (bucket > ALPHA_STEPS - 1) bucket = ALPHA_STEPS - 1

        const path = buckets[hue[i] * ALPHA_STEPS + bucket]
        path.moveTo(u * fw, v * fh)
        path.lineTo(nx * fw, ny * fh)

        px[i] = nx
        py[i] = ny
        age[i] += 1
        if (age[i] > LIFE || nx < -0.05 || nx > 1.05 || ny < -0.05 || ny > 1.05) spawn(i)
      }

      fctx.globalCompositeOperation = light ? 'multiply' : 'lighter'
      fctx.lineWidth = 1.1
      fctx.lineCap = 'round'
      for (let hi = 0; hi < hues.length; hi++) {
        for (let a = 0; a < ALPHA_STEPS; a++) {
          fctx.strokeStyle = flowColors[hi][a]
          fctx.stroke(buckets[hi * ALPHA_STEPS + a])
        }
      }
      fctx.globalCompositeOperation = 'source-over'
    }

    let raf = 0
    let disposed = false
    let onScreen = true
    let lastFlow = 0
    let lastContour = 0

    const paused = () => !onScreen || document.hidden

    const tick = (now: number) => {
      if (disposed) return
      if (!paused()) {
        if (now - lastContour >= 1000 / CONTOUR_FPS) {
          lastContour = now
          sampleField(now / 1000)
          drawContours()
        }
        if (now - lastFlow >= 1000 / FLOW_FPS) {
          lastFlow = now
          stepFlow()
        }
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    allocate()
    sampleField(0)
    drawContours()

    if (reduce) {
      // Lay down a still field rather than animating into one.
      for (let k = 0; k < 70; k++) stepFlow()
    } else {
      raf = requestAnimationFrame(tick)
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!resize()) return
      allocate()
      drawContours()
    })
    resizeObserver.observe(contourCanvas)

    const intersectionObserver = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
    })
    intersectionObserver.observe(contourCanvas)

    // Listening on the window rather than the canvas, because the whole
    // backdrop sits under pointer-events-none so the copy stays selectable.
    const onPointerMove = (e: PointerEvent) => {
      const u = (e.clientX - rect.left) / rect.width
      const v = (e.clientY - rect.top) / rect.height
      // A margin past the edge keeps the effect from flickering off when the
      // pointer grazes the boundary.
      pointer.active = u > -0.2 && u < 1.2 && v > -0.2 && v < 1.2
      if (pointer.active) {
        pointer.x = u
        pointer.y = v
      }
    }
    const onPointerLeave = () => {
      pointer.active = false
    }
    const onScroll = () => {
      const r = contourCanvas.getBoundingClientRect()
      rect = { left: r.left, top: r.top, width: r.width || 1, height: r.height || 1 }
    }

    if (!reduce) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave)
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [theme, intensity])

  return (
    <div className={`relative h-full w-full ${className}`}>
      <canvas ref={contourRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <canvas ref={flowRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  )
}
