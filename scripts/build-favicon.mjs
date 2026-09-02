/**
 * Generates public/favicon.svg from the same chord geometry as Mark.tsx, so the
 * tab icon can never drift from the mark in the nav.
 *
 * Variant E carries three rings at display size. At 16px they merge into a
 * blob, so the favicon uses the two-ring reduction, which is what `compact`
 * renders in the component.
 *
 *   node scripts/build-favicon.mjs
 */
import { writeFileSync } from 'node:fs'

const CX = 16
const CY = 16
const VARIANT = 'E'

function chordC(n, r, open) {
  const sweep = 360 - open
  const pts = []
  for (let i = 0; i <= n; i++) {
    const a = ((open / 2 + (i / n) * sweep) * Math.PI) / 180
    pts.push([CX + r * Math.cos(a), CY - r * Math.sin(a)])
  }
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')
}

function steppedC(r, open, step = 2) {
  const sweep = 360 - open
  const pts = []
  for (let i = 0; i <= 40; i++) {
    const a = ((open / 2 + (i / 40) * sweep) * Math.PI) / 180
    const x = Math.round((CX + r * Math.cos(a)) / step) * step
    const y = Math.round((CY - r * Math.sin(a)) / step) * step
    const last = pts.at(-1)
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

const stroke = (d, w, opacity = 1, cap = 'round', join = 'round') =>
  `  <path d="${d}" fill="none" stroke="#ce6478" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="${join}"${
    opacity === 1 ? '' : ` opacity="${opacity}"`
  }/>`

const BODIES = {
  A: () => [stroke(chordC(7, 11, 70), 2.6)],
  B: () => [
    `  <circle cx="16" cy="16" r="11" fill="none" stroke="#8b7674" stroke-width="1.3" stroke-dasharray="1.5 2" opacity="0.75"/>`,
    stroke(chordC(7, 11, 70), 2.6),
  ],
  C: () => [
    `  <circle cx="16" cy="16" r="11" fill="none" stroke="#8b7674" stroke-width="1.3" opacity="0.55"/>`,
    stroke('M3 27 C 11 27, 9 17, 16 15 S 27 11, 29 5', 2.6),
    `  <circle cx="29" cy="5" r="3.2" fill="#ce6478"/>`,
  ],
  D: () => [stroke(steppedC(11, 70), 2.6, 1, 'square', 'miter')],
  // Two-ring reduction. Three rings are unreadable at 16px.
  E: () => [stroke(chordC(8, 12.4, 62), 2.9, 0.9), stroke(chordC(4, 5.2, 62), 2.9)],
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0a0708"/>
${BODIES[VARIANT]().join('\n')}
</svg>
`

writeFileSync(new URL('../public/favicon.svg', import.meta.url), svg)
console.log(`favicon.svg written for variant ${VARIANT}\n`)
console.log(svg)
