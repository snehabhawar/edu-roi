'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const PrismaticBurst = dynamic(() => import('./components/PrismaticBurst'), { ssr: false })

const COUNTRIES = [
  { emoji:'🇺🇸', name:'United States', sub:'Top CS salaries · $110K avg',    grad:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
  { emoji:'🇬🇧', name:'United Kingdom', sub:'Graduate visa · No lottery',     grad:'linear-gradient(135deg,#141E30,#243B55)' },
  { emoji:'🇩🇪', name:'Germany',        sub:'Near-zero tuition · Easy PR',    grad:'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' },
  { emoji:'🇦🇺', name:'Australia',      sub:'Easiest PR · 82/100 ease score', grad:'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' },
  { emoji:'🇮🇳', name:'India',          sub:'Fastest growing tech market',    grad:'linear-gradient(135deg,#200122,#6f0000)' },
  { emoji:'🇨🇦', name:'Canada',         sub:'Express entry · Points system',  grad:'linear-gradient(135deg,#1a1a2e,#8B0000,#1a1a2e)' },
  { emoji:'🇸🇬', name:'Singapore',      sub:'Tech hub · High salaries',       grad:'linear-gradient(135deg,#0f2027,#009688,#0f2027)' },
  { emoji:'🇳🇱', name:'Netherlands',    sub:'English-taught programmes',      grad:'linear-gradient(135deg,#1a1a2e,#e67e22,#1a1a2e)' },
]

const FULL_TEXT = 'Is your degree'

export default function Landing() {
  const router    = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [typed, setTyped]     = useState('')
  const [showSub, setShowSub] = useState(false)
  const [navIn, setNavIn]     = useState(false)
  const idx = useRef(0)

  useEffect(() => { setTimeout(() => setNavIn(true), 150) }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        idx.current++
        setTyped(FULL_TEXT.slice(0, idx.current))
        if (idx.current >= FULL_TEXT.length) {
          clearInterval(iv)
          setTimeout(() => setShowSub(true), 300)
        }
      }, 60)
      return () => clearInterval(iv)
    }, 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let globe: any
    let phi = 0.5
    import('cobe').then(({ default: createGlobe }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      globe = createGlobe(canvas, {
        devicePixelRatio: 2, width: 560*2, height: 560*2,
        phi: 0.5, theta: 0.25, dark: 1, diffuse: 1.4,
        mapSamples: 20000, mapBrightness: 8,
        baseColor: [0.1,0.1,0.25], markerColor: [0.5,0.4,1.0], glowColor: [0.2,0.15,0.55],
        markers: [
          {location:[37.77,-122.43],size:0.07},{location:[51.51,-0.13],size:0.07},
          {location:[52.52,13.41],size:0.06},{location:[-33.87,151.21],size:0.07},
          {location:[28.61,77.21],size:0.07},{location:[1.35,103.82],size:0.05},
          {location:[35.68,139.65],size:0.05},{location:[43.65,-79.38],size:0.05},
        ],
        onRender(s: any) { s.phi = phi; phi += 0.004 },
      })
    })
    return () => globe?.destroy()
  }, [])

  const allCards = [...COUNTRIES, ...COUNTRIES]

  const F = {
    head: "'Bricolage Grotesque','Plus Jakarta Sans',sans-serif",
    body: "'Plus Jakarta Sans',sans-serif",
  }

  return (
    <div style={{ minHeight:'100vh', background:'#06060f', overflow:'hidden', position:'relative', fontFamily: F.body }}>

      {/* PrismaticBurst */}
      <div style={{ position:'fixed', inset:0, zIndex:0, opacity:0.22 }}>
        <PrismaticBurst animationType="rotate3d" intensity={2.5} speed={0.4}
          distort={0} rayCount={0} mixBlendMode="lighten"
          colors={['#ff007a','#4d3dff','#00f5ff','#7c3aed','#ffffff']} />
      </div>

      {/* Dark overlay */}
      <div style={{ position:'fixed', inset:0, zIndex:1, background:'rgba(6,6,15,0.65)', pointerEvents:'none' }} />

      {/* Grid */}
      <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)',
        backgroundSize:'64px 64px' }} />

      {/* Navbar */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        height:64, padding:'0 40px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(6,6,15,0.75)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        transform: navIn ? 'translateY(0)' : 'translateY(-100%)',
        transition:'transform 0.4s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span style={{ color:'#fff', fontWeight:800, fontSize:18, fontFamily:F.head, letterSpacing:'-0.5px' }}>EduROI</span>
        </div>
        <button onClick={() => router.push('/calculator')}
          style={{ padding:'9px 24px', fontSize:13, fontWeight:600, color:'#fff', fontFamily:F.body,
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
            borderRadius:40, cursor:'pointer', letterSpacing:'-0.1px', transition:'all 0.2s' }}
          onMouseEnter={e => { const el=e.currentTarget; el.style.background='rgba(255,255,255,0.11)'; el.style.borderColor='rgba(255,255,255,0.22)' }}
          onMouseLeave={e => { const el=e.currentTarget; el.style.background='rgba(255,255,255,0.06)'; el.style.borderColor='rgba(255,255,255,0.12)' }}>
          Sign in
        </button>
      </nav>

      {/* ── Ticker — BIG CARDS ── */}
      <div style={{ position:'relative', zIndex:10, marginTop:64, overflow:'hidden', padding:'20px 0' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:160, background:'linear-gradient(to right,#06060f,transparent)', zIndex:5, pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:160, background:'linear-gradient(to left,#06060f,transparent)', zIndex:5, pointerEvents:'none' }} />

        <div style={{ display:'flex', gap:16, animation:'ticker 40s linear infinite', width:'max-content', cursor:'default' }}>
          {allCards.map((c, i) => (
            <div key={i} onClick={() => router.push('/calculator')}
              style={{
                flexShrink:0, width:240, height:150, borderRadius:20, overflow:'hidden',
                background:c.grad, border:'1px solid rgba(255,255,255,0.1)',
                position:'relative', cursor:'pointer',
                transition:'transform 0.2s, border-color 0.2s',
                boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => { const el=e.currentTarget; el.style.transform='translateY(-4px) scale(1.02)'; el.style.borderColor='rgba(99,102,241,0.6)' }}
              onMouseLeave={e => { const el=e.currentTarget; el.style.transform=''; el.style.borderColor='rgba(255,255,255,0.1)' }}>
              {/* Noise overlay */}
              <div style={{ position:'absolute', inset:0, background:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")', opacity:0.4 }} />
              {/* Bottom gradient */}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
              {/* Flag */}
              <div style={{ position:'absolute', top:16, left:16, fontSize:38, fontFamily:'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif', lineHeight:1, filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
                {c.emoji}
              </div>
              {/* Text */}
              <div style={{ position:'absolute', bottom:14, left:16, right:16 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'#fff', fontFamily:F.head, letterSpacing:'-0.3px', marginBottom:2 }}>{c.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', fontFamily:F.body, lineHeight:1.4 }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', padding:'52px 24px 0', textAlign:'center' }}>

        {/* Badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:20, padding:'5px 16px', marginBottom:28 }}>
          <span style={{ width:5, height:5, borderRadius:'50%', background:'#818cf8', display:'inline-block', animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:11, color:'#818cf8', fontWeight:600, letterSpacing:'0.6px', fontFamily:F.body }}>ML-POWERED · 5 COUNTRIES · 10 MAJORS</span>
        </div>

        {/* Headline */}
        <div style={{ marginBottom:20, lineHeight:1.04, letterSpacing:'-2.5px' }}>
          <span style={{ display:'block', fontSize:'clamp(36px,6vw,72px)', fontWeight:900, color:'rgba(255,255,255,0.94)', fontFamily:F.head }}>
            {typed}
            <span style={{ display:'inline-block', width:3, height:'0.78em', background:'#6366f1', marginLeft:4, verticalAlign:'middle', animation:'blink 1s step-end infinite' }} />
          </span>
          <span style={{ display:'block', fontSize:'clamp(36px,6vw,72px)', fontWeight:900, fontFamily:F.head,
            background:'linear-gradient(90deg,#a5b4fc 0%,#c084fc 45%,#f472b6 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            really worth it?
          </span>
        </div>

        {/* Sub */}
        <p style={{ fontSize:'clamp(14px,1.6vw,18px)', color:'rgba(255,255,255,0.38)', lineHeight:1.75, maxWidth:500, marginBottom:36, fontFamily:F.body, fontWeight:400,
          opacity:showSub?1:0, transform:showSub?'none':'translateY(8px)', transition:'all 0.55s ease' }}>
          Compare graduate salaries, student debt and immigration pathways across 5 countries — powered by machine learning trained on 12,000 real data points.
        </p>

        {/* CTA */}
        <div style={{ marginBottom:56, opacity:showSub?1:0, transition:'opacity 0.65s ease 0.1s' }}>
          <button onClick={() => router.push('/calculator')}
            style={{ padding:'15px 44px', fontSize:16, fontWeight:700, fontFamily:F.head,
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none',
              borderRadius:14, cursor:'pointer', letterSpacing:'-0.3px',
              boxShadow:'0 0 0 1px rgba(255,255,255,0.1) inset, 0 8px 30px rgba(99,102,241,0.45)',
              transition:'all 0.2s' }}
            onMouseEnter={e => { const el=e.currentTarget; el.style.transform='translateY(-2px)'; el.style.boxShadow='0 0 0 1px rgba(255,255,255,0.15) inset, 0 14px 40px rgba(99,102,241,0.6)' }}
            onMouseLeave={e => { const el=e.currentTarget; el.style.transform=''; el.style.boxShadow='0 0 0 1px rgba(255,255,255,0.1) inset, 0 8px 30px rgba(99,102,241,0.45)' }}>
            Come find out
          </button>
        </div>

        {/* Globe */}
        <div style={{ position:'relative', width:560, height:280, margin:'0 auto', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, width:130, height:'100%', background:'linear-gradient(to right,#06060f,transparent)', zIndex:3, pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:0, right:0, width:130, height:'100%', background:'linear-gradient(to left,#06060f,transparent)', zIndex:3, pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:130, background:'linear-gradient(to top,#06060f,transparent)', zIndex:3, pointerEvents:'none' }} />
          <canvas ref={canvasRef} style={{ width:560, height:560, display:'block', margin:'0 auto', marginTop:-55, opacity:0.9 }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'center', margin:'14px auto 48px', maxWidth:500,
        border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden', background:'rgba(255,255,255,0.02)' }}>
        {[{n:'5',l:'Countries'},{n:'10',l:'Majors'},{n:'12K+',l:'Data points'},{n:'R²=0.89',l:'ML accuracy'}].map((s,i,arr) => (
          <div key={s.n} style={{ flex:1, padding:'16px 0', textAlign:'center', borderRight: i<arr.length-1?'1px solid rgba(255,255,255,0.07)':'none' }}>
            <div style={{ fontSize:20, fontWeight:800, color:'#fff', fontFamily:F.head, letterSpacing:'-0.5px' }}>{s.n}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)', marginTop:3, fontFamily:F.body, letterSpacing:'0.4px' }}>{s.l}</div>
          </div>
        ))}
      </div>

    
    </div>
  )
}