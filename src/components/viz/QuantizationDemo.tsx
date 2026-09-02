import { useMemo, useState } from 'react'
import { rgba } from '@/lib/theme'
import { useCanvasPainter } from './useCanvasPainter'

/**
 * Efficient and Edge ML track.
 *
 * A layer's activations are a continuous signal. Quantization replaces them
 * with one of 2^b levels, which shrinks the model by 32/b and introduces an
 * error you can see and measure. The point of the demo is the shape of the
 * tradeoff: the staircase tracks the curve closely down to about four bits and
 * then falls apart, which is why mixed-precision assignment is worth solving
 * rather than guessing.
 */

const SAMPLES = 220

/** A deterministic signal standing in for one layer's activations. */
function signal(t: number): number {
  return (
    0.55 * Math.sin(t * Math.PI * 2) +
    0.28 * Math.sin(t * Math.PI * 6 + 1.1) +
    0.17 * Math.sin(t * Math.PI * 13 + 0.4)
  )
}

const SERIES = Array.from({ length: SAMPLES }, (_, i) => signal(i / (SAMPLES - 1)))
const PEAK = Math.max(...SERIES.map(Math.abs))

/** Uniform symmetric quantization, the scheme used for weights in practice. */
function quantize(values: number[], bits: number) {
  const levels = 2 ** bits
  const step = (2 * PEAK) / (levels - 1)
  return values.map((v) => Math.round((v + PEAK) / step) * step - PEAK)
}

interface Props {
  ambient?: boolean
  className?: string
}

export default function QuantizationDemo({ ambient = false, className = '' }: Props) {
  const [bits, setBits] = useState(4)

  const { quantized, rmse } = useMemo(() => {
    const q = quantize(SERIES, bits)
    const mse = SERIES.reduce((acc, v, i) => acc + (v - q[i]) ** 2, 0) / SERIES.length
    return { quantized: q, rmse: Math.sqrt(mse) }
  }, [bits])

  const canvasRef = useCanvasPainter(
    ({ ctx, w, h, palette }) => {
      const pad = { top: 14, right: 14, bottom: 14, left: 14 }
      const plotW = w - pad.left - pad.right
      const plotH = h - pad.top - pad.bottom
      const dim = ambient ? 0.55 : 1

      const x = (i: number) => pad.left + (i / (SAMPLES - 1)) * plotW
      const y = (v: number) => pad.top + plotH / 2 - (v / (PEAK * 1.1)) * (plotH / 2)

      // Quantization levels. Above ~6 bits these are too dense to be useful.
      const levels = 2 ** bits
      if (levels <= 64) {
        ctx.strokeStyle = rgba(palette.neutral, 0.16 * dim)
        ctx.lineWidth = 1
        for (let l = 0; l < levels; l++) {
          const v = -PEAK + (l * (2 * PEAK)) / (levels - 1)
          ctx.beginPath()
          ctx.moveTo(pad.left, y(v))
          ctx.lineTo(pad.left + plotW, y(v))
          ctx.stroke()
        }
      }

      // Error band between the true signal and its quantized reconstruction.
      ctx.beginPath()
      ctx.moveTo(x(0), y(SERIES[0]))
      for (let i = 1; i < SAMPLES; i++) ctx.lineTo(x(i), y(SERIES[i]))
      for (let i = SAMPLES - 1; i >= 0; i--) ctx.lineTo(x(i), y(quantized[i]))
      ctx.closePath()
      ctx.fillStyle = rgba(palette.track['efficient-ml'], 0.16 * dim)
      ctx.fill()

      // The original, continuous signal.
      ctx.beginPath()
      ctx.moveTo(x(0), y(SERIES[0]))
      for (let i = 1; i < SAMPLES; i++) ctx.lineTo(x(i), y(SERIES[i]))
      ctx.strokeStyle = rgba(palette.neutral, 0.75 * dim)
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // The quantized reconstruction, drawn as the staircase it actually is.
      ctx.beginPath()
      ctx.moveTo(x(0), y(quantized[0]))
      for (let i = 1; i < SAMPLES; i++) {
        ctx.lineTo(x(i), y(quantized[i - 1]))
        ctx.lineTo(x(i), y(quantized[i]))
      }
      ctx.strokeStyle = rgba(palette.track['efficient-ml'], 0.95 * dim)
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.stroke()
    },
    [bits, quantized, ambient],
  )

  if (ambient) {
    return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />
  }

  const compression = 32 / bits

  return (
    <div className={className}>
      <div className="aspect-square w-full sm:aspect-4/3">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          role="img"
          aria-label={`A continuous activation signal and its ${bits}-bit quantized reconstruction, with the error between them shaded.`}
        />
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <Legend color="var(--viz-neutral)" label="Full precision" dashed />
          <Legend color="var(--color-track-efficient-ml)" label={`${bits}-bit reconstruction`} />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="bits" className="font-mono text-xs tracking-wider text-slate-400">
              {bits} bits
            </label>
            <span className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
              weight precision
            </span>
          </div>
          <input
            id="bits"
            type="range"
            min={1}
            max={8}
            step={1}
            value={bits}
            onChange={(e) => setBits(Number(e.target.value))}
            className="mt-2 w-full accent-track-efficient-ml"
          />
        </div>

        <dl className="grid grid-cols-3 gap-4 border-t border-ink-800 pt-4">
          <Stat value={String(2 ** bits)} label="levels" />
          <Stat value={`${compression.toFixed(0)}x`} label="smaller than fp32" />
          <Stat value={rmse.toFixed(3)} label="reconstruction RMSE" />
        </dl>

        <p className="text-xs leading-relaxed text-slate-500">
          {bits <= 2
            ? 'At one or two bits the reconstruction keeps only the sign and gross magnitude. Most layers cannot survive this, but a few can, and finding which is the point.'
            : bits <= 4
              ? 'Four bits is where the interesting work happens. The staircase still tracks the signal, at an eighth of the memory.'
              : 'Above six bits the error is negligible and so is the saving. Precision this high is worth spending only on the layers that need it.'}
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
