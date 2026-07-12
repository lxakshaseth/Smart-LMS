import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, Clock, Eye, Search, TrendingUp, Sparkles, BookOpen,
  Bot, X, Bookmark, BookmarkCheck, ThumbsUp,
  Star, Zap, GraduationCap, FlaskConical, Calculator,
  Dna, Globe, Shield, BarChart3, Volume2, ExternalLink,
} from "lucide-react";
import { getTopics } from "../../lib/topicStore";
import { Link, useSearchParams } from "react-router";
import { apiRequest } from "../../lib/api";

/* ══════════════ TYPES ══════════════ */
interface Video {
  id: string; title: string; channel: string; channelAvatar: string;
  duration: string; views: string; likes: string; uploadedAt: string;
  subject: string; level: string; tags: string[]; gradient: string;
  emoji: string; youtubeUrl: string; description: string; featured?: boolean;
}

/* ══════════════ VIDEO DATABASE ══════════════ */
const allVideos: Video[] = [
  { id:"v1",  title:"Newton's Laws of Motion — Complete JEE/NEET Masterclass",
    channel:"Physics Wallah", channelAvatar:"PW", duration:"38:24", views:"12.4M", likes:"891K",
    uploadedAt:"3 days ago", subject:"Physics", level:"JEE/NEET",
    tags:["newton","laws of motion","mechanics","physics","jee","neet","force","inertia"],
    gradient:"from-blue-600 to-indigo-700", emoji:"⚡",
    youtubeUrl:"https://www.youtube.com/results?search_query=newton+laws+of+motion+jee+neet",
    description:"All 3 Newton's laws with FBDs, solved numericals, and JEE Advanced problems.", featured:true },

  { id:"v2",  title:"Thermodynamics — Laws, PV Diagrams & Carnot Engine | JEE 2025",
    channel:"Vedantu JEE", channelAvatar:"VJ", duration:"52:10", views:"7.2M", likes:"543K",
    uploadedAt:"1 week ago", subject:"Physics", level:"JEE",
    tags:["thermodynamics","carnot","heat","entropy","physics","jee","pv diagram"],
    gradient:"from-orange-500 to-rose-600", emoji:"🌡️",
    youtubeUrl:"https://www.youtube.com/results?search_query=thermodynamics+jee+2025",
    description:"PV diagrams, internal energy, isothermal & adiabatic processes with numericals." },

  { id:"v3",  title:"Electrostatics Full Chapter — Coulomb's Law to Capacitors",
    channel:"Unacademy JEE", channelAvatar:"UJ", duration:"1:24:30", views:"9.8M", likes:"720K",
    uploadedAt:"2 weeks ago", subject:"Physics", level:"JEE",
    tags:["electrostatics","coulomb","capacitor","electric field","jee","neet","charge"],
    gradient:"from-yellow-500 to-orange-500", emoji:"⚡",
    youtubeUrl:"https://www.youtube.com/results?search_query=electrostatics+jee+full+chapter",
    description:"Electric charge to parallel plate capacitors — all MCQ tricks included." },

  { id:"v4",  title:"Organic Chemistry — SN1 SN2 Reactions | NEET/JEE",
    channel:"Chemistry Guruji", channelAvatar:"CG", duration:"44:15", views:"5.6M", likes:"412K",
    uploadedAt:"5 days ago", subject:"Chemistry", level:"JEE/NEET",
    tags:["organic chemistry","sn1","sn2","reaction","mechanism","chemistry","neet","jee","nucleophilic"],
    gradient:"from-green-500 to-teal-600", emoji:"🧪",
    youtubeUrl:"https://www.youtube.com/results?search_query=sn1+sn2+organic+chemistry+jee+neet",
    description:"Master nucleophilic substitution with mechanism walkthroughs and Walden inversion." },

  { id:"v5",  title:"Chemical Bonding — Hybridisation, VSEPR, MO Theory | JEE Advanced",
    channel:"eSaral Chemistry", channelAvatar:"ES", duration:"1:02:00", views:"4.1M", likes:"310K",
    uploadedAt:"1 week ago", subject:"Chemistry", level:"JEE",
    tags:["chemical bonding","hybridization","vsepr","molecular orbital","chemistry","jee"],
    gradient:"from-emerald-500 to-green-600", emoji:"🔗",
    youtubeUrl:"https://www.youtube.com/results?search_query=chemical+bonding+hybridization+jee",
    description:"sp, sp2, sp3 hybridisation with geometry prediction using VSEPR and MO diagrams." },

  { id:"v6",  title:"Balancing Chemical Equations — Methods & Tricks",
    channel:"Chemistry Pro", channelAvatar:"CP", duration:"18:30", views:"3.2M", likes:"240K",
    uploadedAt:"3 days ago", subject:"Chemistry", level:"NEET/CBSE",
    tags:["balancing equations","chemical equations","chemistry","cbse","neet","stoichiometry"],
    gradient:"from-cyan-500 to-blue-500", emoji:"⚖️",
    youtubeUrl:"https://www.youtube.com/results?search_query=balancing+chemical+equations+tricks",
    description:"Step-by-step methods: oxidation number and half-reaction approaches." },

  { id:"v7",  title:"Integration by Parts — LIATE Rule & All Techniques | JEE Calculus",
    channel:"Mathonation", channelAvatar:"MN", duration:"55:40", views:"6.8M", likes:"580K",
    uploadedAt:"4 days ago", subject:"Mathematics", level:"JEE",
    tags:["integration","calculus","integration by parts","liate","maths","jee","integral"],
    gradient:"from-amber-500 to-yellow-500", emoji:"∫",
    youtubeUrl:"https://www.youtube.com/results?search_query=integration+by+parts+jee+calculus",
    description:"LIATE mnemonic, reduction formulas, and special integral tricks for JEE.", featured:true },

  { id:"v8",  title:"Differential Equations — Formation & Solution Methods | JEE/CBSE",
    channel:"Khan Academy India", channelAvatar:"KA", duration:"42:20", views:"4.3M", likes:"360K",
    uploadedAt:"2 weeks ago", subject:"Mathematics", level:"JEE/CBSE",
    tags:["differential equations","calculus","maths","jee","cbse","ode"],
    gradient:"from-yellow-400 to-amber-600", emoji:"📐",
    youtubeUrl:"https://www.youtube.com/results?search_query=differential+equations+jee+cbse",
    description:"Variable separable, homogeneous, and linear differential equations with examples." },

  { id:"v9",  title:"Matrices & Determinants Full Chapter — All Tricks | CBSE/JEE",
    channel:"Vedantu Math", channelAvatar:"VM", duration:"1:10:00", views:"5.1M", likes:"430K",
    uploadedAt:"1 week ago", subject:"Mathematics", level:"JEE/CBSE",
    tags:["matrices","determinants","maths","jee","cbse","linear algebra","cramer"],
    gradient:"from-orange-400 to-amber-500", emoji:"🔢",
    youtubeUrl:"https://www.youtube.com/results?search_query=matrices+determinants+jee+cbse",
    description:"Operations, inverse, Cramer's rule, and previous year JEE questions." },

  { id:"v10", title:"Cell Division — Mitosis vs Meiosis Complete | NEET Biology",
    channel:"Aakash NEET Bio", channelAvatar:"AN", duration:"46:30", views:"8.9M", likes:"670K",
    uploadedAt:"2 days ago", subject:"Biology", level:"NEET",
    tags:["cell division","mitosis","meiosis","biology","neet","cell","crossing over","pmat"],
    gradient:"from-purple-500 to-violet-600", emoji:"🧬",
    youtubeUrl:"https://www.youtube.com/results?search_query=mitosis+meiosis+neet+biology",
    description:"PMAT stages of mitosis, all 4 phases of meiosis, crossing over, and MCQ practice.", featured:true },

  { id:"v11", title:"Human Digestive System — Structure, Enzymes & Functions | NEET",
    channel:"Bio Mentor", channelAvatar:"BM", duration:"35:15", views:"5.7M", likes:"445K",
    uploadedAt:"6 days ago", subject:"Biology", level:"NEET",
    tags:["digestive system","digestion","enzymes","biology","neet","human physiology","gut"],
    gradient:"from-fuchsia-500 to-pink-600", emoji:"🫁",
    youtubeUrl:"https://www.youtube.com/results?search_query=human+digestive+system+neet",
    description:"Mouth to large intestine — every enzyme, hormone, and absorption process." },

  { id:"v12", title:"DNA Replication & Protein Synthesis — Transcription Translation | NEET",
    channel:"Biology Vision", channelAvatar:"BV", duration:"50:00", views:"6.3M", likes:"510K",
    uploadedAt:"4 days ago", subject:"Biology", level:"NEET",
    tags:["dna replication","protein synthesis","transcription","translation","biology","neet","genetics","rna"],
    gradient:"from-violet-500 to-purple-600", emoji:"🔬",
    youtubeUrl:"https://www.youtube.com/results?search_query=dna+replication+protein+synthesis+neet",
    description:"Central dogma, codons, semi-conservative replication for NEET Biology." },

  { id:"v13", title:"Indian Polity — Parliament Structure | UPSC Prelims 2025",
    channel:"StudyIQ IAS", channelAvatar:"SI", duration:"58:00", views:"3.8M", likes:"290K",
    uploadedAt:"1 week ago", subject:"UPSC", level:"UPSC",
    tags:["indian polity","parliament","upsc","ias","constitution","civics","lok sabha","rajya sabha"],
    gradient:"from-rose-500 to-red-600", emoji:"🏛️",
    youtubeUrl:"https://www.youtube.com/results?search_query=indian+polity+parliament+upsc+2025",
    description:"Lok Sabha, Rajya Sabha, legislative procedures, and constitutional amendments." },

  { id:"v14", title:"SSC CGL — Quantitative Aptitude Full Strategy | Maths Tricks",
    channel:"SSC Adda247", channelAvatar:"SA", duration:"1:15:00", views:"2.9M", likes:"220K",
    uploadedAt:"5 days ago", subject:"SSC", level:"SSC",
    tags:["ssc","cgl","quantitative aptitude","maths","ssc cgl","government exam","percentage","ratio"],
    gradient:"from-indigo-500 to-blue-600", emoji:"📊",
    youtubeUrl:"https://www.youtube.com/results?search_query=ssc+cgl+quantitative+aptitude+tricks",
    description:"Time & work, percentage, ratio & proportion — all short tricks for SSC CGL 2025." },

  { id:"v15", title:"Banking Awareness Full Course — IBPS PO/Clerk 2025",
    channel:"Oliveboard Banking", channelAvatar:"OB", duration:"1:30:00", views:"2.1M", likes:"180K",
    uploadedAt:"2 weeks ago", subject:"Banking", level:"Banking",
    tags:["banking","ibps","sbi","banking awareness","po","clerk","government exam","rbi"],
    gradient:"from-teal-500 to-green-600", emoji:"🏦",
    youtubeUrl:"https://www.youtube.com/results?search_query=banking+awareness+ibps+po+2025",
    description:"RBI, monetary policy, types of accounts, financial institutions for IBPS/SBI." },

  { id:"v16", title:"NCERT Class 10 Science — Light Reflection & Refraction",
    channel:"Magnet Brains", channelAvatar:"MB", duration:"28:45", views:"10.2M", likes:"780K",
    uploadedAt:"1 month ago", subject:"Class 10", level:"CBSE",
    tags:["class 10","science","light","reflection","refraction","ncert","cbse","optics","mirror","lens"],
    gradient:"from-sky-500 to-cyan-500", emoji:"💡",
    youtubeUrl:"https://www.youtube.com/results?search_query=class+10+science+light+reflection+refraction+ncert",
    description:"Mirror formula, lens formula, power of lens — complete NCERT Class 10 chapter." },

  { id:"v17", title:"NCERT Class 12 Maths — Probability Full Chapter | CBSE Boards",
    channel:"Aarti Mam Maths", channelAvatar:"AM", duration:"1:05:00", views:"7.4M", likes:"560K",
    uploadedAt:"3 weeks ago", subject:"Class 12", level:"CBSE",
    tags:["class 12","probability","maths","cbse","board exam","ncert","bayes","binomial"],
    gradient:"from-pink-500 to-rose-500", emoji:"🎲",
    youtubeUrl:"https://www.youtube.com/results?search_query=class+12+maths+probability+cbse+boards",
    description:"Conditional probability, Bayes' theorem, Binomial distribution — full CBSE chapter." },

  { id:"v18", title:"Class 11 Physics — Laws of Motion with Numericals | CBSE/JEE",
    channel:"Doubtnut Physics", channelAvatar:"DP", duration:"1:18:00", views:"6.1M", likes:"490K",
    uploadedAt:"2 weeks ago", subject:"Class 11", level:"CBSE/JEE",
    tags:["class 11","physics","laws of motion","newton","cbse","jee","friction","circular motion"],
    gradient:"from-blue-500 to-indigo-500", emoji:"📏",
    youtubeUrl:"https://www.youtube.com/results?search_query=class+11+physics+laws+of+motion+numericals",
    description:"NCERT + HC Verma problems on Newton's laws, friction, and circular motion." },
];

/* ══════════════ HELPERS ══════════════ */
const subjectMeta: Record<string, { color:string; bg:string; icon:React.ReactNode }> = {
  Physics:     { color:"text-blue-400",   bg:"bg-blue-500/10 border-blue-500/20",    icon:<Zap size={12}/>          },
  Chemistry:   { color:"text-green-400",  bg:"bg-green-500/10 border-green-500/20",  icon:<FlaskConical size={12}/> },
  Mathematics: { color:"text-amber-400",  bg:"bg-amber-500/10 border-amber-500/20",  icon:<Calculator size={12}/>   },
  Biology:     { color:"text-purple-400", bg:"bg-purple-500/10 border-purple-500/20",icon:<Dna size={12}/>          },
  UPSC:        { color:"text-rose-400",   bg:"bg-rose-500/10 border-rose-500/20",    icon:<Globe size={12}/>        },
  SSC:         { color:"text-indigo-400", bg:"bg-indigo-500/10 border-indigo-500/20",icon:<Shield size={12}/>       },
  Banking:     { color:"text-teal-400",   bg:"bg-teal-500/10 border-teal-500/20",    icon:<BarChart3 size={12}/>    },
  "Class 10":  { color:"text-sky-400",    bg:"bg-sky-500/10 border-sky-500/20",      icon:<BookOpen size={12}/>     },
  "Class 11":  { color:"text-sky-400",    bg:"bg-sky-500/10 border-sky-500/20",      icon:<BookOpen size={12}/>     },
  "Class 12":  { color:"text-sky-400",    bg:"bg-sky-500/10 border-sky-500/20",      icon:<BookOpen size={12}/>     },
};

function matchScore(v: Video, topics: string[]): number {
  if (!topics.length) return 0;
  let s = 0;
  for (const topic of topics) {
    for (const w of topic.toLowerCase().split(/\s+/)) {
      if (w.length < 3) continue;
      if (v.title.toLowerCase().includes(w))       s += 3;
      if (v.tags.some(t => t.includes(w)))         s += 2;
      if (v.subject.toLowerCase().includes(w))     s += 2;
      if (v.description.toLowerCase().includes(w)) s += 1;
    }
  }
  return s;
}

const stagger = { hidden:{opacity:0}, visible:{opacity:1,transition:{staggerChildren:0.07}} };
const rise    = { hidden:{opacity:0,y:16}, visible:{opacity:1,y:0,transition:{duration:0.35}} };

/* ══════════════ VIDEO CARD ══════════════ */
function VideoCard({ video, saved, onSave, rank }:{
  video:Video; saved:boolean; onSave:()=>void; rank?:number;
}) {
  const meta = subjectMeta[video.subject] ?? { color:"text-muted-foreground", bg:"bg-muted border-border", icon:<BookOpen size={12}/> };
  return (
    <motion.div variants={rise}
      className="group relative rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col cursor-pointer">

      {/* thumbnail */}
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${video.gradient} flex items-center justify-center`}>
            <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-500">{video.emoji}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-2xl transition-colors">
            <Play size={24} className="text-white ml-1" fill="white"/>
          </a>
        </div>

        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[11px] rounded-md font-mono font-medium">
          {video.duration}
        </div>

        {rank && rank <= 3 && (
          <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg text-white text-xs font-bold
            ${rank===1?"bg-amber-500":rank===2?"bg-slate-400":"bg-amber-700"}`}>
            #{rank}
          </div>
        )}

        <button onClick={e => { e.stopPropagation(); onSave(); }}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all">
          {saved ? <BookmarkCheck size={14} className="text-amber-400"/> : <Bookmark size={14}/>}
        </button>
      </div>

      {/* info */}
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[9px] font-bold">{video.channelAvatar}</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium truncate">{video.channel}</span>
        </div>

        <h3 className="text-sm font-bold leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
          {video.title}
        </h3>
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{video.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Eye size={11}/>{video.views}</span>
            <span className="flex items-center gap-1"><ThumbsUp size={11}/>{video.likes}</span>
            <span className="flex items-center gap-1"><Clock size={11}/>{video.uploadedAt}</span>
          </div>
          <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${meta.bg} ${meta.color}`}>
            {meta.icon}{video.subject}
          </span>
        </div>
      </div>
    </motion.div>
  );
}



/* ══════════════ MAIN ══════════════ */
export default function YouTube() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  // When URL ?q param changes (e.g. from Navbar), update local search
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearch(q);
  }, [searchParams.get("q")]);

  const [saved, setSaved]         = useState<Set<string>>(new Set());
  const [aiTopics, setAiTopics]   = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(true);
  const searchRef                 = useRef<HTMLInputElement>(null);

  const [backendVideos, setBackendVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setAiTopics(getTopics());
    load();
    window.addEventListener("lms_topics_updated", load);
    return () => window.removeEventListener("lms_topics_updated", load);
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setBackendVideos([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const response = await apiRequest<{ success: boolean; videos: any[] }>(
          `/youtube/search?q=${encodeURIComponent(search.trim())}`
        );
        if (response.success) {
          const mapped = response.videos.map((v: any) => ({
            id: v.videoId || v.id,
            title: v.title,
            channel: v.channel || "YouTube",
            channelAvatar: v.channelAvatar || "YT",
            duration: v.duration || "0:00",
            views: v.views || "0",
            likes: v.likes || "N/A",
            uploadedAt: v.uploadedAt || "Recent",
            subject: v.subject || "YouTube",
            level: v.level || "General",
            tags: v.tags || [],
            gradient: v.gradient || "from-red-600 to-rose-600",
            emoji: v.emoji || "🎥",
            youtubeUrl: v.url || v.youtubeUrl,
            thumbnail: v.thumbnail || v.image,
            description: v.description || "",
          }));
          setBackendVideos(mapped);
        } else {
          setError("Failed to fetch videos");
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect to video service");
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [search]);



  const aiRecs = allVideos
    .map(v => ({ v, score: matchScore(v, aiTopics) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(x => x.v);



  const toggleSave = (id:string) => setSaved(s => { const n = new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });

  const recentTopics = aiTopics.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* ── hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-orange-600 px-6 py-10">
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {[...Array(18)].map((_, i) => (
            <Play key={i} size={20} className="absolute text-white/10"
              style={{ top:`${Math.random()*100}%`, left:`${Math.random()*100}%` }}/>
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Play size={22} className="text-white" fill="white"/>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Learning Videos</h1>
          </div>
          <p className="text-white/75 mb-7 text-sm">Curated educational videos · Powered by your AI Mentor conversations</p>

          {/* search */}
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3 max-w-2xl mx-auto focus-within:bg-white/25 transition-all">
            <Search size={17} className="text-white/70 flex-shrink-0"/>
            <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search topics, subjects, channels…"
              className="flex-1 bg-transparent text-white placeholder:text-white/50 focus:outline-none text-sm"/>
            {search && (
              <button onClick={()=>setSearch("")} className="text-white/70 hover:text-white">
                <X size={15}/>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-5 text-white/60 text-xs">
            <span className="flex items-center gap-1.5"><Play size={11} fill="currentColor"/>{allVideos.length} curated videos</span>
            <span className="flex items-center gap-1.5"><GraduationCap size={11}/>8 subjects</span>
            <span className="flex items-center gap-1.5"><Sparkles size={11}/>AI-personalized</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ── AI Banner ── */}
        <AnimatePresence>
          {aiTopics.length > 0 && showBanner && (
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
              className="relative rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 p-5">
              <button onClick={()=>setShowBanner(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                <X size={13}/>
              </button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow shadow-indigo-500/30">
                  <Bot size={19} className="text-white"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm">Based on your AI Mentor conversations</p>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold animate-pulse">LIVE</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    You recently asked about:{" "}
                    {recentTopics.slice(0,3).map((t,i)=>(
                      <span key={t}>
                        <span className="text-indigo-400 font-medium">"{t.length>40?t.slice(0,40)+"…":t}"</span>
                        {i < Math.min(recentTopics.length,3)-1 && ", "}
                      </span>
                    ))}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentTopics.map(t=>(
                      <button key={t} onClick={()=>setSearch(t.split(" ").slice(0,3).join(" "))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 text-xs font-medium border border-indigo-500/20 transition-all">
                        <Sparkles size={10}/>{t.length>32?t.slice(0,32)+"…":t}
                      </button>
                    ))}
                    <Link to="/ai-tutor"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-all">
                      <Bot size={10}/> Open AI Mentor
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* no topics nudge */}
        {aiTopics.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Bot size={24} className="text-indigo-400"/>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Personalized recommendations await</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ask any topic in AI Mentor — matching videos will appear here instantly.</p>
            </div>
            <Link to="/ai-tutor"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600 transition-all shadow-sm shadow-indigo-500/30 flex-shrink-0">
              <Bot size={14}/> Try AI Tutor
            </Link>
          </div>
        )}

        {/* ── AI Recommended ── */}
        {aiRecs.length > 0 && !search && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow shadow-indigo-500/30">
                  <Sparkles size={17} className="text-white"/>
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">Recommended for You</h2>
                  <p className="text-xs text-muted-foreground">Matched from your AI Tutor queries</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                AI-Powered
              </span>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {aiRecs.map((v,i) => (
                <VideoCard key={v.id} video={v} saved={saved.has(v.id)} onSave={()=>toggleSave(v.id)} rank={i+1}/>
              ))}
            </motion.div>
          </section>
        )}
        {/* ── Search results ── */}
        {search && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow shadow-amber-500/30">
                <Search size={17} className="text-white"/>
              </div>
              <h2 className="font-bold text-lg">
                Search results for "{search}"
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-4 space-y-4">
                    <div className="aspect-video bg-muted rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 text-muted-foreground">
                <Search size={44} className="mx-auto mb-4 opacity-20 text-destructive"/>
                <p className="font-semibold text-destructive">{error}</p>
                <p className="text-sm mt-1">Please check your backend connection or try again.</p>
              </div>
            ) : backendVideos.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Search size={44} className="mx-auto mb-4 opacity-20"/>
                <p className="font-semibold">No videos found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <motion.div variants={stagger} initial="hidden" animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {backendVideos.map(v => (
                  <VideoCard key={v.id} video={v} saved={saved.has(v.id)} onSave={()=>toggleSave(v.id)}/>
                ))}
              </motion.div>
            )}
          </section>
        )}



        {/* ── Saved ── */}
        {saved.size > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow shadow-amber-500/30">
                <BookmarkCheck size={17} className="text-white"/>
              </div>
              <h2 className="font-bold text-lg">Saved Videos</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">{saved.size}</span>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {allVideos.filter(v=>saved.has(v.id)).map(v=>(
                <VideoCard key={v.id+"-s"} video={v} saved={true} onSave={()=>toggleSave(v.id)}/>
              ))}
            </motion.div>
          </section>
        )}

        {/* ── CTA ── */}
        <div className="rounded-3xl overflow-hidden relative">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-8">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              {[...Array(10)].map((_,i)=>(
                <Volume2 key={i} size={30} className="absolute text-white"
                  style={{top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,opacity:0.3}}/>
              ))}
            </div>
            <div className="relative flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Play size={30} className="text-white" fill="white"/>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-1">Ask AI Mentor → Get Instant Video Recommendations</h3>
                <p className="text-white/70 text-sm">Every topic you discuss in AI Tutor unlocks matching video lectures here automatically.</p>
              </div>
              <Link to="/ai-tutor"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-white/90 transition-all shadow-lg flex-shrink-0">
                <Bot size={17}/> Open AI Mentor
              </Link>
            </div>
          </div>
        </div>

        <div className="h-4"/>
      </div>
    </div>
  );
}
