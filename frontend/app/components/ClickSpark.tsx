'use client'
import { useRef, useEffect, useCallback, ReactNode } from 'react'

interface Props {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  extraScale?: number
  children: ReactNode
}

export default function ClickSpark({
  sparkColor = '#6366f1',
  sparkSize = 10,
  sparkRadius = 20,
  sparkCount = 8,
  duration = 500,
  easing = 'ease-out',
  extraScale = 1.2,
  children,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<any[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    let t: ReturnType<typeof setTimeout>
    const resize = () => {
      const { width, height } = parent.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
    }
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(resize, 100) })
    ro.observe(parent)
    resize()
    return () => { ro.disconnect(); clearTimeout(t) }
  }, [])

  const ease = useCallback((t: number) => {
    switch (easing) {
      case 'linear':      return t
      case 'ease-in':     return t * t
      case 'ease-in-out': return t < 0.5 ? 2*t*t : -1+(4-2*t)*t
      default:            return t*(2-t)
    }
  }, [easing])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let id: number
    const draw = (ts: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      sparksRef.current = sparksRef.current.filter(s => {
        const elapsed = ts - s.startTime
        if (elapsed >= duration) return false
        const p = elapsed / duration
        const e = ease(p)
        const dist = e * sparkRadius * extraScale
        const len  = sparkSize * (1 - e)
        const x1 = s.x + dist * Math.cos(s.angle)
        const y1 = s.y + dist * Math.sin(s.angle)
        const x2 = s.x + (dist + len) * Math.cos(s.angle)
        const y2 = s.y + (dist + len) * Math.sin(s.angle)
        ctx.strokeStyle = sparkColor
        ctx.lineWidth   = 2
        ctx.globalAlpha = 1 - p
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
        ctx.globalAlpha = 1
        return true
      })
      id = requestAnimationFrame(draw)
    }
    id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [sparkColor, sparkSize, sparkRadius, duration, ease, extraScale])

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const now  = performance.now()
    sparksRef.current.push(
      ...Array.from({ length: sparkCount }, (_, i) => ({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      }))
    )
  }

  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }} onClick={handleClick}>
      <canvas ref={canvasRef} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', display:'block' }} />
      {children}
    </div>
  )
}