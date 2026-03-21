"use client"

import { useState, useEffect } from "react"
import { Loader2, LogOut, Sparkles, RotateCcw, History, AlertCircle, UserPlus, LogIn, ChevronRight } from "lucide-react"

type View = "login" | "dashboard" | "quiz" | "results"
type AuthMode = "login" | "register"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface Usuario {
  id: number
  email: string
  username: string
}

interface PuntajeHistorial {
  id: number
  puntos: number
  tema: string
  correctas: number
  totalPregs: number
  creadoEn: string
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0f; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(20px);} to { opacity:1; transform:translateY(0);} }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse-glow { 0%,100% { box-shadow:0 0 20px rgba(0,212,200,.3);} 50% { box-shadow:0 0 35px rgba(0,212,200,.6);} }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes slideIn  { from { opacity:0; transform:translateX(-10px);} to { opacity:1; transform:translateX(0);} }
    @keyframes progress { from { width:0; } }

    .qi { width:100%; height:44px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:0 14px; color:#fff; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s,background .2s; }
    .qi::placeholder { color:rgba(255,255,255,.25); }
    .qi:focus { border-color:rgba(0,212,200,.5); background:rgba(0,212,200,.04); }
    .qi:disabled { opacity:.5; cursor:not-allowed; }

    .qb { width:100%; height:46px; background:linear-gradient(135deg,#00d4c8,#0096ff); border:none; border-radius:10px; color:#0a0a0f; font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; transition:opacity .2s,transform .15s; display:flex; align-items:center; justify-content:center; gap:8px; animation:pulse-glow 3s ease infinite; }
    .qb:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
    .qb:disabled { opacity:.4; cursor:not-allowed; animation:none; }

    .qbo { width:100%; height:46px; background:transparent; border:1px solid rgba(0,212,200,.3); border-radius:10px; color:#00d4c8; font-size:14px; font-weight:500; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
    .qbo:hover { background:rgba(0,212,200,.06); border-color:rgba(0,212,200,.6); }

    .ql { display:block; font-size:11px; font-weight:500; color:rgba(255,255,255,.4); margin-bottom:6px; letter-spacing:.08em; text-transform:uppercase; }

    .opt-btn { width:100%; padding:14px 16px; text-align:left; border-radius:12px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.02); color:rgba(255,255,255,.8); font-size:14px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:12px; }
    .opt-btn:hover { border-color:rgba(0,212,200,.3); background:rgba(0,212,200,.04); color:#fff; }
    .opt-btn.selected { border-color:#00d4c8; background:rgba(0,212,200,.08); color:#fff; }

    .opt-dot { width:20px; height:20px; border-radius:50%; border:2px solid rgba(255,255,255,.2); flex-shrink:0; transition:all .2s; display:flex; align-items:center; justify-content:center; }
    .opt-btn.selected .opt-dot { border-color:#00d4c8; background:#00d4c8; }
    .opt-dot-inner { width:6px; height:6px; border-radius:50%; background:#0a0a0f; }

    .hist-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:14px 18px; display:flex; align-items:center; justify-content:space-between; animation:slideIn .3s ease forwards; }
    .hist-card:hover { border-color:rgba(0,212,200,.2); background:rgba(0,212,200,.03); }

    .review-card { border-radius:12px; padding:16px; border:1px solid; animation:fadeIn .3s ease forwards; }
    .review-opt { font-size:12px; padding:6px 10px; border-radius:8px; margin-bottom:4px; }

    .ghost-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.4); font-size:13px; font-family:'DM Sans',sans-serif; transition:color .2s; padding:6px 10px; border-radius:8px; display:flex; align-items:center; gap:6px; }
    .ghost-btn:hover { color:#00d4c8; background:rgba(0,212,200,.06); }

    .tag-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; }
  `}</style>
)

// ─── SHARED BG ────────────────────────────────────────────────────────────────
const DarkBg = () => (
  <>
    <div style={{ position:"fixed", inset:0, background:"linear-gradient(135deg,#0a0a0f 0%,#0d1117 40%,#0a1628 100%)", zIndex:-2 }} />
    <div style={{ position:"fixed", top:"10%", left:"15%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,200,.07) 0%,transparent 70%)", filter:"blur(40px)", pointerEvents:"none", zIndex:-1 }} />
    <div style={{ position:"fixed", bottom:"15%", right:"10%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,150,255,.06) 0%,transparent 70%)", filter:"blur(50px)", pointerEvents:"none", zIndex:-1 }} />
  </>
)

// ─── POKEMON CORNERS ──────────────────────────────────────────────────────────
const PokemonCorners = () => (
  <>
    {[
      { name:"squirtle",   pos:{ bottom:16, left:24  }, color:"rgba(0,212,200,.5)",   label:"SQUIRTLE"  },
      { name:"pikachu",    pos:{ bottom:16, right:24 }, color:"rgba(255,220,0,.5)",   label:"PIKACHU"   },
      { name:"snorlax",    pos:{ top:16,    left:24  }, color:"rgba(100,150,255,.5)", label:"SNORLAX"   },
      { name:"charmander", pos:{ top:16,    right:24 }, color:"rgba(255,120,0,.5)",   label:"CHARMANDER"},
    ].map(({ name, pos, color, label }) => (
      <div key={name} style={{ position:"fixed", ...pos, display:"flex", flexDirection:"column", alignItems:"center", gap:4, zIndex:50 }}>
        <img src={`https://play.pokemonshowdown.com/sprites/ani/${name}.gif`} alt={label} style={{ width:72, imageRendering:"pixelated", filter:`drop-shadow(0 0 8px ${color})` }} />
        <span style={{ fontSize:9, color, letterSpacing:".1em", fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
      </div>
    ))}
  </>
)

// ─── HEADER ───────────────────────────────────────────────────────────────────
const Header = ({ usuario, onLogout, onHistorial, showHistorial }: { usuario: Usuario; onLogout: () => void; onHistorial: () => void; showHistorial: boolean }) => (
  <header style={{ borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(10,10,15,.8)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:40 }}>
    <div style={{ maxWidth:900, margin:"0 auto", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,rgba(0,212,200,.2),rgba(0,150,255,.2))", border:"1px solid rgba(0,212,200,.3)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
          <img src="https://play.pokemonshowdown.com/sprites/ani/bulbasaur.gif" alt="Bulbasaur" style={{ width:30, imageRendering:"pixelated" }} />
        </div>
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, color:"#fff", fontSize:16, letterSpacing:"-.01em" }}>QuizAI</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <span style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginRight:8 }}>
          Hola, <span style={{ color:"#fff", fontWeight:500 }}>{usuario.username}</span>
        </span>
        <button className="ghost-btn" onClick={onHistorial}>
          <History style={{ width:15, height:15 }} />
          {showHistorial ? "Generador" : "Historial"}
        </button>
        <button className="ghost-btn" onClick={onLogout}>
          <LogOut style={{ width:15, height:15 }} />
          Salir
        </button>
      </div>
    </div>
  </header>
)

// ─── LOGIN / REGISTER ─────────────────────────────────────────────────────────
function AuthView({ onLogin }: { onLogin: (usuario: Usuario) => void }) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const body = mode === "login"
        ? { action: "login", email, password }
        : { action: "register", email, password, username }
      const res = await fetch("/api/auth", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Ocurrió un error."); return }
      localStorage.setItem("usuario", JSON.stringify(data.usuario))
      onLogin(data.usuario)
    } catch { setError("No se pudo conectar con el servidor.") }
    finally { setIsLoading(false) }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", fontFamily:"'DM Sans',sans-serif", position:"relative" }}>
      <G /><DarkBg /><PokemonCorners />
      <div style={{ width:"100%", maxWidth:420, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:24, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", boxShadow:"0 25px 50px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.06)", padding:"2.5rem", animation:"fadeUp .5s ease forwards" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:60, height:60, borderRadius:18, margin:"0 auto 1rem", background:"linear-gradient(135deg,rgba(0,212,200,.2),rgba(0,150,255,.2))", border:"1px solid rgba(0,212,200,.3)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
            <img src="https://play.pokemonshowdown.com/sprites/ani/bulbasaur.gif" alt="Bulbasaur" style={{ width:52, imageRendering:"pixelated", filter:"drop-shadow(0 0 4px rgba(0,212,200,.6))" }} />
          </div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:700, color:"#fff", marginBottom:6, letterSpacing:"-.02em" }}>
            {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
          </h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.35)" }}>
            {mode === "login" ? "Inicia sesión para continuar" : "Regístrate y guarda tus puntajes"}
          </p>
        </div>
        {/* Form */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {mode === "register" && (
            <div><label className="ql">Username</label>
              <input className="qi" type="text" placeholder="tu_usuario" value={username} onChange={e => setUsername(e.target.value)} /></div>
          )}
          <div><label className="ql">Email</label>
            <input className="qi" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label className="ql">Contraseña</label>
            <input className="qi" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
          {error && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 12px", borderRadius:10, background:"rgba(255,80,80,.08)", border:"1px solid rgba(255,80,80,.2)", fontSize:13, color:"#ff6b6b" }}>
              <AlertCircle style={{ width:14, height:14, marginTop:1, flexShrink:0 }} /><span>{error}</span>
            </div>
          )}
          <button className="qb" onClick={() => handleSubmit()} disabled={isLoading || !email || !password || (mode === "register" && !username)}>
            {isLoading ? <Loader2 style={{ width:16, height:16, animation:"spin 1s linear infinite" }} />
              : mode === "login" ? <><LogIn style={{ width:16, height:16 }} /> Iniciar Sesión</>
              : <><UserPlus style={{ width:16, height:16 }} /> Crear cuenta</>}
          </button>
          <button style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.35)", fontSize:13, fontFamily:"'DM Sans',sans-serif", transition:"color .2s", textAlign:"center" }}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null) }}
            onMouseOver={e => (e.currentTarget.style.color = "rgba(0,212,200,.8)")}
            onMouseOut={e => (e.currentTarget.style.color = "rgba(255,255,255,.35)")}>
            {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({ usuario, onLogout, onStartQuiz }: { usuario: Usuario; onLogout: () => void; onStartQuiz: (topic: string, questions: QuizQuestion[]) => void }) {
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historial, setHistorial] = useState<PuntajeHistorial[]>([])
  const [showHistorial, setShowHistorial] = useState(false)

  useEffect(() => {
    fetch(`/api/puntajes?usuarioId=${usuario.id}`).then(r => r.json()).then(d => setHistorial(d.puntajes ?? [])).catch(() => {})
  }, [usuario.id])

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setIsLoading(true); setError(null)
    try {
      const res = await fetch("/api/generate-quiz", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ topic: topic.trim() }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Error al generar."); return }
      onStartQuiz(topic.trim(), data.questions)
    } catch { setError("No se pudo conectar con el servidor.") }
    finally { setIsLoading(false) }
  }

  const scoreColor = (p: number) => p >= 80 ? "#10b981" : p >= 60 ? "#f59e0b" : "#ef4444"

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", position:"relative" }}>
      <G /><DarkBg />
      <Header usuario={usuario} onLogout={onLogout} onHistorial={() => setShowHistorial(!showHistorial)} showHistorial={showHistorial} />

      <main style={{ maxWidth:700, margin:"0 auto", padding:"48px 24px" }}>
        {showHistorial ? (
          <div style={{ animation:"fadeUp .4s ease forwards" }}>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:"#fff", marginBottom:24 }}>Tu historial</h2>
            {historial.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,.3)", fontSize:14 }}>
                <History style={{ width:40, height:40, margin:"0 auto 12px", opacity:.3 }} />
                <p>Aún no has completado ningún examen.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {historial.map((p, i) => (
                  <div key={p.id} className="hist-card" style={{ animationDelay:`${i * 0.05}s` }}>
                    <div>
                      <p style={{ color:"#fff", fontWeight:500, fontSize:14, marginBottom:3 }}>{p.tema}</p>
                      <p style={{ color:"rgba(255,255,255,.3)", fontSize:11 }}>
                        {new Date(p.creadoEn).toLocaleDateString("es-MX", { day:"2-digit", month:"short", year:"numeric" })}
                      </p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ color: scoreColor(p.puntos), fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:700 }}>{p.puntos}</p>
                      <p style={{ color:"rgba(255,255,255,.3)", fontSize:11 }}>{p.correctas}/{p.totalPregs} correctas</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign:"center", animation:"fadeUp .4s ease forwards" }}>
            <div style={{ marginBottom:40 }}>
              <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:32, fontWeight:700, color:"#fff", letterSpacing:"-.02em", marginBottom:10 }}>
                ¿Qué quieres aprender hoy?
              </h1>
              <p style={{ color:"rgba(255,255,255,.4)", fontSize:15 }}>
                Escribe un tema y generararemos 5 preguntas personalizadas
              </p>
            </div>

            <div style={{ maxWidth:520, margin:"0 auto", display:"flex", flexDirection:"column", gap:14 }}>
              <input
                className="qi"
                style={{ height:54, fontSize:15, paddingLeft:18 }}
                type="text"
                placeholder="Ej: Historia de México, Física Cuántica..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !isLoading && handleGenerate()}
                disabled={isLoading}
              />
              {error && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 14px", borderRadius:10, background:"rgba(255,80,80,.08)", border:"1px solid rgba(255,80,80,.2)", fontSize:13, color:"#ff6b6b", textAlign:"left" }}>
                  <AlertCircle style={{ width:14, height:14, marginTop:1, flexShrink:0 }} /><span>{error}</span>
                </div>
              )}
              <button className="qb" style={{ height:52, fontSize:15 }} onClick={handleGenerate} disabled={!topic.trim() || isLoading}>
                {isLoading
                  ? <><Loader2 style={{ width:18, height:18, animation:"spin 1s linear infinite" }} /> Generando Quiz...</>
                  : <><Sparkles style={{ width:18, height:18 }} /> Generar Quiz</>}
              </button>
              {isLoading && <p style={{ fontSize:12, color:"rgba(255,255,255,.3)" }}>Esto puede tomar unos segundos ✨</p>}
            </div>

            {historial.length > 0 && (
              <div style={{ marginTop:56 }}>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.25)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:16 }}>Últimos quiz</p>
                <div style={{ display:"flex", flexDirection:"column", gap:8, maxWidth:520, margin:"0 auto" }}>
                  {historial.slice(0, 3).map(p => (
                    <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)" }}>
                      <span style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>{p.tema}</span>
                      <span style={{ fontSize:14, fontWeight:600, color: scoreColor(p.puntos) }}>{p.puntos} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
function QuizView({ questions, onFinish }: { questions: QuizQuestion[]; onFinish: (score: number, answers: number[]) => void }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const isLast = current === questions.length - 1
  const progress = ((current + 1) / questions.length) * 100
  const q = questions[current]

  const handleNext = () => {
    if (selected === null) return
    const newAns = [...answers, selected]
    setAnswers(newAns)
    if (isLast) {
      const correct = newAns.reduce((acc, a, i) => acc + (a === questions[i].correctAnswer ? 1 : 0), 0)
      onFinish(Math.round((correct / questions.length) * 100), newAns)
    } else { setCurrent(current + 1); setSelected(null) }
  }

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", position:"relative" }}>
      <G /><DarkBg />
      {/* Progress bar header */}
      <header style={{ borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(10,10,15,.8)", backdropFilter:"blur(12px)", padding:"14px 24px" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, overflow:"hidden", border:"1px solid rgba(0,212,200,.3)" }}>
                <img src="https://play.pokemonshowdown.com/sprites/ani/bulbasaur.gif" alt="" style={{ width:26, imageRendering:"pixelated" }} />
              </div>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, color:"#fff", fontSize:15 }}>QuizAI</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,.35)" }}>Pregunta</span>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:700, color:"#00d4c8" }}>{current + 1}</span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>/ {questions.length}</span>
            </div>
          </div>
          <div style={{ height:4, background:"rgba(255,255,255,.06)", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#00d4c8,#0096ff)", borderRadius:4, transition:"width .4s ease", animation:"progress .3s ease" }} />
          </div>
        </div>
      </header>

      {/* Question */}
      <main style={{ flex:1, maxWidth:700, margin:"0 auto", padding:"48px 24px", width:"100%", animation:"fadeUp .3s ease forwards" }}>
        <h2 style={{ fontSize:20, fontWeight:500, color:"#fff", lineHeight:1.6, marginBottom:32 }}>{q.question}</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {q.options.map((opt, i) => (
            <button key={i} className={`opt-btn${selected === i ? " selected" : ""}`} onClick={() => setSelected(i)}>
              <div className="opt-dot">{selected === i && <div className="opt-dot-inner" />}</div>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </main>

      <footer style={{ borderTop:"1px solid rgba(255,255,255,.06)", padding:"14px 24px" }}>
        <div style={{ maxWidth:700, margin:"0 auto", display:"flex", justifyContent:"flex-end" }}>
          <button className="qb" style={{ width:"auto", paddingLeft:28, paddingRight:28, gap:8 }} onClick={handleNext} disabled={selected === null}>
            {isLast ? "Finalizar" : "Siguiente"} <ChevronRight style={{ width:16, height:16 }} />
          </button>
        </div>
      </footer>
    </div>
  )
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
function ResultsView({ score, topic, questions, userAnswers, usuario, onNewQuiz }: {
  score: number; topic: string; questions: QuizQuestion[]; userAnswers: number[]; usuario: Usuario; onNewQuiz: () => void
}) {
  const [showReview, setShowReview] = useState(false)
  const [saved, setSaved] = useState(false)
  const correctCount = userAnswers.filter((a, i) => a === questions[i].correctAnswer).length

  useEffect(() => {
    fetch("/api/puntajes", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ usuarioId:usuario.id, puntos:score, tema:topic, correctas:correctCount, totalPregs:questions.length }) })
      .then(r => r.ok && setSaved(true)).catch(() => {})
  }, []) // eslint-disable-line

  const sc = score >= 80 ? { color:"#10b981", label:"¡Excelente trabajo!", emoji:"🏆" }
           : score >= 60 ? { color:"#f59e0b", label:"¡Buen esfuerzo!",      emoji:"⭐" }
           :               { color:"#ef4444", label:"Sigue practicando",     emoji:"💪" }

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", position:"relative" }}>
      <G /><DarkBg />
      <Header usuario={usuario} onLogout={() => {}} onHistorial={() => {}} showHistorial={false} />

      <main style={{ maxWidth:560, margin:"0 auto", padding:"48px 24px", animation:"fadeUp .4s ease forwards" }}>
        {/* Score card */}
        <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:24, padding:"40px 32px", textAlign:"center", marginBottom:16, boxShadow:"0 20px 40px rgba(0,0,0,.4)" }}>
          <div style={{ fontSize:56, marginBottom:12 }}>{sc.emoji}</div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:72, fontWeight:700, color:sc.color, lineHeight:1, marginBottom:8 }}>{score}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.3)", marginBottom:4 }}>de 100 puntos</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.4)", marginBottom:4 }}>
            <span style={{ color:"#fff", fontWeight:500 }}>{correctCount}</span> de {questions.length} correctas · <span style={{ color:"rgba(0,212,200,.7)" }}>{topic}</span>
          </div>
          {saved && <div style={{ fontSize:11, color:"#10b981", marginTop:8 }}>✓ Guardado en tu historial</div>}

          <p style={{ fontSize:20, fontWeight:600, color:"#fff", margin:"24px 0 28px" }}>{sc.label}</p>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button className="qb" onClick={onNewQuiz}><RotateCcw style={{ width:16, height:16 }} /> Crear nuevo examen</button>
            <button className="qbo" onClick={() => setShowReview(!showReview)}>
              <History style={{ width:16, height:16 }} />
              {showReview ? "Ocultar respuestas" : "Ver respuestas"}
            </button>
          </div>
        </div>

        {/* Review */}
        {showReview && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {questions.map((q, i) => {
              const ok = userAnswers[i] === q.correctAnswer
              return (
                <div key={i} className="review-card" style={{ borderColor: ok ? "rgba(16,185,129,.25)" : "rgba(239,68,68,.25)", background: ok ? "rgba(16,185,129,.04)" : "rgba(239,68,68,.04)", animationDelay:`${i*.05}s` }}>
                  <p style={{ fontSize:13, fontWeight:500, color:"#fff", marginBottom:10 }}>{i + 1}. {q.question}</p>
                  {q.options.map((opt, j) => {
                    const isUser = userAnswers[i] === j
                    const isCorrect = q.correctAnswer === j
                    const bg = isCorrect ? "rgba(16,185,129,.15)" : isUser && !ok ? "rgba(239,68,68,.15)" : "transparent"
                    const color = isCorrect ? "#10b981" : isUser && !ok ? "#ef4444" : "rgba(255,255,255,.35)"
                    return (
                      <div key={j} className="review-opt" style={{ background:bg, color }}>
                        {isCorrect ? "✓ " : isUser && !ok ? "✗ " : "  "}{opt}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function QuizAI() {
  const [view, setView] = useState<View>("login")
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [topic, setTopic] = useState("")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  useEffect(() => {
    const s = localStorage.getItem("usuario")
    if (s) { try { setUsuario(JSON.parse(s)); setView("dashboard") } catch { localStorage.removeItem("usuario") } }
  }, [])

  return (
    <>
      {view === "login"     && <AuthView onLogin={u => { setUsuario(u); setView("dashboard") }} />}
      {view === "dashboard" && usuario && <DashboardView usuario={usuario} onLogout={() => { localStorage.removeItem("usuario"); setUsuario(null); setView("login") }} onStartQuiz={(t, q) => { setTopic(t); setQuestions(q); setView("quiz") }} />}
      {view === "quiz"      && <QuizView questions={questions} onFinish={(s, a) => { setScore(s); setAnswers(a); setView("results") }} />}
      {view === "results"   && usuario && <ResultsView score={score} topic={topic} questions={questions} userAnswers={answers} usuario={usuario} onNewQuiz={() => { setTopic(""); setQuestions([]); setScore(0); setAnswers([]); setView("dashboard") }} />}
    </>
  )
}