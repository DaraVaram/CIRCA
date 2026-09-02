import { useEffect, useRef } from 'react'
import { useTheme, vizPalette, type VizPalette } from '@/lib/theme'

export interface PaintContext {
  ctx: CanvasRenderingContext2D
  /** CSS pixel size, already scaled for device pixel ratio. */
  w: number
  h: number
  palette: VizPalette
}

/**
 * Canvas boilerplate shared by the track demos: device pixel ratio handling,
 * repaint on resize, and repaint when the theme flips.
 *
 * Sizing happens outside the paint call. Writing canvas.width from inside a
 * paint would resize the element and re-fire the observers driving the repaint.
 */
export function useCanvasPainter(
  paint: (c: PaintContext) => void,
  deps: unknown[],
): React.RefObject<HTMLCanvasElement | null> {
  const ref = useRef<HTMLCanvasElement>(null)
  const paintRef = useRef(paint)
  paintRef.current = paint
  const theme = useTheme()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const palette = vizPalette()

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

    const render = () => {
      if (!resize()) return
      ctx.clearRect(0, 0, w, h)
      paintRef.current({ ctx, w, h, palette })
    }

    render()
    const observer = new ResizeObserver(render)
    observer.observe(canvas)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, ...deps])

  return ref
}

/** Rounded-rectangle helper, used by several of the demos. */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
