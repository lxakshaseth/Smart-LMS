import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import {
  Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2,
  ArrowRight, Loader2, Sparkles, BookOpen, Brain, Trophy,
  BarChart3, Zap,
} from "lucide-react";

/* ── Password visibility toggle ── */
function PwField({ value, onChange, error, placeholder = "Enter your password" }: {
  value: string; onChange: (v: string) => void; error?: string; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className={`relative flex items-center rounded-2xl border-2 bg-muted/40 transition-all ${error ? "border-destructive" : "border-border focus-within:border-primary focus-within:bg-background"}`}>
        <Lock size={17} className="absolute left-4 text-muted-foreground z-10"/>
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-11 py-3.5 bg-transparent text-foreground text-sm focus:outline-none rounded-2xl placeholder:text-muted-foreground/50 relative z-0"/>
        <button type="button" onClick={() => setShow(v => !v)}
          className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 z-10">
          {show ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>
      {error && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
    </div>
  );
}

/* ── Auth left panel ── */
function AuthPanel() {
  const stats = [
    { icon:<BookOpen size={18}/>, label:"Subjects Covered", value:"50+" },
    { icon:<Brain size={18}/>,    label:"Quiz Modes",       value:"17"  },
    { icon:<Trophy size={18}/>,   label:"Students",         value:"50K+"},
    { icon:<BarChart3 size={18}/>,label:"Success Rate",     value:"94%" },
  ];

  return (
    <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 flex-col justify-between p-12 relative overflow-hidden">
      {/* decorative */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"/>

      {/* logo */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
            <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.2"/>
            <rect x="7" y="11" width="11" height="19" rx="2.5" fill="white" fillOpacity="0.7"/>
            <rect x="18.5" y="11" width="2" height="19" rx="1" fill="white" fillOpacity="0.9"/>
            <rect x="21" y="11" width="11" height="19" rx="2.5" fill="white" fillOpacity="0.5"/>
          </svg>
        </div>
        <div>
          <h1 className="text-white font-bold text-xl leading-tight">Smart AI LMS</h1>
          <p className="text-white/60 text-xs">Learn · Practice · Excel</p>
        </div>
      </div>

      {/* headline */}
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-medium">
          <Sparkles size={12}/> AI-Powered Learning Platform
        </div>
        <h2 className="text-4xl font-bold text-white leading-tight">
          Master Your Exams with AI-Powered Learning
        </h2>
        <p className="text-white/70 text-base leading-relaxed">
          Personalised study plans, smart quizzes, an AI Mentor, and real-time progress tracking — everything you need to succeed.
        </p>

        {/* stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {stats.map(s => (
            <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-white/70 mb-1">{s.icon}</div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* testimonial */}
      <div className="relative z-10 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
        <p className="text-white/90 text-sm font-semibold leading-relaxed">
          Smart AI LMS simplifies study preparation with custom mock exams, personalized learning analytics, and real-time partner collaboration.
        </p>
      </div>
    </div>
  );
}

/* ── Divider ── */
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex-1 h-px bg-border"/>
      {label}
      <div className="flex-1 h-px bg-border"/>
    </div>
  );
}

/* ── Social button ── */
function SocialBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl border-2 border-border bg-muted/30 hover:bg-muted hover:border-border/80 transition-all text-sm font-medium">
      <span className="text-lg">{icon}</span>{label}
    </button>
  );
}

/* ══════ MAIN LOGIN ══════ */
export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [errors, setErrors]       = useState<{ email?: string; password?: string; global?: string }>({});
  const [showForgot, setForgot]   = useState(false);
  const [forgotEmail, setFE]      = useState("");
  const [forgotSent, setFS]       = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim())                              e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password)                                  e.password = "Password is required";
    else if (password.length < 6)                  e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    const result = await login(email, password, remember);
    setLoading(false);
    if (result.ok) {
      setSuccess(true);
      setTimeout(() => navigate("/"), 600);
    } else {
      setErrors({ global: result.error });
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    await new Promise(r => setTimeout(r, 600));
    setFS(true);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <AuthPanel/>

      {/* right: form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="w-full max-w-md">

          {/* mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap size={18} className="text-white"/>
            </div>
            <span className="font-bold text-lg">Smart AI LMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold">Welcome back!</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to continue your learning journey</p>
          </div>

          {/* global error */}
          <AnimatePresence>
            {errors.global && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-5">
                <AlertCircle size={16} className="flex-shrink-0"/>
                {errors.global}
              </motion.div>
            )}
          </AnimatePresence>

          {/* success flash */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm mb-5">
                <CheckCircle2 size={16}/> Login successful! Redirecting…
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* email */}
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Email address</label>
              <div className={`relative flex items-center rounded-2xl border-2 bg-muted/40 transition-all ${errors.email ? "border-destructive" : "border-border focus-within:border-primary focus-within:bg-background"}`}>
                <Mail size={17} className="absolute left-4 text-muted-foreground"/>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p=>({...p,email:undefined,global:undefined})); }}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"/>
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1"><AlertCircle size={11}/>{errors.email}</p>}
            </div>

            {/* password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold">Password</label>
                <button type="button" onClick={() => setForgot(true)}
                  className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
              </div>
              <PwField value={password} onChange={v => { setPassword(v); setErrors(p=>({...p,password:undefined,global:undefined})); }} error={errors.password}/>
            </div>

            {/* remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div onClick={() => setRemember(v => !v)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${remember ? "bg-primary border-primary" : "border-border hover:border-primary/50"}`}>
                {remember && <CheckCircle2 size={13} className="text-primary-foreground"/>}
              </div>
              <span className="text-sm text-muted-foreground">Keep me signed in</span>
            </label>

            {/* submit */}
            <button type="submit" disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 active:scale-[0.98] mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin"/>Signing in…</>
                       : success ? <><CheckCircle2 size={18}/>Done!</>
                       : <>Sign In <ArrowRight size={18}/></>}
            </button>
          </form>

          <div className="my-6"><Divider label="or continue with"/></div>

          <div className="grid grid-cols-2 gap-3">
            <SocialBtn icon="🇬" label="Google" onClick={() => {}}/>
            <SocialBtn icon="🍎" label="Apple"  onClick={() => {}}/>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New here?{" "}
            <Link to="/signup" className="text-primary hover:underline font-semibold">Create a free account</Link>
          </p>
        </motion.div>
      </div>

      {/* ── forgot password modal ── */}
      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.92 }}
              className="w-full max-w-sm bg-card border border-border rounded-3xl p-7 shadow-2xl">
              {!forgotSent ? (
                <>
                  <h3 className="font-bold text-xl mb-1">Reset Password</h3>
                  <p className="text-sm text-muted-foreground mb-5">Enter your email and we'll send a reset link.</p>
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div className={`relative flex items-center rounded-2xl border-2 border-border bg-muted/40 focus-within:border-primary transition-all`}>
                      <Mail size={16} className="absolute left-3.5 text-muted-foreground"/>
                      <input type="email" value={forgotEmail} onChange={e=>setFE(e.target.value)} placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-transparent text-sm focus:outline-none"/>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit"
                        className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all">
                        Send Reset Link
                      </button>
                      <button type="button" onClick={() => { setForgot(false); setFE(""); setFS(false); }}
                        className="px-4 py-3 rounded-xl border border-border hover:bg-muted transition-all text-sm">
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={28} className="text-emerald-500"/>
                  </div>
                  <h3 className="font-bold text-lg">Check your inbox!</h3>
                  <p className="text-sm text-muted-foreground">A reset link has been sent to <strong>{forgotEmail}</strong></p>
                  <button onClick={() => { setForgot(false); setFE(""); setFS(false); }}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all mt-2">
                    Back to Sign In
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
