import { useRef, useState } from 'react'
import { rgba } from '@/lib/theme'
import { useCanvasPainter } from './useCanvasPainter'

/**
 * Wireless Sensing and Localization track.
 *
 * The signal reaching a receiver is the sum of a direct path and everything
 * that bounced. First-order reflections are found by the image method: mirror
 * the transmitter across each wall and take the straight line from that image.
 *
 * Each path arrives at its own delay and attenuation, and the resulting set of
 * taps is the channel impulse response. Move the receiver and the response
 * changes shape. That shape is the fingerprint the group's classifiers read to
 * identify an environment or place a device inside it.
 */

const ROOM = { x: 0.08, y: 0.1, w: 0.84, h: 0.62 }
const TX: [number, number] = [0.2, 0.28]
const SPEED = 3e8

interface Path {
  points: [number, number][]
  length: number
  amplitude: number
  label: string
}

/** Direct path plus one first-order reflection off each of the four walls. */
function paths(rx: [number, number], scaleMeters: number): Path[] {
  const [tx, ty] = TX
  const [rxx, rxy] = rx
  const out: Path[] = []

  const dist = (a: [number, number], b: [number, number]) =>
    Math.hypot(a[0] - b[0], a[1] - b[1]) * scaleMeters

  const direct = dist([tx, ty], rx)
  out.push({ points: [[tx, ty], rx], length: direct, amplitude: 1, label: 'direct' })

  // Mirror the transmitter across each wall, then find where the straight line
  // from the image to the receiver crosses that wall.
  const walls: { image: [number, number]; axis: 'x' | 'y'; at: number; label: string }[] = [
    { image: [2 * ROOM.x - tx, ty], axis: 'x', at: ROOM.x, label: 'left' },
    { image: [2 * (ROOM.x + ROOM.w) - tx, ty], axis: 'x', at: ROOM.x + ROOM.w, label: 'right' },
    { image: [tx, 2 * ROOM.y - ty], axis: 'y', at: ROOM.y, label: 'top' },
    { image: [tx, 2 * (ROOM.y + ROOM.h) - ty], axis: 'y', at: ROOM.y + ROOM.h, label: 'bottom' },
  ]

  for (const wall of walls) {
    const [ix, iy] = wall.image
    let hit: [number, number]
    if (wall.axis === 'x') {
      const t = (wall.at - ix) / (rxx - ix)
      hit = [wall.at, iy + t * (rxy - iy)]
      if (hit[1] < ROOM.y || hit[1] > ROOM.y + ROOM.h) continue
    } else {
      const t = (wall.at - iy) / (rxy - iy)
      hit = [ix + t * (rxx - ix), wall.at]
      if (hit[0] < ROOM.x || hit[0] > ROOM.x + ROOM.w) continue
    }
    const length = dist([ix, iy], rx)
    out.push({
      points: [[tx, ty], hit, rx],
      length,
      // Free-space spreading times a reflection coefficient.
      amplitude: (direct / length) * 0.62,
      label: wall.label,
    })
  }

  return out.sort((a, b) => a.length - b.length)
}

interface Props {
  ambient?: boolean
  className?: string
}

export default function MultipathDemo({ ambient = false, className = '' }: Props) {
  const [rx, setRx] = useState<[number, number]>([0.74, 0.58])
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const ROOM_METERS = 12
  const rays = paths(rx, ROOM_METERS)
  const maxDelay = Math.max(...rays.map((p) => p.length)) / SPEED

  const canvasRef = useCanvasPainter(
    ({ ctx, w, h, palette }) => {
      const dim = ambient ? 0.55 : 1
      const accent = palette.track.wireless
      const px = (u: number) => u * w
      const py = (v: number) => v * h

      // Room walls.
      ctx.strokeStyle = rgba(palette.neutral, 0.35 * dim)
      ctx.lineWidth = 1.5
      ctx.strokeRect(px(ROOM.x), py(ROOM.y), px(ROOM.w), py(ROOM.h))

      // Paths, faintest for the longest and most attenuated.
      for (const p of rays) {
        ctx.beginPath()
        ctx.moveTo(px(p.points[0][0]), py(p.points[0][1]))
        for (const pt of p.points.slice(1)) ctx.lineTo(px(pt[0]), py(pt[1]))
        ctx.strokeStyle = rgba(accent, (p.label === 'direct' ? 0.95 : 0.42 * p.amplitude + 0.12) * dim)
        ctx.lineWidth = p.label === 'direct' ? 2 : 1.2
        ctx.stroke()

        // Mark the reflection point.
        if (p.points.length === 3) {
          ctx.beginPath()
          ctx.arc(px(p.points[1][0]), py(p.points[1][1]), 2.5, 0, Math.PI * 2)
          ctx.fillStyle = rgba(accent, 0.7 * dim)
          ctx.fill()
        }
      }

      // Transmitter and receiver.
      const node = (u: number, v: number, color: string, r: number) => {
        ctx.beginPath()
        ctx.arc(px(u), py(v), r + 5, 0, Math.PI * 2)
        ctx.fillStyle = rgba(color, 0.16 * dim)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px(u), py(v), r, 0, Math.PI * 2)
        ctx.fillStyle = rgba(color, dim)
        ctx.fill()
      }
      node(TX[0], TX[1], palette.neutral, 4)
      node(rx[0], rx[1], accent, 5)

      if (!ambient) {
        ctx.font = '10px var(--font-mono), monospace'
        ctx.fillStyle = rgba(palette.neutral, 0.9)
        ctx.fillText('TX', px(TX[0]) - 7, py(TX[1]) - 12)
        ctx.fillStyle = rgba(accent, 1)
        ctx.fillText('RX', px(rx[0]) - 7, py(rx[1]) - 13)
      }

      // Channel impulse response: one stem per arriving path.
      const cirTop = py(ROOM.y + ROOM.h) + 34
      const cirH = h - cirTop - 12
      if (cirH > 20) {
        ctx.strokeStyle = rgba(palette.neutral, 0.3 * dim)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(px(ROOM.x), cirTop + cirH)
        ctx.lineTo(px(ROOM.x + ROOM.w), cirTop + cirH)
        ctx.stroke()

        for (const p of rays) {
          const delay = p.length / SPEED
          const t = delay / (maxDelay * 1.15)
          const sx = px(ROOM.x) + t * px(ROOM.w)
          const sy = cirTop + cirH - p.amplitude * cirH * 0.92
          ctx.beginPath()
          ctx.moveTo(sx, cirTop + cirH)
          ctx.lineTo(sx, sy)
          ctx.strokeStyle = rgba(accent, (p.label === 'direct' ? 0.95 : 0.6) * dim)
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(sx, sy, 3, 0, Math.PI * 2)
          ctx.fillStyle = rgba(accent, dim)
          ctx.fill()
        }

        if (!ambient) {
          ctx.font = '9px var(--font-mono), monospace'
          ctx.fillStyle = rgba(palette.neutral, 0.75)
          ctx.fillText('channel impulse response', px(ROOM.x), cirTop - 10)
          ctx.fillText('delay', px(ROOM.x + ROOM.w) - 26, cirTop + cirH + 12)
        }
      }
    },
    [rx, ambient, rays.length],
  )

  const move = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const u = (e.clientX - rect.left) / rect.width
    const v = (e.clientY - rect.top) / rect.height
    // Keep the receiver inside the room, with a small margin off the walls.
    setRx([
      Math.min(ROOM.x + ROOM.w - 0.02, Math.max(ROOM.x + 0.02, u)),
      Math.min(ROOM.y + ROOM.h - 0.02, Math.max(ROOM.y + 0.02, v)),
    ])
  }

  if (ambient) {
    return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />
  }

  const spread = (Math.max(...rays.map((p) => p.length)) - rays[0].length) / SPEED

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        className="aspect-square w-full cursor-crosshair touch-none sm:aspect-4/3"
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          move(e)
        }}
        onPointerMove={move}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          role="img"
          aria-label={`A transmitter and receiver in a room, showing the direct path and ${rays.length - 1} first-order wall reflections, with the resulting channel impulse response below.`}
        />
      </div>

      <div className="mt-5 space-y-4">
        <p className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
          drag anywhere in the room to move the receiver
        </p>

        <dl className="grid grid-cols-3 gap-4 border-t border-ink-800 pt-4">
          <Stat value={String(rays.length)} label="resolvable paths" />
          <Stat value={`${(rays[0].length).toFixed(1)} m`} label="direct path" />
          <Stat value={`${(spread * 1e9).toFixed(0)} ns`} label="delay spread" />
        </dl>

        <p className="text-xs leading-relaxed text-slate-500">
          No two positions produce the same set of taps. That is what makes the
          response usable as a fingerprint, and it is why a classifier can name the
          room from the signal alone, with no dedicated positioning hardware.
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
