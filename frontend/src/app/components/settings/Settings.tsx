import { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import { useNavigate } from "react-router";
import {
  User, Bell, Shield, Palette, LogOut, Camera, Mail, Phone,
  GraduationCap, Globe, Calendar, Lock, Eye, EyeOff, Check,
  Moon, Sun, Monitor, ChevronRight, AlertTriangle, Trash2,
  BookOpen, Target, Clock, Languages,
} from "lucide-react";

type Tab = "profile" | "academic" | "notifications" | "appearance" | "security" | "danger";

const tabs: { key: Tab; label: string; icon: React.ReactNode; danger?: boolean }[] = [
  { key: "profile",       label: "Profile",        icon: <User size={15} /> },
  { key: "academic",      label: "Academic",        icon: <GraduationCap size={15} /> },
  { key: "notifications", label: "Notifications",   icon: <Bell size={15} /> },
  { key: "appearance",    label: "Appearance",      icon: <Palette size={15} /> },
  { key: "security",      label: "Security",        icon: <Shield size={15} /> },
  { key: "danger",        label: "Danger Zone",     icon: <AlertTriangle size={15} />, danger: true },
];

const examOptions   = ["JEE Main","JEE Advanced","NEET","GATE","CAT","UPSC","SSC CGL","IBPS PO","NDA/CDS","Railway RRB","Class 10 Board","Class 12 Board","Other"];
const classOptions  = ["Nursery","LKG","UKG","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12","Graduated"];
const boardOptions  = ["CBSE","ICSE","State Board","IB","IGCSE","Other"];
const languageOpts  = ["English","Hindi","Tamil","Telugu","Kannada","Marathi","Bengali","Gujarati"];
const studyHours    = ["1 hour","2 hours","3 hours","4 hours","5 hours","6+ hours"];
const timezones     = ["IST (UTC+5:30)","EST (UTC-5)","PST (UTC-8)","GMT (UTC+0)","CST (UTC+6)"];

/* ── small helpers ── */
function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium mb-1.5">
      {label}{required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

function TextField({ label, required, type = "text", placeholder, defaultValue, icon }: {
  label: string; required?: boolean; type?: string; placeholder?: string; defaultValue?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      {label && <FieldLabel label={label} required={required} />}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          type={type} placeholder={placeholder} defaultValue={defaultValue}
          className={`w-full ${icon ? "pl-10" : "px-4"} pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 text-sm`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, required, options, defaultValue, icon }: {
  label: string; required?: boolean; options: string[]; defaultValue?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      {label && <FieldLabel label={label} required={required} />}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <select defaultValue={defaultValue}
          className={`w-full ${icon ? "pl-10" : "px-4"} pr-8 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm appearance-none`}>
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground rotate-90 pointer-events-none" />
      </div>
    </div>
  );
}

function ToggleRow({ label, description, defaultChecked }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button onClick={() => setOn(v => !v)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${on ? "bg-primary" : "bg-muted-foreground/30"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function PasswordField({ label, required, placeholder }: { label: string; required?: boolean; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <FieldLabel label={label} required={required} />
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type={show ? "text" : "password"} placeholder={placeholder ?? "••••••••"}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm" />
        <button type="button" onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function GroupLabel({ label }: { label: string }) {
  return <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">{label}</p>;
}

/* ─────────────── main ─────────────── */
export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { logout, user }       = useAuth();
  const navigate               = useNavigate();
  const [activeTab, setActiveTab]   = useState<Tab>("profile");
  const [themeMode, setThemeMode]   = useState<"light"|"dark"|"system">(theme === "light" ? "light" : "dark");
  const [saved, setSaved]           = useState(false);
  const [accentIdx, setAccentIdx]   = useState(0);
  const [fontSize, setFontSize]     = useState("Medium");

  const [firstName, setFirstName]   = useState(user?.fullName?.split(/\s+/)[0] ?? "");
  const [lastName, setLastName]     = useState(user?.fullName?.split(/\s+/).slice(1).join(" ") ?? "");
  const [username, setUsername]     = useState(user?.username ?? "");
  const { updateUser }              = useAuth();

  useEffect(() => {
    if (user) {
      setFirstName(user.fullName?.split(/\s+/)[0] ?? "");
      setLastName(user.fullName?.split(/\s+/).slice(1).join(" ") ?? "");
      setUsername(user.username ?? "");
    }
  }, [user]);

  const save = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || !username.trim()) return;

    try {
      const response = await apiRequest<{ success: boolean; message: string; data: { name: string; username: string } }>(
        "/profile/update",
        {
          method: "PUT",
          body: JSON.stringify({
            name: fullName,
            username: username.trim()
          })
        }
      );

      if (response.success && updateUser) {
        updateUser({
          fullName,
          username: username.trim(),
          avatar: fullName.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2)
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err: any) {
      alert(err.message || "Failed to save profile changes");
    }
  };

  const SaveBtn = ({ label = "Save Changes" }: { label?: string }) => (
    <Button onClick={save}>
      {saved ? <><Check size={15} className="mr-2" />Saved!</> : label}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ── top sticky settings navbar ── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        {/* page title row */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your account, preferences and security &nbsp;·&nbsp;
              Fields marked <span className="text-destructive font-bold">*</span> are required
            </p>
          </div>
          <SaveBtn />
        </div>

        {/* tab strip — no scroll, wraps cleanly */}
        <div className="flex flex-wrap gap-1 px-6 pb-px">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg
                ${activeTab === t.key
                  ? t.danger
                    ? "text-destructive border-b-2 border-destructive bg-destructive/5"
                    : "text-primary border-b-2 border-primary bg-primary/5"
                  : t.danger
                    ? "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
            >
              {t.icon}
              {t.label}
              {t.key === "notifications" && (
                <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-2 right-2" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── content ── */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ══ PROFILE ══ */}
        {activeTab === "profile" && (
          <>
            {/* avatar card */}
            <Card>
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl text-white font-bold shadow-lg shadow-primary/30">
                    {user?.avatar ?? "?"}
                  </div>
                  <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                    <Camera size={14} />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{user?.fullName ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Upload Photo</button>
                    <button className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs hover:bg-muted/80 transition-colors">Remove</button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or GIF · Max 2 MB</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                  </span>
                  <span className="text-xs text-muted-foreground">Member since Jun 2025</span>
                </div>
              </div>
            </Card>

            {/* personal info */}
            <Card>
              <h3 className="font-semibold mb-5 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <User size={14} /> Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel label="First Name" required />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><User size={14} /></span>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel label="Last Name" required />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><User size={14} /></span>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel label="Username" required />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><User size={14} /></span>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                    />
                  </div>
                </div>

                <TextField label="Email Address"  required type="email" placeholder="you@example.com" defaultValue={user?.email ?? ""}   icon={<Mail size={14} />} />
                <TextField label="Phone Number"   required type="tel"   placeholder="+91 9876543210"   defaultValue={user?.phone ?? ""}   icon={<Phone size={14} />} />
                <TextField label="Date of Birth"  required type="date"  defaultValue=""                icon={<Calendar size={14} />} />
                <SelectField label="Gender"       required options={["Male","Female","Non-binary","Prefer not to say"]} defaultValue="" />
                <div className="sm:col-span-2">
                  <TextField label="City / Location" required placeholder="e.g. Mumbai, Maharashtra" defaultValue="" icon={<Globe size={14} />} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel label="Bio" />
                  <textarea rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none placeholder:text-muted-foreground/50"
                    defaultValue="" placeholder="Tell us about yourself and your study goals…" />
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                <SaveBtn /> <Button variant="ghost">Reset</Button>
              </div>
            </Card>
          </>
        )}

        {/* ══ ACADEMIC ══ */}
        {activeTab === "academic" && (
          <Card>
            <h3 className="font-semibold mb-5 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
              <GraduationCap size={14} /> Academic Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Current Class / Level"   required options={classOptions}  defaultValue=""             icon={<GraduationCap size={14} />} />
              <SelectField label="School / College Board"  required options={boardOptions}  defaultValue=""             icon={<BookOpen size={14} />} />
              <SelectField label="Primary Target Exam"     required options={examOptions}   defaultValue={user?.exam ?? ""} icon={<Target size={14} />} />
              <SelectField label="Secondary Target Exam"            options={examOptions}   defaultValue={user?.exam ?? ""} icon={<Target size={14} />} />
              <TextField   label="School / Institution Name" required placeholder="e.g. Delhi Public School" defaultValue="" icon={<BookOpen size={14} />} />
              <SelectField label="Daily Study Goal"        required options={studyHours}    defaultValue=""             icon={<Clock size={14} />} />
              <SelectField label="Preferred Language"      required options={languageOpts}  defaultValue="English"      icon={<Languages size={14} />} />
              <SelectField label="Timezone"                required options={timezones}     defaultValue="IST (UTC+5:30)" icon={<Globe size={14} />} />
              <div className="sm:col-span-2">
                <FieldLabel label="Weak Subjects / Topics" />
                <textarea rows={2} placeholder="e.g. Organic Chemistry, Integration, Modern Physics..."
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
                  defaultValue="Organic Chemistry, Integration" />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel label="Strong Subjects / Topics" />
                <textarea rows={2} placeholder="e.g. Mechanics, Algebra, Cell Biology..."
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
                  defaultValue="Mechanics, Algebra" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              <SaveBtn label="Save Preferences" /> <Button variant="ghost">Reset</Button>
            </div>
          </Card>
        )}

        {/* ══ NOTIFICATIONS ══ */}
        {activeTab === "notifications" && (
          <Card>
            <h3 className="font-semibold mb-5 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
              <Bell size={14} /> Notification Preferences
            </h3>

            <div className="mb-6">
              <GroupLabel label="Study Reminders" />
              <ToggleRow label="Daily Study Reminders *"  description="Remind you to complete your daily study goal"          defaultChecked={true} />
              <ToggleRow label="Session Start Alerts *"   description="Notify 5 minutes before a scheduled session starts"   defaultChecked={true} />
              <ToggleRow label="Break Reminders"          description="Suggest breaks every 45 minutes of study"              defaultChecked={false} />
            </div>

            <div className="mb-6">
              <GroupLabel label="AI & Quiz" />
              <ToggleRow label="Quiz Recommendations *"   description="AI-curated quiz suggestions based on weak areas"       defaultChecked={true} />
              <ToggleRow label="AI Tutor Suggestions"     description="Smart study tips from your AI tutor"                   defaultChecked={true} />
              <ToggleRow label="New Practice Tests"       description="Alert when new tests are added for your exam"          defaultChecked={false} />
            </div>

            <div className="mb-6">
              <GroupLabel label="Progress & Achievements" />
              <ToggleRow label="Weekly Progress Reports *" description="Summary of your performance every Sunday"             defaultChecked={true} />
              <ToggleRow label="Achievement & Badge Alerts" description="Celebrate milestones and study streaks"              defaultChecked={true} />
              <ToggleRow label="Streak Warnings"           description="Alert before your study streak breaks"                defaultChecked={true} />
              <ToggleRow label="Accuracy Drop Alerts"      description="Notify when accuracy drops below 70%"                 defaultChecked={false} />
            </div>

            <div className="mb-6">
              <GroupLabel label="Platform & System" />
              <ToggleRow label="Email Notifications"      description="Receive important updates via email"                   defaultChecked={true} />
              <ToggleRow label="Push Notifications"       description="Browser / app push notifications"                     defaultChecked={false} />
              <ToggleRow label="Product Updates & News"   description="New features, improvements and announcements"         defaultChecked={false} />
            </div>

            <div className="pt-4 border-t border-border">
              <SaveBtn label="Save Notification Settings" />
            </div>
          </Card>
        )}

        {/* ══ APPEARANCE ══ */}
        {activeTab === "appearance" && (
          <div className="space-y-5">
            {/* theme */}
            <Card>
              <h3 className="font-semibold mb-5 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <Palette size={14} /> Theme & Display
              </h3>
              <div className="space-y-6">
                <div>
                  <FieldLabel label="Theme Mode" required />
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { key: "light",  label: "Light",  icon: <Sun size={22} /> },
                      { key: "dark",   label: "Dark",   icon: <Moon size={22} /> },
                      { key: "system", label: "System", icon: <Monitor size={22} /> },
                    ] as const).map(t => (
                      <button key={t.key}
                        onClick={() => { setThemeMode(t.key); if (t.key !== "system" && t.key !== theme) toggleTheme(); }}
                        className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                          themeMode === t.key
                            ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:border-muted-foreground/30"
                        }`}>
                        {t.icon}
                        <span className="text-sm font-medium">{t.label}</span>
                        {themeMode === t.key && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel label="Accent Color" required />
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { name: "Indigo", tw: "bg-indigo-500", ring: "ring-indigo-500" },
                      { name: "Violet", tw: "bg-violet-500", ring: "ring-violet-500" },
                      { name: "Blue",   tw: "bg-blue-500",   ring: "ring-blue-500"   },
                      { name: "Green",  tw: "bg-green-500",  ring: "ring-green-500"  },
                      { name: "Rose",   tw: "bg-rose-500",   ring: "ring-rose-500"   },
                      { name: "Amber",  tw: "bg-amber-500",  ring: "ring-amber-500"  },
                    ].map((c, i) => (
                      <button key={c.name} onClick={() => setAccentIdx(i)} title={c.name}
                        className={`w-9 h-9 rounded-full ${c.tw} transition-all hover:scale-110 ${accentIdx === i ? `ring-2 ring-offset-2 ${c.ring} scale-110` : ""}`} />
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel label="Font Size" required />
                  <div className="grid grid-cols-3 gap-3">
                    {["Small","Medium","Large"].map(s => (
                      <button key={s} onClick={() => setFontSize(s)}
                        className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          fontSize === s
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <SelectField label="Interface Language" required options={languageOpts} defaultValue="English" icon={<Languages size={14} />} />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <Monitor size={14} /> Layout & Effects
              </h3>
              <ToggleRow label="Compact Mode"             description="Reduce spacing for a denser layout"              defaultChecked={false} />
              <ToggleRow label="Animations & Transitions" description="Smooth animations across the app"                defaultChecked={true} />
              <ToggleRow label="Glassmorphism Effects"    description="Frosted glass UI on cards and modals"            defaultChecked={true} />
              <ToggleRow label="Sidebar Collapsed"        description="Start with the sidebar minimized"                defaultChecked={false} />
              <div className="pt-5 border-t border-border mt-2">
                <SaveBtn label="Save Appearance" />
              </div>
            </Card>
          </div>
        )}

        {/* ══ SECURITY ══ */}
        {activeTab === "security" && (
          <div className="space-y-5">
            <Card>
              <h3 className="font-semibold mb-5 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <Lock size={14} /> Change Password
              </h3>
              <div className="space-y-4 max-w-md">
                <PasswordField label="Current Password"      required placeholder="Enter current password" />
                <PasswordField label="New Password"          required placeholder="Min. 8 characters" />
                <PasswordField label="Confirm New Password"  required placeholder="Re-enter new password" />
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Password must contain:</p>
                  {["At least 8 characters","One uppercase letter","One number","One special character"].map(r => (
                    <p key={r} className="text-xs text-muted-foreground flex items-center gap-2 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />{r}
                    </p>
                  ))}
                </div>
                <Button variant="secondary">Update Password</Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <Shield size={14} /> Security Settings
              </h3>
              <ToggleRow label="Two-Factor Authentication *" description="Add an extra layer of security to your account" defaultChecked={false} />
              <ToggleRow label="Login Alerts"                description="Get notified of new sign-ins via email"         defaultChecked={true} />
              <ToggleRow label="Session Timeout"             description="Auto logout after 30 min of inactivity"        defaultChecked={true} />
            </Card>

            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <Monitor size={14} /> Active Sessions
              </h3>
              {[
                { device: "Chrome – Windows 11", location: "Mumbai, IN", time: "Now",          current: true },
                { device: "Safari – iPhone 15",  location: "Mumbai, IN", time: "2 hours ago",  current: false },
              ].map(s => (
                <div key={s.device} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-border mb-2 last:mb-0">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {s.device}
                      {s.current && <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">Current</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.location} · {s.time}</p>
                  </div>
                  {!s.current && <button className="text-xs text-destructive hover:underline font-medium px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors">Revoke</button>}
                </div>
              ))}
              <div className="pt-5 border-t border-border mt-4">
                <SaveBtn label="Save Security Settings" />
              </div>
            </Card>
          </div>
        )}

        {/* ══ DANGER ZONE ══ */}
        {activeTab === "danger" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <AlertTriangle size={18} className="text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">
                These actions are <strong>irreversible</strong>. Please read carefully before proceeding.
              </p>
            </div>

            {[
              {
                title: "Reset Study Progress",
                desc: "Clear all quiz scores, study streaks, progress data and analytics. Your account and settings remain intact.",
                btn: "Reset Progress",
                icon: <Clock size={15} />,
                safe: false,
              },
              {
                title: "Export My Data",
                desc: "Download all your personal data, study history, and quiz records as a JSON file.",
                btn: "Export Data",
                icon: <ChevronRight size={15} />,
                safe: true,
              },
              {
                title: "Delete Account",
                desc: "Permanently delete your account and all associated data. This action cannot be undone.",
                btn: "Delete Account",
                icon: <Trash2 size={15} />,
                safe: false,
              },
            ].map(item => (
              <Card key={item.title} className={`border ${item.safe ? "border-border" : "border-destructive/20"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-md">{item.desc}</p>
                  </div>
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    item.safe
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  }`}>
                    {item.icon} {item.btn}
                  </button>
                </div>
              </Card>
            ))}

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Sign Out</p>
                  <p className="text-sm text-muted-foreground mt-1">Sign out of your account on this device.</p>
                </div>
                <button onClick={() => { logout(); navigate("/login"); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 text-sm font-medium transition-all">
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            </Card>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}
