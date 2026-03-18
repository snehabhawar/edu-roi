'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const Aurora = dynamic(() => import('../components/Aurora'), { ssr: false })

type Country  = 'us'|'uk'|'de'|'au'|'in'
type Major    = 'cs'|'engineering'|'medicine'|'business'|'nursing'|'law'|'psychology'|'education'|'arts'|'english'
type Tier     = 'top'|'mid'|'low'
type Living   = 'campus'|'off'|'home'
type Origin   = 'in'|'cn'|'ph'|'ng'|'br'|'other'
type DegLevel = 'undergraduate'|'graduate'

interface Scores { roi:number; salary:number; debt:number; demand:number; growth:number }
interface ROIResult {
  country:Country; salary_usd:number; salary_p25_usd:number; salary_p75_usd:number
  total_cost_usd:number; debt_usd:number; monthly_payment_usd:number
  payoff_years:number; earn_10yr_usd:number; net_10yr_usd:number; scores:Scores
}
interface PRResult {
  country:Country; visa_path:string; post_study_work_years:number
  pr_timeline:string; has_lottery:boolean; min_salary:string
  residency_req:string; citizenship:string
  ease_score:number; ease_label:string; is_priority_major:boolean; notes:string
}

const COUNTRIES = [
  {code:'us' as Country, flag:'🇺🇸', name:'USA'},
  {code:'uk' as Country, flag:'🇬🇧', name:'UK'},
  {code:'de' as Country, flag:'🇩🇪', name:'Germany'},
  {code:'au' as Country, flag:'🇦🇺', name:'Australia'},
  {code:'in' as Country, flag:'🇮🇳', name:'India'},
]
const MAJORS = [
  {value:'cs' as Major,          label:'Computer Science'},
  {value:'engineering' as Major, label:'Engineering'},
  {value:'medicine' as Major,    label:'Medicine'},
  {value:'business' as Major,    label:'Business & Finance'},
  {value:'nursing' as Major,     label:'Nursing'},
  {value:'law' as Major,         label:'Law'},
  {value:'psychology' as Major,  label:'Psychology'},
  {value:'education' as Major,   label:'Education'},
  {value:'arts' as Major,        label:'Design & Fine Arts'},
  {value:'english' as Major,     label:'Liberal Arts'},
]
const ORIGINS = [
  {value:'in' as Origin, label:'India'},
  {value:'cn' as Origin, label:'China'},
  {value:'ph' as Origin, label:'Philippines'},
  {value:'ng' as Origin, label:'Nigeria'},
  {value:'br' as Origin, label:'Brazil'},
  {value:'other' as Origin, label:'Other country'},
]

const F = {
  head: "'Bricolage Grotesque','Plus Jakarta Sans',sans-serif",
  body: "'Plus Jakarta Sans',sans-serif",
}

function fmt(n:number) {
  if(n>=1_000_000) return `$${(n/1_000_000).toFixed(1)}M`
  if(n>=1_000)     return `$${Math.round(n/1000)}K`
  return `$${Math.round(n).toLocaleString()}`
}
function sc(s:number){ return s>=70?'#4ade80':s>=45?'#fbbf24':'#f87171' }
function scBg(s:number){ return s>=70?'rgba(74,222,128,0.08)':s>=45?'rgba(251,191,36,0.08)':'rgba(248,113,113,0.08)' }
function prColor(s:number){ return s>=75?'#4ade80':s>=50?'#fbbf24':'#f87171' }
function cMeta(code:Country){ return COUNTRIES.find(c=>c.code===code)! }

function clampNum(val:string, min:number, max:number, fallback:number): number {
  const n = parseFloat(val)
  if (isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

const inputS: React.CSSProperties = {
  width:'100%', background:'rgba(255,255,255,0.05)',
  border:'1px solid rgba(255,255,255,0.09)', borderRadius:10,
  padding:'11px 14px', fontSize:14, color:'#fff', outline:'none',
  fontFamily:F.body, transition:'border-color 0.2s, background 0.2s',
}
const selectS: React.CSSProperties = { ...inputS, appearance:'none' as const, cursor:'pointer' }
const labelS: React.CSSProperties = {
  display:'block', fontSize:11, fontWeight:600,
  color:'rgba(255,255,255,0.38)', letterSpacing:'0.6px',
  textTransform:'uppercase' as const, marginBottom:5, fontFamily:F.body,
}
const hintS: React.CSSProperties = { fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:3, fontFamily:F.body }

function focusIn(e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)'
  e.currentTarget.style.background  = 'rgba(99,102,241,0.05)'
}
function focusOut(e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
  e.currentTarget.style.background  = 'rgba(255,255,255,0.05)'
}

function MiniBar({label,value}:{label:string;value:number}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4,fontFamily:F.body}}>
        <span style={{color:'rgba(255,255,255,0.32)'}}>{label}</span>
        <span style={{fontWeight:700,color:sc(value)}}>{value}/100</span>
      </div>
      <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:99,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${value}%`,background:sc(value),borderRadius:99,transition:'width 0.7s ease'}}/>
      </div>
    </div>
  )
}

function ROICard({r,rank}:{r:ROIResult;rank:number}){
  const [open,setOpen]=useState(false)
  const m=cMeta(r.country); const s=r.scores.roi; const isTop=rank===0
  return(
    <div style={{
      background:'rgba(255,255,255,0.03)', borderRadius:20, overflow:'hidden',
      border:isTop?'1.5px solid rgba(99,102,241,0.6)':'1px solid rgba(255,255,255,0.07)',
      boxShadow:isTop?'0 0 40px rgba(99,102,241,0.1)':'none', transition:'border-color 0.2s',
    }}
      onMouseEnter={e=>{if(!isTop)(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.14)'}}
      onMouseLeave={e=>{if(!isTop)(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)'}}>

      {isTop && (
        <div style={{background:'linear-gradient(90deg,#6366f1,#8b5cf6)',color:'#fff',textAlign:'center',
          fontSize:10,fontWeight:700,padding:'7px',letterSpacing:'1.5px',fontFamily:F.body}}>
          BEST ROI
        </div>
      )}

      <div style={{padding:'18px 18px 12px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:28,fontFamily:'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'}}>{m.flag}</span>
            <div>
              <div style={{fontSize:17,fontWeight:800,color:'rgba(255,255,255,0.92)',fontFamily:F.head,letterSpacing:'-0.3px'}}>{m.name}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.28)',fontFamily:F.body}}>1 yr after graduation</div>
            </div>
          </div>
          <div style={{background:scBg(s),borderRadius:10,padding:'7px 12px',textAlign:'right'}}>
            <div style={{fontSize:24,fontWeight:800,color:sc(s),lineHeight:1,fontFamily:F.head}}>{s}</div>
            <div style={{fontSize:10,fontWeight:600,color:sc(s),fontFamily:F.body}}>{s>=70?'Strong ROI':s>=50?'Average':'Risky'}</div>
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'12px 14px',marginBottom:10}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.28)',marginBottom:3,fontFamily:F.body}}>Predicted salary</div>
          <div style={{fontSize:26,fontWeight:800,color:'rgba(255,255,255,0.92)',fontFamily:F.head,letterSpacing:'-0.5px'}}>
            {fmt(r.salary_usd)}<span style={{fontSize:13,fontWeight:400,color:'rgba(255,255,255,0.22)',fontFamily:F.body}}>/yr</span>
          </div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.22)',marginTop:2,fontFamily:F.body}}>{fmt(r.salary_p25_usd)} – {fmt(r.salary_p75_usd)} range</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}}>
          {[
            {l:'Total cost',     v:fmt(r.total_cost_usd),              c:'rgba(255,255,255,0.78)'},
            {l:'Student debt',   v:fmt(r.debt_usd),                    c:r.debt_usd<20000?'#4ade80':r.debt_usd>60000?'#f87171':'#fbbf24'},
            {l:'Payoff time',    v:`${r.payoff_years} yrs`,            c:r.payoff_years<=5?'#4ade80':r.payoff_years>15?'#f87171':'#fbbf24'},
            {l:'Monthly',        v:`${fmt(r.monthly_payment_usd)}/mo`, c:'rgba(255,255,255,0.78)'},
          ].map(item=>(
            <div key={item.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'9px 11px'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.28)',marginBottom:2,fontFamily:F.body}}>{item.l}</div>
              <div style={{fontSize:14,fontWeight:700,color:item.c,fontFamily:F.head}}>{item.v}</div>
            </div>
          ))}
        </div>

        <div style={{background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.14)',borderRadius:10,padding:'10px 14px',display:'flex',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:10,color:'rgba(165,180,252,0.6)',fontFamily:F.body}}>10-year earnings</div>
            <div style={{fontSize:16,fontWeight:800,color:'rgba(165,180,252,0.9)',fontFamily:F.head}}>{fmt(r.earn_10yr_usd)}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:10,color:'rgba(165,180,252,0.6)',fontFamily:F.body}}>Net after debt</div>
            <div style={{fontSize:16,fontWeight:800,color:'#4ade80',fontFamily:F.head}}>{fmt(r.net_10yr_usd)}</div>
          </div>
        </div>
      </div>

      <button onClick={()=>setOpen(!open)} style={{width:'100%',padding:'10px',background:'none',border:'none',
        borderTop:'1px solid rgba(255,255,255,0.05)',cursor:'pointer',fontSize:11,
        color:'rgba(129,140,248,0.8)',fontWeight:600,fontFamily:F.body}}>
        {open?'▲ Hide breakdown':'▼ Score breakdown'}
      </button>
      {open && (
        <div style={{padding:'14px 18px 16px',borderTop:'1px solid rgba(255,255,255,0.05)',background:'rgba(0,0,0,0.2)'}}>
          <MiniBar label="Salary potential" value={r.scores.salary}/>
          <MiniBar label="Low debt burden"  value={r.scores.debt}/>
          <MiniBar label="Job demand"       value={r.scores.demand}/>
          <MiniBar label="Career growth"    value={r.scores.growth}/>
        </div>
      )}
    </div>
  )
}

function PRCard({p,origin}:{p:PRResult;origin:Origin}){
  const [open,setOpen]=useState(false)
  const m=cMeta(p.country)

  if(p.country==='in'&&origin==='in') return(
    <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:20,padding:18}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <span style={{fontSize:28,fontFamily:'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'}}>{m.flag}</span>
        <div style={{fontSize:17,fontWeight:800,color:'rgba(255,255,255,0.9)',fontFamily:F.head}}>{m.name}</div>
      </div>
      <div style={{background:'rgba(74,222,128,0.06)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:10,padding:'12px 14px',color:'#4ade80',fontSize:13,lineHeight:1.6,fontFamily:F.body}}>
        <strong>Studying in your home country — no PR needed.</strong><br/>
        You already have full rights to live and work here.
      </div>
    </div>
  )

  const color=prColor(p.ease_score)
  return(
    <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:20,overflow:'hidden',transition:'border-color 0.2s'}}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.14)'}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)'}}>
      <div style={{padding:'18px 18px 12px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:28,fontFamily:'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'}}>{m.flag}</span>
            <div>
              <div style={{fontSize:17,fontWeight:800,color:'rgba(255,255,255,0.9)',fontFamily:F.head,letterSpacing:'-0.3px'}}>{m.name}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.28)',fontFamily:F.body}}>PR pathway</div>
            </div>
          </div>
          <div style={{background:p.ease_score>=75?'rgba(74,222,128,0.08)':p.ease_score>=50?'rgba(251,191,36,0.08)':'rgba(248,113,113,0.08)',borderRadius:10,padding:'7px 12px',textAlign:'right'}}>
            <div style={{fontSize:24,fontWeight:800,color,lineHeight:1,fontFamily:F.head}}>{p.ease_score}</div>
            <div style={{fontSize:10,fontWeight:600,color,fontFamily:F.body}}>{p.ease_label}</div>
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.28)',marginBottom:5,fontFamily:F.body}}>Ease of getting PR (0 = very hard, 100 = easy)</div>
          <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:99,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${p.ease_score}%`,background:color,borderRadius:99,transition:'width 0.7s ease'}}/>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}}>
          {[
            {l:'Work rights',  v:`${p.post_study_work_years} yrs`,           c:p.post_study_work_years>=3?'#4ade80':'#fbbf24'},
            {l:'PR timeline',  v:p.pr_timeline,                               c:color},
            {l:'Lottery risk', v:p.has_lottery?'Yes — lottery':'No lottery',  c:p.has_lottery?'#f87171':'#4ade80'},
            {l:'Your major',   v:p.is_priority_major?'Priority track':'Standard', c:p.is_priority_major?'#4ade80':'#fbbf24'},
          ].map(item=>(
            <div key={item.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'9px 11px'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.28)',marginBottom:2,fontFamily:F.body}}>{item.l}</div>
              <div style={{fontSize:12,fontWeight:700,color:item.c,fontFamily:F.head}}>{item.v}</div>
            </div>
          ))}
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'10px 12px'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.28)',marginBottom:4,fontFamily:F.body}}>Visa route</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.65)',fontWeight:500,lineHeight:1.5,fontFamily:F.body}}>{p.visa_path}</div>
        </div>
      </div>

      <button onClick={()=>setOpen(!open)} style={{width:'100%',padding:'10px',background:'none',border:'none',
        borderTop:'1px solid rgba(255,255,255,0.05)',cursor:'pointer',fontSize:11,
        color:'rgba(129,140,248,0.8)',fontWeight:600,fontFamily:F.body}}>
        {open?'▲ Hide details':'▼ Full details'}
      </button>
      {open && (
        <div style={{padding:'14px 18px 16px',borderTop:'1px solid rgba(255,255,255,0.05)',background:'rgba(0,0,0,0.2)',fontSize:13,fontFamily:F.body}}>
          <div style={{marginBottom:7}}><span style={{color:'rgba(255,255,255,0.28)'}}>Min. salary: </span><strong style={{color:'rgba(255,255,255,0.75)'}}>{p.min_salary}</strong></div>
          <div style={{marginBottom:7}}><span style={{color:'rgba(255,255,255,0.28)'}}>Residency: </span><strong style={{color:'rgba(255,255,255,0.75)'}}>{p.residency_req}</strong></div>
          <div style={{marginBottom:12}}><span style={{color:'rgba(255,255,255,0.28)'}}>Citizenship: </span><strong style={{color:'rgba(255,255,255,0.75)'}}>{p.citizenship}</strong></div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.22)',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:10,lineHeight:1.7}}>{p.notes}</div>
        </div>
      )}
    </div>
  )
}

export default function Calculator() {
  const router = useRouter()
  const [major,       setMajor]       = useState<Major>('cs')
  const [tier,        setTier]        = useState<Tier>('mid')
  const [living,      setLiving]      = useState<Living>('off')
  const [origin,      setOrigin]      = useState<Origin>('in')
  const [degLevel,    setDegLevel]    = useState<DegLevel>('undergraduate')
  const [selected,    setSelected]    = useState<Set<Country>>(new Set<Country>(['us','uk','de','au','in']))
  const [durationStr, setDurationStr] = useState('4')
  const [aidStr,      setAidStr]      = useState('20')
  const [tuitionStr,  setTuitionStr]  = useState('')
  const [livingStr,   setLivingStr]   = useState('')
  const [tab,         setTab]         = useState<'roi'|'pr'>('roi')
  const [roiData,     setRoiData]     = useState<ROIResult[]>([])
  const [prData,      setPrData]      = useState<PRResult[]>([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [done,        setDone]        = useState(false)

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  const toggleCountry = (code:Country) => {
    setSelected(prev => {
      if(prev.has(code)&&prev.size<=2) return prev
      const next = new Set(prev)
      prev.has(code)?next.delete(code):next.add(code)
      return next
    })
  }

  const compare = useCallback(async () => {
    const duration = clampNum(durationStr, 1, 6, degLevel==='undergraduate'?4:2)
    const aidPct   = clampNum(aidStr, 0, 100, 20)
    const customTuition = tuitionStr.trim()!=='' ? clampNum(tuitionStr,0,200000,-1) : -1
    const customLiving  = livingStr.trim()!==''  ? clampNum(livingStr,0,100000,-1)  : -1

    setLoading(true); setError(''); setDone(true)
    const countries = COUNTRIES.filter(c=>selected.has(c.code)).map(c=>c.code)
    try {
      const [r1,r2] = await Promise.all([
        fetch(`${API}/roi/compare`,{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({major,countries,tier,duration_years:duration,aid_pct:aidPct,
            living,degree_level:degLevel,custom_tuition_usd:customTuition,custom_living_usd:customLiving})}),
        fetch(`${API}/pr/pathways`,{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({major,countries,origin,degree_level:degLevel})}),
      ])
      if(!r1.ok) throw new Error('Cannot reach the backend. Is FastAPI running on port 8000?')
      setRoiData(await r1.json())
      setPrData(await r2.json())
    } catch(e:unknown) {
      setError(e instanceof Error?e.message:'Something went wrong')
    } finally { setLoading(false) }
  }, [major,tier,living,origin,degLevel,selected,durationStr,aidStr,tuitionStr,livingStr,API])

  const sortedRoi = [...roiData].sort((a,b)=>b.scores.roi-a.scores.roi)
  const best   = sortedRoi[0]
  const bestPR = [...prData].filter(p=>p.country!=='in').sort((a,b)=>b.ease_score-a.ease_score)[0]

  return (
    <div style={{minHeight:'100vh',background:'#06060f',position:'relative',overflow:'hidden',fontFamily:F.body}}>

      {/* Aurora background */}
      <div style={{position:'fixed',inset:0,zIndex:0,opacity:0.9}}>
        <Aurora colorStops={['#5227FF','#7cff67','#5227FF']} blend={0.5} amplitude={1.0} speed={0.8} />
      </div>
      {/* Dark overlay */}
      <div style={{position:'fixed',inset:0,zIndex:1,background:'rgba(6,6,15,0.72)',pointerEvents:'none'}} />
      {/* Grid */}
      <div style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)',
        backgroundSize:'56px 56px'}} />

      {/* Navbar */}
      <nav style={{position:'sticky',top:0,zIndex:100,height:62,padding:'0 32px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        background:'rgba(6,6,15,0.8)',backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <button onClick={()=>router.push('/')} style={{display:'flex',alignItems:'center',gap:9,background:'none',border:'none',cursor:'pointer',padding:0}}>
          <div style={{width:32,height:32,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <span style={{color:'#fff',fontWeight:800,fontSize:17,fontFamily:F.head,letterSpacing:'-0.4px'}}>EduROI</span>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.22)',fontFamily:F.body}}>5 countries · ML-powered</span>
          <button onClick={()=>router.push('/')}
            style={{padding:'8px 20px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',
              border:'none',borderRadius:8,fontSize:12,cursor:'pointer',fontWeight:600,fontFamily:F.body,
              boxShadow:'0 2px 14px rgba(99,102,241,0.35)'}}>
            Sign in
          </button>
        </div>
      </nav>

      {/* Body */}
      <div style={{position:'relative',zIndex:10,maxWidth:1060,margin:'0 auto',padding:'34px 20px 80px'}}>

        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:26,fontWeight:800,color:'rgba(255,255,255,0.92)',marginBottom:5,fontFamily:F.head,letterSpacing:'-0.6px'}}>College ROI Calculator</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.28)',fontFamily:F.body}}>Compare salary, debt and immigration pathways across 5 countries.</p>
        </div>

        {/* Form */}
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:22,padding:28,marginBottom:22,backdropFilter:'blur(24px)'}}>

          {/* Degree toggle */}
          <div style={{marginBottom:22}}>
            <div style={{...labelS,marginBottom:8}}>Degree level</div>
            <div style={{display:'inline-flex',background:'rgba(255,255,255,0.05)',borderRadius:11,padding:3,gap:3}}>
              {(['undergraduate','graduate'] as DegLevel[]).map(d=>(
                <button key={d} onClick={()=>{setDegLevel(d);setDurationStr(d==='undergraduate'?'4':'2')}}
                  style={{padding:'9px 22px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,
                    fontWeight:700,fontFamily:F.body,transition:'all 0.15s',
                    background:degLevel===d?'#6366f1':'transparent',
                    color:degLevel===d?'#fff':'rgba(255,255,255,0.35)',
                    boxShadow:degLevel===d?'0 2px 10px rgba(99,102,241,0.4)':'none'}}>
                  {d==='undergraduate'?'Undergraduate':'Graduate (Masters / PhD)'}
                </button>
              ))}
            </div>
            <p style={{...hintS,marginTop:6}}>
              {degLevel==='undergraduate'?"Bachelor's — typically 3-4 years":"Masters or PhD — higher salary · better PR points in some countries"}
            </p>
          </div>

          {/* Field grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:20}}>

            <div><label style={labelS}>Field of study</label>
              <select style={selectS} value={major} onChange={e=>setMajor(e.target.value as Major)} onFocus={focusIn} onBlur={focusOut}>
                {MAJORS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div><label style={labelS}>University tier</label>
              <select style={selectS} value={tier} onChange={e=>setTier(e.target.value as Tier)} onFocus={focusIn} onBlur={focusOut}>
                <option value="top">Top-tier / Elite</option>
                <option value="mid">Mid-tier / Good public</option>
                <option value="low">Budget / Community</option>
              </select>
            </div>

            <div>
              <label style={labelS}>Duration (years)</label>
              <input type="number" style={inputS} value={durationStr}
                min={degLevel==='undergraduate'?3:1} max={degLevel==='undergraduate'?5:4}
                onChange={e=>setDurationStr(e.target.value)} onFocus={focusIn} onBlur={focusOut}
                placeholder={degLevel==='undergraduate'?'3 – 5':'1 – 4'} />
              <span style={hintS}>{degLevel==='undergraduate'?'Enter 3 to 5':'Enter 1 to 4'}</span>
            </div>

            <div>
              <label style={labelS}>Financial aid (%)</label>
              <input type="number" style={inputS} value={aidStr} min={0} max={100}
                onChange={e=>setAidStr(e.target.value)} onFocus={focusIn} onBlur={focusOut} placeholder="0 – 100" />
              <span style={hintS}>Percentage of tuition covered</span>
            </div>

            <div>
              <label style={labelS}>Annual tuition USD <span style={{color:'rgba(255,255,255,0.18)',fontWeight:400}}>optional</span></label>
              <input type="number" style={inputS} value={tuitionStr} min={0} max={200000}
                onChange={e=>setTuitionStr(e.target.value)} onFocus={focusIn} onBlur={focusOut}
                placeholder="Leave blank for defaults" />
              <span style={hintS}>Overrides country defaults</span>
            </div>

            <div>
              <label style={labelS}>Annual living cost USD <span style={{color:'rgba(255,255,255,0.18)',fontWeight:400}}>optional</span></label>
              <input type="number" style={inputS} value={livingStr} min={0} max={100000}
                onChange={e=>setLivingStr(e.target.value)} onFocus={focusIn} onBlur={focusOut}
                placeholder="Leave blank for defaults" />
              <span style={hintS}>Overrides country defaults</span>
            </div>

            <div><label style={labelS}>Accommodation</label>
              <select style={selectS} value={living} onChange={e=>setLiving(e.target.value as Living)} onFocus={focusIn} onBlur={focusOut}>
                <option value="campus">On-campus dorm</option>
                <option value="off">Off-campus apartment</option>
                <option value="home">Living at home</option>
              </select>
            </div>

            <div><label style={labelS}>Your home country</label>
              <select style={selectS} value={origin} onChange={e=>setOrigin(e.target.value as Origin)} onFocus={focusIn} onBlur={focusOut}>
                {ORIGINS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

          </div>

          {/* Countries */}
          <div style={{...labelS,marginBottom:10}}>Countries to compare <span style={{color:'rgba(255,255,255,0.2)',fontWeight:400,textTransform:'none',letterSpacing:0}}>(min 2)</span></div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:22}}>
            {COUNTRIES.map(c=>(
              <button key={c.code} onClick={()=>toggleCountry(c.code)}
                style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:40,
                  fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F.body,transition:'all 0.15s',
                  border:selected.has(c.code)?'1.5px solid #6366f1':'1.5px solid rgba(255,255,255,0.08)',
                  background:selected.has(c.code)?'#6366f1':'rgba(255,255,255,0.04)',
                  color:selected.has(c.code)?'#fff':'rgba(255,255,255,0.38)'}}>
                <span style={{fontSize:17,fontFamily:'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'}}>{c.flag}</span>
                {c.name}
                {selected.has(c.code)&&<span style={{fontSize:11,opacity:0.7}}>✓</span>}
              </button>
            ))}
          </div>

          <button onClick={compare} disabled={loading}
            style={{padding:'13px 40px',fontSize:14,fontWeight:700,fontFamily:F.head,letterSpacing:'-0.2px',
              background:loading?'rgba(99,102,241,0.35)':'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:'#fff',border:'none',borderRadius:12,cursor:loading?'not-allowed':'pointer',
              boxShadow:'0 0 0 1px rgba(255,255,255,0.08) inset, 0 6px 24px rgba(99,102,241,0.35)',
              transition:'all 0.2s'}}
            onMouseEnter={e=>{if(!loading){const el=e.currentTarget;el.style.transform='translateY(-2px)';el.style.boxShadow='0 0 0 1px rgba(255,255,255,0.12) inset, 0 10px 32px rgba(99,102,241,0.52)'}}}
            onMouseLeave={e=>{const el=e.currentTarget;el.style.transform='';el.style.boxShadow='0 0 0 1px rgba(255,255,255,0.08) inset, 0 6px 24px rgba(99,102,241,0.35)'}}>
            {loading?'Calculating...':'Compare countries'}
          </button>

          {error&&(
            <div style={{marginTop:14,background:'rgba(248,113,113,0.07)',border:'1px solid rgba(248,113,113,0.18)',
              color:'#f87171',borderRadius:10,padding:'12px 16px',fontSize:13,fontFamily:F.body}}>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {done&&!loading&&roiData.length>0&&(
          <>
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:14,padding:'14px 20px',marginBottom:18,display:'flex',flexWrap:'wrap',gap:18,alignItems:'center'}}>
              {best&&(
                <div style={{display:'flex',alignItems:'center',gap:9}}>
                  <span style={{fontSize:22,fontFamily:'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'}}>{cMeta(best.country).flag}</span>
                  <div><div style={{fontSize:11,color:'rgba(255,255,255,0.28)',fontFamily:F.body}}>Best ROI</div>
                  <div style={{fontWeight:700,color:'rgba(255,255,255,0.85)',fontSize:13,fontFamily:F.head}}>{cMeta(best.country).name} — {best.scores.roi}/100</div></div>
                </div>
              )}
              {bestPR&&(
                <div style={{display:'flex',alignItems:'center',gap:9,paddingLeft:18,borderLeft:'1px solid rgba(255,255,255,0.07)'}}>
                  <span style={{fontSize:22,fontFamily:'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'}}>{cMeta(bestPR.country).flag}</span>
                  <div><div style={{fontSize:11,color:'rgba(255,255,255,0.28)',fontFamily:F.body}}>Easiest PR</div>
                  <div style={{fontWeight:700,color:'rgba(255,255,255,0.85)',fontSize:13,fontFamily:F.head}}>{cMeta(bestPR.country).name} — {bestPR.ease_score}/100</div></div>
                </div>
              )}
              <div style={{marginLeft:'auto'}}>
                <span style={{fontSize:10,color:'rgba(255,255,255,0.22)',background:'rgba(255,255,255,0.05)',padding:'3px 10px',borderRadius:20,fontFamily:F.body}}>
                  {degLevel==='undergraduate'?'Undergraduate':'Graduate'} · {MAJORS.find(m=>m.value===major)?.label}
                </span>
              </div>
            </div>

            <div style={{display:'flex',gap:7,marginBottom:16}}>
              {[{id:'roi' as const,l:'ROI & Salary'},{id:'pr' as const,l:'PR & Immigration'}].map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{padding:'9px 22px',borderRadius:9,fontWeight:700,fontSize:13,cursor:'pointer',
                    border:'none',fontFamily:F.body,transition:'all 0.15s',
                    background:tab===t.id?'#6366f1':'rgba(255,255,255,0.05)',
                    color:tab===t.id?'#fff':'rgba(255,255,255,0.35)',
                    boxShadow:tab===t.id?'0 2px 12px rgba(99,102,241,0.35)':'none'}}>
                  {t.l}
                </button>
              ))}
            </div>

            {tab==='roi'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14}}>{sortedRoi.map((r,i)=><ROICard key={r.country} r={r} rank={i}/>)}</div>}
            {tab==='pr' &&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14}}>{prData.map(p=><PRCard key={p.country} p={p} origin={origin}/>)}</div>}

            <p style={{textAlign:'center',fontSize:11,color:'rgba(255,255,255,0.16)',marginTop:28,fontFamily:F.body}}>
              Gradient Boosting ML model · NCES, HESA, Destatis, ABS, NIRF · Figures in USD equivalent
            </p>
          </>
        )}

        {!done&&(
          <div style={{textAlign:'center',padding:'52px 20px'}}>
            <div style={{width:60,height:60,background:'rgba(99,102,241,0.07)',border:'1px solid rgba(99,102,241,0.14)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div style={{fontSize:20,fontWeight:800,color:'rgba(255,255,255,0.75)',fontFamily:F.head,letterSpacing:'-0.4px',marginBottom:7}}>Ready to compare</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.28)',fontFamily:F.body}}>Fill in your study profile above and click <strong style={{color:'rgba(255,255,255,0.45)'}}>Compare countries</strong></div>
          </div>
        )}
      </div>

      
    </div>
  )
}