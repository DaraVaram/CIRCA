import { siteConfig } from '@/site.config'

/**
 * The CIRCA mark.
 *
 * Every variant is built from the same idea the name carries: circa means
 * approximately, and a circle approximated by straight segments is the simplest
 * honest picture of what the group does. Quantization, low-rank factorization
 * and constrained descent are all a curve replaced by something cheaper that is
 * close enough.
 *
 * Switch variants with `logoVariant` in site.config.ts.
 */

export type MarkVariant = 'A' | 'B' | 'C' | 'D' | 'E'

const CX = 16
const CY = 16

/** A circle approximated by n straight chords, left open so it reads as a C. */
function chordC(n: number, r: number, open: number): string {
  const sweep = 360 - open
  const pts: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const a = ((open / 2 + (i / n) * sweep) * Math.PI) / 180
    pts.push([CX + r * Math.cos(a), CY - r * Math.sin(a)])
  }
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')
}

/** The same circle snapped to an integer lattice: a curve, quantized. */
function steppedC(r: number, open: number, step = 2): string {
  const sweep = 360 - open
  const pts: [number, number][] = []
  for (let i = 0; i <= 40; i++) {
    const a = ((open / 2 + (i / 40) * sweep) * Math.PI) / 180
    const x = Math.round((CX + r * Math.cos(a)) / step) * step
    const y = Math.round((CY - r * Math.sin(a)) / step) * step
    const last = pts[pts.length - 1]
    if (!last || last[0] !== x || last[1] !== y) pts.push([x, y])
  }
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [, py] = pts[i - 1]
    const [x, y] = pts[i]
    d += ` L${x} ${py} L${x} ${y}`
  }
  return d
}

// Geometry is fixed, so compute it once rather than on every render.
const PATHS = {
  chords7: chordC(7, 11, 70),
  stepped: steppedC(11, 70),
  // Variant E: three arcs, each coarser than the one outside it.
  eOuter: chordC(14, 13, 62),
  eMiddle: chordC(8, 8.2, 62),
  eInner: chordC(4, 3.6, 62),
  // Two-ring reduction of E. Below about 24px the three rings smear into a
  // blob, so small renders drop the middle ring and open the gap.
  eCompactOuter: chordC(8, 12.4, 62),
  eCompactInner: chordC(4, 5.2, 62),
}

interface Props {
  variant?: MarkVariant
  className?: string
  /** Stroke weight. Thicker reads better at favicon sizes. */
  weight?: number
  /**
   * Use the reduced form of the mark. Variant E carries three rings, which
   * merge below roughly 24px, so small renders drop to two.
   */
  compact?: boolean
}

export default function Mark({
  variant = siteConfig.logoVariant,
  className = 'h-7 w-7',
  weight = 2.2,
  compact = false,
}: Props) {
  const accent = 'var(--color-signal-400)'
  const dim = 'var(--viz-neutral)'

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {variant === 'B' && (
        <circle
          cx={CX}
          cy={CY}
          r={11}
          fill="none"
          stroke={dim}
          strokeWidth={weight * 0.5}
          strokeDasharray="1.5 2"
          opacity={0.75}
        />
      )}

      {variant === 'C' && (
        <>
          <circle
            cx={CX}
            cy={CY}
            r={11}
            fill="none"
            stroke={dim}
            strokeWidth={weight * 0.5}
            opacity={0.55}
          />
          <path
            d="M3 27 C 11 27, 9 17, 16 15 S 27 11, 29 5"
            fill="none"
            stroke={accent}
            strokeWidth={weight}
            strokeLinecap="round"
          />
          <circle cx={29} cy={5} r={weight * 1.25} fill={accent} />
        </>
      )}

      {variant === 'D' && (
        <path
          d={PATHS.stepped}
          fill="none"
          stroke={accent}
          strokeWidth={weight}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      )}

      {variant === 'E' &&
        (compact ? (
          <>
            <path
              d={PATHS.eCompactOuter}
              fill="none"
              stroke={accent}
              strokeWidth={weight}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.9}
            />
            <path
              d={PATHS.eCompactInner}
              fill="none"
              stroke={accent}
              strokeWidth={weight}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <path
              d={PATHS.eOuter}
              fill="none"
              stroke={accent}
              strokeWidth={weight * 0.75}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.62}
            />
            <path
              d={PATHS.eMiddle}
              fill="none"
              stroke={accent}
              strokeWidth={weight * 0.9}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.85}
            />
            <path
              d={PATHS.eInner}
              fill="none"
              stroke={accent}
              strokeWidth={weight}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        ))}

      {(variant === 'A' || variant === 'B') && (
        <path
          d={PATHS.chords7}
          fill="none"
          stroke={accent}
          strokeWidth={weight}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
