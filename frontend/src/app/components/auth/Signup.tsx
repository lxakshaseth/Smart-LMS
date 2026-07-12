import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle,
  CheckCircle2, ArrowRight, Loader2, Sparkles, GraduationCap,
  Zap, Check, X,
} from "lucide-react";

/* ── password strength ── */
function pwStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8)                     s++;
  if (/[A-Z]/.test(pw))                   s++;
  if (/[0-9]/.test(pw))                   s++;
  if (/[^A-Za-z0-9]/.test(pw))           s++;
  const map = [
    { label:"Too short",   color:"bg-destructive"    },
    { label:"Weak",        color:"bg-orange-500"     },
    { label:"Fair",        color:"bg-amber-500"      },
    { label:"Good",        color:"bg-blue-500"       },
    { label:"Strong",      color:"bg-emerald-500"    },
  ];
  return { score:s, ...map[Math.min(s, map.length-1)] };
}

const EXAMS = ["JEE Main","JEE Advanced","NEET","GATE","CAT","UPSC","SSC CGL","IBPS/SBI","NDA/CDS","Railway RRB","Class 10 Boards","Class 12 Boards","Other"];

const FEATURES = [
  { icon:"🤖", text:"AI Mentor that explains like a personal tutor"     },
  { icon:"🧠", text:"17 quiz modes across JEE, NEET, UPSC, SSC & more"  },
  { icon:"📊", text:"Real-time progress analytics & weak area detection" },
  { icon:"⏱️", text:"Focus Timer with Pomodoro for deep work sessions"   },
  { icon:"🎮", text:"Critical Thinking games — 16 brain challenges"     },
  { icon:"📝", text:"Smart notes, highlights & AI-generated summaries"  },
];

/* ── auth panel ── */
function AuthPanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"/>

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

      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-medium">
          <Sparkles size={12}/> Free • No credit card required
        </div>
        <h2 className="text-4xl font-bold text-white leading-tight">
          Start Your Journey to Academic Excellence
        </h2>
        <div className="space-y-3">
          {FEATURES.map(f => (
            <div key={f.text} className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{f.icon}</span>
              <span className="text-white/80 text-sm leading-relaxed">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
        <p className="text-white/90 text-sm font-semibold leading-relaxed">
          Smart AI LMS simplifies study preparation with custom mock exams, personalized learning analytics, and real-time partner collaboration.
        </p>
      </div>
    </div>
  );
}

/* ── field wrapper ── */
function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold mb-1.5 block">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
    </div>
  );
}

/* ── text input ── */
function TInput({ icon, type="text", placeholder, value, onChange, error, readOnly }: {
  icon: React.ReactNode; type?: string; placeholder?: string;
  value: string; onChange: (v:string)=>void; error?: string; readOnly?: boolean;
}) {
  return (
    <div className={`relative flex items-center rounded-2xl border-2 bg-muted/40 transition-all ${error ? "border-destructive" : "border-border focus-within:border-primary focus-within:bg-background"}`}>
      <span className="absolute left-4 text-muted-foreground">{icon}</span>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"/>
    </div>
  );
}

/* ══════ MAIN SIGNUP ══════ */
export default function Signup() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [step, setStep]   = useState<1|2>(1);
  const [form, setForm]   = useState({
    username:"", fullName:"", email:"", phone:"", password:"", confirm:"", exam:"", agreeTerms:false,
  });
  const [showPw, setShowPw]     = useState(false);
  const [showCnf, setShowCnf]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errors, setErrors]     = useState<Record<string,string>>({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const set = (k: string, v: string | boolean) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = {...p}; delete n[k]; delete n.global; return n; });
  };

  const strength = pwStrength(form.password);

  const validateStep1 = () => {
    const e: Record<string,string> = {};
    if (!form.username.trim()) {
      e.username = "Username is required";
    } else if (form.username.trim().length < 3) {
      e.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) {
      e.username = "Username can only contain letters, numbers, and underscores";
    }
    if (!form.fullName.trim())                              e.fullName = "Full name is required";
    else if (form.fullName.trim().split(/\s+/).length < 2) e.fullName = "Please enter your first and last name";
    if (!form.email.trim())                                 e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email  = "Enter a valid email address";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g,""))) e.phone = "Enter a valid 10-digit Indian mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string,string> = {};
    if (!form.password)              e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (strength.score < 2)     e.password = "Password is too weak";
    if (!form.confirm)               e.confirm  = "Please confirm your password";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    if (!form.exam)                  e.exam     = "Please select your target exam";
    if (!form.agreeTerms)            e.terms    = "You must agree to the Terms & Privacy Policy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    const result = await signup(form.fullName.trim(), form.email.trim(), form.password, form.username.trim(), form.exam, form.phone);
    setLoading(false);
    if (result.ok) {
      setSuccess(true);
      setTimeout(() => navigate("/"), 700);
    } else {
      setErrors({ global: result.error ?? "Something went wrong." });
      setStep(1);
    }
  };

  const pwReqs = [
    { label:"At least 8 characters",   ok: form.password.length >= 8 },
    { label:"One uppercase letter",     ok: /[A-Z]/.test(form.password) },
    { label:"One number",               ok: /[0-9]/.test(form.password) },
    { label:"One special character",    ok: /[^A-Za-z0-9]/.test(form.password) },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <AuthPanel/>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
          className="w-full max-w-md">

          {/* mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap size={18} className="text-white"/>
            </div>
            <span className="font-bold text-lg">Smart AI LMS</span>
          </div>

          {/* step indicator */}
          <div className="flex items-center gap-3 mb-6">
            {[1,2].map(s=>(
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {step > s ? <Check size={14}/> : s}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 w-16 rounded-full transition-all ${step > s ? "bg-primary" : "bg-muted"}`}/>}
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-auto">Step {step} of 2</span>
          </div>

          <div className="mb-7">
            <h2 className="text-3xl font-bold">{step===1?"Create Account":"Almost done!"}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {step===1?"Join thousands of students studying smarter":"Set your password and target exam"}
            </p>
          </div>

          {/* global error */}
          <AnimatePresence>
            {errors.global && (
              <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-5">
                <AlertCircle size={16} className="flex-shrink-0"/>{errors.global}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm mb-5">
                <CheckCircle2 size={16}/> Account created! Redirecting to dashboard…
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
              className="space-y-4">
              <Field label="Username" required error={errors.username}>
                <TInput icon={<Sparkles size={17}/>} placeholder="e.g. arjun_sharma" value={form.username} onChange={v=>set("username",v)} error={errors.username}/>
              </Field>
              <Field label="Full Name" required error={errors.fullName}>
                <TInput icon={<User size={17}/>} placeholder="e.g. Arjun Sharma" value={form.fullName} onChange={v=>set("fullName",v)} error={errors.fullName}/>
              </Field>
              <Field label="Email Address" required error={errors.email}>
                <TInput icon={<Mail size={17}/>} type="email" placeholder="you@example.com" value={form.email} onChange={v=>set("email",v)} error={errors.email}/>
              </Field>
              <Field label="Mobile Number" error={errors.phone}>
                <TInput icon={<Phone size={17}/>} type="tel" placeholder="+91 98765 43210 (optional)" value={form.phone} onChange={v=>set("phone",v)} error={errors.phone}/>
              </Field>
              <button type="button" onClick={nextStep}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-2">
                Continue <ArrowRight size={18}/>
              </button>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <motion.form key="step2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
              onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* password */}
              <Field label="Create Password" required error={errors.password}>
                <div className={`relative flex items-center rounded-2xl border-2 bg-muted/40 transition-all ${errors.password?"border-destructive":"border-border focus-within:border-primary focus-within:bg-background"}`}>
                  <Lock size={17} className="absolute left-4 text-muted-foreground"/>
                  <input type={showPw?"text":"password"} value={form.password} onChange={e=>set("password",e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-11 pr-11 py-3.5 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"/>
                  <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3.5 text-muted-foreground hover:text-foreground p-0.5">
                    {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
                {/* strength bar */}
                {form.password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1 h-1.5">
                      {[1,2,3,4].map(i=>(
                        <div key={i} className={`flex-1 rounded-full transition-all ${i<=strength.score?strength.color:"bg-muted"}`}/>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{strength.label}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {pwReqs.map(r=>(
                        <p key={r.label} className={`text-[10px] flex items-center gap-1 ${r.ok?"text-emerald-500":"text-muted-foreground/60"}`}>
                          {r.ok?<Check size={10}/>:<span className="w-2.5 h-2.5 rounded-full border border-current inline-block flex-shrink-0"/>}
                          {r.label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </Field>

              {/* confirm */}
              <Field label="Confirm Password" required error={errors.confirm}>
                <div className={`relative flex items-center rounded-2xl border-2 bg-muted/40 transition-all ${errors.confirm?"border-destructive":"border-border focus-within:border-primary focus-within:bg-background"}`}>
                  <Lock size={17} className="absolute left-4 text-muted-foreground"/>
                  <input type={showCnf?"text":"password"} value={form.confirm} onChange={e=>set("confirm",e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-11 pr-11 py-3.5 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"/>
                  <button type="button" onClick={()=>setShowCnf(v=>!v)} className="absolute right-3.5 text-muted-foreground hover:text-foreground p-0.5">
                    {showCnf?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
                {form.confirm && form.confirm===form.password && !errors.confirm && (
                  <p className="text-xs text-emerald-500 mt-1.5 flex items-center gap-1"><Check size={11}/>Passwords match</p>
                )}
              </Field>

              {/* exam */}
              <Field label="Target Exam" required error={errors.exam}>
                <div className={`relative rounded-2xl border-2 bg-muted/40 transition-all ${errors.exam?"border-destructive":"border-border focus-within:border-primary focus-within:bg-background"}`}>
                  <GraduationCap size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <select value={form.exam} onChange={e=>set("exam",e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm focus:outline-none appearance-none">
                    <option value="">Select your target exam…</option>
                    {EXAMS.map(ex=><option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>
              </Field>

              {/* terms */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <div onClick={()=>set("agreeTerms",!form.agreeTerms)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.agreeTerms?"bg-primary border-primary":"border-border hover:border-primary/50"}`}>
                    {form.agreeTerms && <Check size={12} className="text-primary-foreground"/>}
                  </div>
                   <span className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <button type="button" onClick={() => setShowTermsModal(true)} className="text-primary hover:underline font-semibold focus:outline-none">Terms of Service</button> and{" "}
                    <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-primary hover:underline font-semibold focus:outline-none">Privacy Policy</button>
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.terms}</p>}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={()=>setStep(1)}
                  className="px-5 py-3.5 rounded-2xl border-2 border-border hover:bg-muted transition-all text-sm font-semibold">
                  Back
                </button>
                <button type="submit" disabled={loading||success}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 active:scale-[0.98]">
                  {loading ? <><Loader2 size={18} className="animate-spin"/>Creating account…</>
                           : success ? <><CheckCircle2 size={18}/>Done!</>
                           : <>Create Account <ArrowRight size={18}/></>}
                </button>
              </div>
            </motion.form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
          </p>
        </motion.div>
      </div>
      {/* ── TERMS OF SERVICE MODAL ── */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-background rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Sparkles className="text-primary" size={17} /> Terms of Service
              </h3>
              <button onClick={() => setShowTermsModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground text-sm">Welcome to Smart AI LMS!</p>
              <p>These terms govern your use of the Smart AI LMS platform. By registering an account, you agree to comply with and be bound by the following conditions.</p>
              
              <p className="font-bold text-foreground">1. User Accounts</p>
              <p>You must provide accurate and complete registration details. You are solely responsible for keeping your password secure and for any actions taken under your account name.</p>
              
              <p className="font-bold text-foreground">2. Academic Integrity</p>
              <p>Smart AI LMS is designed to enhance your studies, quizzes, and learning analytics. You agree not to use our AI Tutor or mock test simulator to engage in academic dishonesty, copying, or cheating during real examinations.</p>
              
              <p className="font-bold text-foreground">3. User Content & Collaboration</p>
              <p>Our workspace allows sharing study partner requests, documents, images, and simulated voice/video peer collaboration. You retain ownership of materials you upload, but grant us a license to host and serve them statically to your connected study partners.</p>
              
              <p className="font-bold text-foreground">4. System Limitations</p>
              <p>The service is provided "as is". While our AI models (Gemini, Llama) strive for accuracy, educational responses are advisory. Always consult official textbooks for critical exam prep syllabus checks.</p>
            </div>
            <div className="px-6 py-3 bg-muted border-t border-border flex justify-end">
              <button onClick={() => setShowTermsModal(false)} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md">
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRIVACY POLICY MODAL ── */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-background rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Sparkles className="text-primary" size={17} /> Privacy Policy
              </h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground text-sm">Privacy Commitment</p>
              <p>Your privacy is of utmost importance to us. This policy describes what information we collect and how we use it to customize your learning hub experience.</p>
              
              <p className="font-bold text-foreground">1. Information We Collect</p>
              <p>We collect details you submit (name, username, email, phone, target exams) as well as academic progress data (quiz stats, streak dates, notes generated, study hours, and weak/strong topics).</p>
              
              <p className="font-bold text-foreground">2. Messaging and Static Uploads</p>
              <p>Chats, shared documents, voice notes, and videos shared with study partners are stored securely on our backend. We do not sell or lease your files. They are strictly retrieved by authorized connected partners.</p>
              
              <p className="font-bold text-foreground">3. AI Data Processing</p>
              <p>To provide personal mentor tutoring and note summary features, study queries are processed securely by our AI endpoints. No personal identifier details are shared with external AI model providers.</p>
              
              <p className="font-bold text-foreground">4. Storage Security</p>
              <p>We use standard encryption protocols to protect your files on our server store. You can manage your account and request deletion of personal information at any time in the settings area.</p>
            </div>
            <div className="px-6 py-3 bg-muted border-t border-border flex justify-end">
              <button onClick={() => setShowPrivacyModal(false)} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md">
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
