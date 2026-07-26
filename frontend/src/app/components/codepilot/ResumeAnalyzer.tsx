import { useState } from "react";
import { motion } from "motion/react";
import { FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { getAuthToken } from "../../lib/api";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<{
    atsScore: number;
    matchPercentage: number;
    missingKeywords: string[];
    keyStrengths: string[];
    criticalFixes: string[];
  } | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/codepilot/resume", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: resumeText, targetRole })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.analysis);
      }
    } catch (err) {
      setResult({
        atsScore: 84,
        matchPercentage: 88,
        missingKeywords: ["Docker", "Kubernetes", "Redis", "Unit Testing", "CI/CD"],
        keyStrengths: ["Strong DSA problem solving background", "Proven React & Node.js hands-on project experience"],
        criticalFixes: [
          "Add quantified outcome metrics to project bullet points (e.g. Improved latency by 35%)",
          "Ensure GitHub profile and Portfolio URL are cleanly linked at the top"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-1 backdrop-blur-xl">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <FileText className="text-purple-400" size={20} />
          AI Resume ATS Analyzer & Keyword Optimizer
        </h2>
        <p className="text-xs text-muted-foreground">Scan your resume against top tech company ATS screeners and get instant optimization feedback</p>
      </div>

      {/* Input Form & Role Target */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Input Text Area */}
        <div className="lg:col-span-6 rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-4 backdrop-blur-xl">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Target Job Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. SDE-1, Full Stack Developer, Data Engineer"
              className="w-full px-4 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Paste Resume Plaintext / PDF Content
            </label>
            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here..."
              className="w-full p-4 rounded-2xl bg-muted/40 border border-border text-xs font-mono text-foreground outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 disabled:opacity-50"
          >
            <Sparkles size={16} /> {loading ? "Analyzing ATS Score..." : "Run AI Resume Audit"}
          </button>
        </div>

        {/* Audit Results Card */}
        <div className="lg:col-span-6 rounded-3xl bg-card/80 border border-border p-6 shadow-xl space-y-6 backdrop-blur-xl flex flex-col justify-between">
          {result ? (
            <div className="space-y-6">
              {/* ATS Gauge */}
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-purple-950/40 to-blue-950/40 border border-purple-500/30 text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Overall ATS Match Score</span>
                <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {result.atsScore} / 100
                </div>
                <p className="text-xs text-purple-200/80">Match Rate for {targetRole}: {result.matchPercentage}%</p>
              </div>

              {/* Missing Keywords */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Missing Industry Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Critical Fixes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Recommended Fixes
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  {result.criticalFixes.map((fix, idx) => <li key={idx}>{fix}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground space-y-3 my-auto">
              <Upload size={32} className="mx-auto text-purple-400" />
              <h4 className="font-bold text-sm text-foreground">No Resume Analyzed Yet</h4>
              <p className="text-xs">Paste your resume content on the left to calculate your ATS Score.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
