import React from "react";
import { Copy } from "lucide-react";

/**
 * Universal, rich markdown renderer utility for rendering bold target exams as highlighted badges,
 * code blocks, callouts, tables, quotes, lists, headings, and clean styled text.
 */
export function renderMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  const inlineFormat = (raw: string, key: string | number): React.ReactNode => {
    // Split on code spans, bold (** or __), italic (* or _), etc.
    const parts = raw.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_)/g);
    return (
      <span key={key}>
        {parts.map((p, pi) => {
          if (p.startsWith("**") && p.endsWith("**")) {
            return (
              <strong
                key={pi}
                className="font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-md border border-primary/20 shadow-xs inline-block my-0.5"
              >
                {p.slice(2, -2)}
              </strong>
            );
          }
          if (p.startsWith("*") && p.endsWith("*")) {
            return <em key={pi} className="italic">{p.slice(1, -1)}</em>;
          }
          if (p.startsWith("__") && p.endsWith("__")) {
            return (
              <strong
                key={pi}
                className="font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-md border border-primary/20 shadow-xs inline-block my-0.5"
              >
                {p.slice(2, -2)}
              </strong>
            );
          }
          if (p.startsWith("_") && p.endsWith("_")) {
            return <em key={pi} className="italic">{p.slice(1, -1)}</em>;
          }
          if (p.startsWith("`") && p.endsWith("`")) {
            return (
              <code key={pi} className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-xs font-mono text-primary">
                {p.slice(1, -1)}
              </code>
            );
          }
          return p;
        })}
      </span>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <div key={i} className="my-3 rounded-xl overflow-hidden border border-border shadow-sm">
          {lang && (
            <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border">
              <span className="text-xs font-mono text-muted-foreground font-medium">{lang}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeLines.join("\n"))}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
          )}
          <pre className="p-4 overflow-x-auto bg-[#0d1117] text-[#e6edf3] text-xs leading-relaxed font-mono">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      nodes.push(<h1 key={i} className="text-xl font-bold mt-4 mb-2 text-foreground">{inlineFormat(line.slice(2), i)}</h1>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(<h2 key={i} className="text-base font-bold mt-4 mb-1.5 text-foreground border-b border-border pb-1">{inlineFormat(line.slice(3), i)}</h2>);
      i++; continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={i} className="text-sm font-semibold mt-3 mb-1 text-foreground">{inlineFormat(line.slice(4), i)}</h3>);
      i++; continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} className="my-3 border-border" />);
      i++; continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      nodes.push(
        <blockquote key={i} className="my-2 pl-4 border-l-4 border-primary/50 text-muted-foreground italic text-xs">
          {inlineFormat(line.slice(2), i)}
        </blockquote>
      );
      i++; continue;
    }

    // Unordered list
    if (/^[-*•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s/, ""));
        i++;
      }
      nodes.push(
        <ul key={i} className="my-2 space-y-1.5 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>{inlineFormat(item, ii)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      let startN = 1;
      const match = line.match(/^(\d+)\./);
      if (match) startN = parseInt(match[1]);
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push(
        <ol key={i} className="my-2 space-y-1.5 pl-1" start={startN}>
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                {startN + ii}
              </span>
              <span>{inlineFormat(item, ii)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Table
    if (line.includes("|") && lines[i + 1]?.includes("---")) {
      const headers = line.split("|").map(h => h.trim()).filter(Boolean);
      i += 2; // skip separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map(c => c.trim()).filter(Boolean));
        i++;
      }
      nodes.push(
        <div key={i} className="my-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/80">
                {headers.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 text-left font-semibold border-b border-border text-foreground">
                    {inlineFormat(h, hi)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-transparent" : "bg-muted/20"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-1.5 border-b border-border/50">
                      {inlineFormat(cell, ci)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Callout boxes :::note :::tip :::warning
    if (line.startsWith(":::")) {
      const kind = line.slice(3).trim();
      const calloutLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(":::")) {
        calloutLines.push(lines[i]);
        i++;
      }
      const styles: Record<string, string> = {
        note:    "bg-blue-500/10 border-blue-500/30 text-blue-400",
        tip:     "bg-green-500/10 border-green-500/30 text-green-400",
        warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        info:    "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
      };
      const labels: Record<string, string> = { note:"📝 Note", tip:"💡 Tip", warning:"⚠️ Warning", info:"ℹ️ Info" };
      nodes.push(
        <div key={i} className={`my-3 rounded-xl border p-3 ${styles[kind] ?? styles.info}`}>
          <p className="text-xs font-bold mb-1">{labels[kind] ?? kind}</p>
          <div className="text-xs text-foreground/80">{calloutLines.join("\n")}</div>
        </div>
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      nodes.push(<div key={i} className="h-2" />);
      i++; continue;
    }

    // Regular paragraph
    nodes.push(
      <p key={i} className="text-xs leading-relaxed my-0.5">
        {inlineFormat(line, i)}
      </p>
    );
    i++;
  }

  return nodes;
}
