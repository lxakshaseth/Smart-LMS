import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Tag,
  AlignLeft,
  Bell,
  Repeat,
  Flag,
  ChevronDown,
  X,
  Check,
} from "lucide-react";

interface AddTaskPageProps {
  onBack: () => void;
  onSave: (task: NewTask) => void;
  defaultDay?: string;
}

export interface NewTask {
  title: string;
  subject: string;
  description: string;
  day: string;
  startTime: string;
  endTime: string;
  priority: "high" | "medium" | "low";
  category: string;
  reminder: string;
  repeat: string;
  tags: string[];
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const subjects = [
  "Physics", "Chemistry", "Mathematics", "Biology", "English",
  "History", "Geography", "Economics", "Computer Science", "Other",
];

const categories = [
  { label: "Study Session", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  { label: "Revision", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { label: "Practice Test", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { label: "Assignment", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
  { label: "Reading", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { label: "Lecture", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
];

const reminderOptions = ["None", "5 min before", "15 min before", "30 min before", "1 hour before", "1 day before"];
const repeatOptions = ["Never", "Daily", "Weekdays", "Weekly", "Monthly"];

const priorityConfig = {
  high: { label: "High", color: "bg-rose-500", ring: "ring-rose-400", text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20" },
  medium: { label: "Medium", color: "bg-amber-500", ring: "ring-amber-400", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  low: { label: "Low", color: "bg-green-500", ring: "ring-green-400", text: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
};

const tagSuggestions = ["JEE", "NEET", "UPSC", "Board Exam", "Mock Test", "Important", "Weak Topic", "Revision"];

export default function AddTaskPage({ onBack, onSave, defaultDay = "Monday" }: AddTaskPageProps) {
  const [form, setForm] = useState<NewTask>({
    title: "",
    subject: "",
    description: "",
    day: defaultDay,
    startTime: "09:00",
    endTime: "10:00",
    priority: "medium",
    category: "",
    reminder: "15 min before",
    repeat: "Never",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof NewTask, string>>>({});

  const set = <K extends keyof NewTask>(key: K, value: NewTask[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => set("tags", form.tags.filter((t) => t !== tag));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Task title is required";
    if (!form.subject) e.subject = "Please select a subject";
    if (!form.category) e.category = "Please select a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold leading-tight">Add New Task</h1>
              <p className="text-xs text-muted-foreground">Fill in the details below</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/30"
            >
              <Check size={16} />
              Save Task
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Task Title */}
        <Section icon={<AlignLeft size={18} />} label="Task Title" required error={errors.title}>
          <input
            type="text"
            placeholder="e.g. Review Newton's Laws of Motion"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={`w-full px-4 py-3 rounded-xl bg-muted/50 border ${errors.title ? "border-destructive" : "border-border"} focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60`}
          />
        </Section>

        {/* Subject */}
        <Section icon={<BookOpen size={18} />} label="Subject" required error={errors.subject}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => set("subject", s)}
                className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                  form.subject === s
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                    : "bg-muted/50 border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>

        {/* Description */}
        <Section icon={<AlignLeft size={18} />} label="Description" optional>
          <textarea
            rows={3}
            placeholder="Add notes or details about this task..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none placeholder:text-muted-foreground/60"
          />
        </Section>

        {/* Day & Time */}
        <Section icon={<Calendar size={18} />} label="Schedule">
          <div className="space-y-4">
            {/* Day picker */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Day of Week</p>
              <div className="flex gap-2 flex-wrap">
                {days.map((d) => (
                  <button
                    key={d}
                    onClick={() => set("day", d)}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                      form.day === d
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                        : "bg-muted/50 border-border hover:border-primary/50 hover:bg-muted"
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            {/* Time picker */}
            <div className="grid grid-cols-2 gap-4">
              <TimeField label="Start Time" value={form.startTime} onChange={(v) => set("startTime", v)} />
              <TimeField label="End Time" value={form.endTime} onChange={(v) => set("endTime", v)} />
            </div>
          </div>
        </Section>

        {/* Priority */}
        <Section icon={<Flag size={18} />} label="Priority Level">
          <div className="grid grid-cols-3 gap-3">
            {(["high", "medium", "low"] as const).map((p) => {
              const cfg = priorityConfig[p];
              const active = form.priority === p;
              return (
                <button
                  key={p}
                  onClick={() => set("priority", p)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    active ? `border-transparent ring-2 ${cfg.ring} ${cfg.bg}` : "border-border bg-muted/30 hover:bg-muted"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${cfg.color}`} />
                  <span className={`text-sm font-medium ${active ? cfg.text : "text-muted-foreground"}`}>{cfg.label}</span>
                  {active && (
                    <span className="absolute top-2 right-2">
                      <Check size={12} className={cfg.text} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Category */}
        <Section icon={<Tag size={18} />} label="Category" required error={errors.category}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((c) => (
              <button
                key={c.label}
                onClick={() => set("category", c.label)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.category === c.label
                    ? `${c.color} border-current`
                    : "bg-muted/40 border-transparent hover:border-border text-muted-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Reminder & Repeat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Section icon={<Bell size={18} />} label="Reminder">
            <SelectField
              value={form.reminder}
              options={reminderOptions}
              onChange={(v) => set("reminder", v)}
            />
          </Section>
          <Section icon={<Repeat size={18} />} label="Repeat">
            <SelectField
              value={form.repeat}
              options={repeatOptions}
              onChange={(v) => set("repeat", v)}
            />
          </Section>
        </div>

        {/* Tags */}
        <Section icon={<Tag size={18} />} label="Tags" optional>
          <div className="space-y-3">
            {/* Suggestions */}
            <div className="flex flex-wrap gap-2">
              {tagSuggestions.map((t) => (
                <button
                  key={t}
                  onClick={() => addTag(t)}
                  disabled={form.tags.includes(t)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    form.tags.includes(t)
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-muted/50 border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {form.tags.includes(t) ? <span className="flex items-center gap-1"><Check size={10} />{t}</span> : `+ ${t}`}
                </button>
              ))}
            </div>
            {/* Custom tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm placeholder:text-muted-foreground/60"
              />
              <button
                onClick={() => addTag(tagInput)}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
            {/* Active tags */}
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-destructive transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Summary card */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Check size={16} /> Task Summary
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <SummaryRow label="Title" value={form.title || "—"} />
            <SummaryRow label="Subject" value={form.subject || "—"} />
            <SummaryRow label="Day" value={form.day} />
            <SummaryRow label="Time" value={`${form.startTime} – ${form.endTime}`} />
            <SummaryRow label="Priority" value={form.priority} />
            <SummaryRow label="Category" value={form.category || "—"} />
            <SummaryRow label="Reminder" value={form.reminder} />
            <SummaryRow label="Repeat" value={form.repeat} />
          </div>
        </div>

        {/* Bottom save */}
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          Save Task
        </button>

        <div className="h-6" />
      </div>
    </div>
  );
}

function Section({
  icon, label, optional, required, error, children,
}: {
  icon: React.ReactNode;
  label: string;
  optional?: boolean;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <span className="font-semibold">{label}</span>
        {required && <span className="text-destructive text-xs">*</span>}
        {optional && <span className="text-muted-foreground text-xs">(optional)</span>}
        {error && <span className="text-destructive text-xs ml-auto">{error}</span>}
      </div>
      {children}
    </div>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2 font-medium">{label}</p>
      <div className="relative">
        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      </div>
    </div>
  );
}

function SelectField({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-9"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground min-w-[70px]">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
