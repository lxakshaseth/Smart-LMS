import React from "react";
import { Sparkles, Target, Brain, ArrowRight } from "lucide-react";

interface RecommendationPanelProps {
  targetExam: string;
  weakSubject: string;
  recommendedQueries: string[];
  onSelectQuery: (query: string) => void;
}

export default function RecommendationPanel({
  targetExam,
  weakSubject,
  recommendedQueries,
  onSelectQuery
}: RecommendationPanelProps) {
  return (
    <div className="max-w-7xl mx-auto my-4 p-5 rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-secondary/15 border border-primary/20 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary animate-pulse" />
            <h2 className="font-bold text-base text-foreground">AI Personalized Learning Path</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Curated YouTube courses tailored for <span className="font-semibold text-primary">{targetExam}</span>
            {weakSubject && weakSubject !== "None" && (
              <> & strengthening weak areas in <span className="font-semibold text-destructive">{weakSubject}</span></>
            )}
          </p>
        </div>

        {/* Query Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {recommendedQueries.slice(0, 4).map((queryStr, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuery(queryStr)}
              className="px-3 py-1.5 rounded-xl bg-card border border-primary/20 hover:border-primary text-foreground hover:bg-primary hover:text-primary-foreground text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer group"
            >
              <span>{queryStr}</span>
              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
