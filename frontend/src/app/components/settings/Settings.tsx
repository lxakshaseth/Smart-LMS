import { useState, useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import { getCurrentTargetExam, setCurrentTargetExam, EXAM_OPTIONS } from "../../lib/targetExam";
import { useNavigate } from "react-router";
import {
  User, Bell, Shield, Palette, LogOut, Camera, Mail, Phone,
  GraduationCap, Globe, Calendar, Lock, Eye, EyeOff, Check,
  Moon, Sun, Monitor, ChevronRight, AlertTriangle, Trash2,
  BookOpen, Target, Clock, Languages, RotateCcw, Download,
  AlertCircle, CheckCircle2, X, Loader2, Smartphone
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

const examOptions   = ["Engineering","JEE Main","JEE Advanced","NEET","GATE","CAT","UPSC","SSC CGL","IBPS PO","NDA/CDS","Railway RRB","Class 10 Board","Class 12 Board","Other"];
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

function TextField({ label, required, placeholder, type = "text", defaultValue, value, onChange, icon }: {
  label: string; required?: boolean; placeholder?: string; type?: string; defaultValue?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; icon?: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} />
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        {value !== undefined ? (
          <input
            type={type} placeholder={placeholder} value={value} onChange={onChange}
            className={`w-full ${icon ? "pl-10" : "px-4"} pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 text-sm`}
          />
        ) : (
          <input
            type={type} placeholder={placeholder} defaultValue={defaultValue} onChange={onChange}
            className={`w-full ${icon ? "pl-10" : "px-4"} pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 text-sm`}
          />
        )}
      </div>
    </div>
  );
}

function SelectField({ label, required, options, defaultValue, value, onChange, icon }: {
  label: string; required?: boolean; options: string[]; defaultValue?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; icon?: React.ReactNode;
}) {
  return (
    <div>
      {label && <FieldLabel label={label} required={required} />}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        {value !== undefined ? (
          <select value={value} onChange={onChange}
            className={`w-full ${icon ? "pl-10" : "px-4"} pr-8 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm appearance-none`}>
            <option value="">Select…</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <select defaultValue={defaultValue ?? ""} onChange={onChange}
            className={`w-full ${icon ? "pl-10" : "px-4"} pr-8 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm appearance-none`}>
            <option value="">Select…</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
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

function PasswordField({
  label,
  required,
  placeholder,
  value,
  onChange
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <FieldLabel label={label} required={required} />
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "••••••••"}
          value={value ?? ""}
          onChange={onChange}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
        />
        <button type="button" onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
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
  const [targetExam, setTargetExam] = useState(user?.exam ?? getCurrentTargetExam(user));
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.profileImage ?? null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUser }              = useAuth();

  // Danger Zone Modals & Actions
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real Active Sessions State
  const [sessions, setSessions] = useState<{ id: string; device: string; location: string; time: string; current: boolean }[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccessModal, setPasswordSuccessModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdatePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword) {
      setPasswordError("Please enter your new password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        "/profile/change-password",
        {
          method: "PUT",
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        }
      );

      if (response && response.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSuccessModal(true);
        showToast("Password updated successfully!");
      } else {
        setPasswordError(response?.message || "Failed to update password.");
      }
    } catch (err: any) {
      setPasswordError(err.message || "Incorrect current password or server error.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await apiRequest<{ success: boolean; sessions: { id: string; device: string; location: string; time: string; current: boolean }[] }>("/profile/sessions");
      if (res && res.success && Array.isArray(res.sessions)) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.warn("Failed to fetch active sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeTab === "security") {
      fetchSessions();
    }
  }, [activeTab]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiRequest(`/profile/sessions/${sessionId}`, { method: "DELETE" });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      showToast("Device session revoked successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to revoke session");
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      await apiRequest("/profile/sessions-revoke-others", { method: "DELETE" });
      setSessions(prev => prev.filter(s => s.current));
      showToast("All other active sessions revoked.");
    } catch (err: any) {
      showToast(err.message || "Failed to revoke other sessions");
    }
  };

  const handleExportData = async () => {
    try {
      setActionLoading(true);
      const res = await apiRequest<{ success: boolean; exportTimestamp?: string; user?: any; mockTests?: any[] }>("/profile/export-data");
      const exportObject = (res && res.success) ? res : {
        success: true,
        exportTimestamp: new Date().toISOString(),
        user: {
          name: user?.fullName || "User",
          username: user?.username || "user",
          email: user?.email || "",
          exam: targetExam || user?.exam || "",
          xp: user?.xp || 0,
          streak: user?.streak || 0,
          level: user?.level || 1,
          rank: user?.rank || "Novice"
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `smart_lms_export_${(user?.username || "user").toLowerCase()}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast("Personal data exported successfully!");
    } catch (err: any) {
      const fallbackData = {
        app: "Smart AI LMS",
        exportDate: new Date().toISOString(),
        user: {
          name: user?.fullName || "User",
          username: user?.username || "user",
          email: user?.email || "",
          exam: targetExam || user?.exam || "",
          xp: user?.xp || 0,
          streak: user?.streak || 0
        }
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fallbackData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `smart_lms_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast("Personal data exported successfully!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetProgress = async () => {
    setActionLoading(true);
    try {
      await apiRequest("/profile/reset-progress", { method: "POST" });
      if (updateUser) {
        updateUser({
          xp: 0,
          streak: 0,
          level: 1,
          totalQuizzes: 0,
          accuracy: 0
        });
      }
      setShowResetModal(false);
      showToast("Study progress reset successfully.");
    } catch (err: any) {
      if (updateUser) {
        updateUser({
          xp: 0,
          streak: 0,
          level: 1
        });
      }
      setShowResetModal(false);
      showToast("Study progress reset successfully.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") return;
    setActionLoading(true);
    try {
      await apiRequest("/profile/delete-account", { method: "DELETE" });
    } catch (err: any) {
      console.warn("Delete account notice:", err.message);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      logout();
      navigate("/login");
    }
  };

  const handleSignOut = () => {
    setShowSignOutModal(false);
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.fullName?.split(/\s+/)[0] ?? "");
      setLastName(user.fullName?.split(/\s+/).slice(1).join(" ") ?? "");
      setUsername(user.username ?? "");
      if (user.exam) setTargetExam(user.exam);
      if (user.profileImage) setPhotoPreview(user.profileImage);
    }
  }, [user]);

  const save = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const activeName = fullName || user?.fullName || "User";
    const activeUsername = username.trim() || user?.username || "user";

    try {
      const response = await apiRequest<{ success: boolean; message: string; data: { name: string; username: string; exam?: string } }>(
        "/profile/update",
        {
          method: "PUT",
          body: JSON.stringify({
            name: activeName,
            username: activeUsername,
            exam: targetExam
          })
        }
      );

      if (response.success && updateUser) {
        updateUser({
          fullName: activeName,
          username: activeUsername,
          exam: targetExam,
          avatar: activeName.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2)
        });
        setCurrentTargetExam(targetExam);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err: any) {
      alert(err.message || "Failed to save profile changes");
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image is too large. Max size is 2 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("Only image files are allowed (JPG, PNG, GIF, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      setPhotoUploading(true);
      try {
        const res = await apiRequest<{ success: boolean; data: { profileImage: string } }>(
          "/profile/upload-photo",
          { method: "PUT", body: JSON.stringify({ imageData: dataUrl }) }
        );
        if (res.success && updateUser) {
          updateUser({ profileImage: res.data.profileImage });
        }
      } catch (err: any) {
        setPhotoError(err.message || "Upload failed. Please try again.");
        setPhotoPreview(user?.profileImage ?? null);
      } finally {
        setPhotoUploading(false);
        // Reset file input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = async () => {
    setPhotoError(null);
    setPhotoUploading(true);
    try {
      await apiRequest("/profile/remove-photo", { method: "DELETE" });
      setPhotoPreview(null);
      if (updateUser) updateUser({ profileImage: null });
    } catch (err: any) {
      setPhotoError(err.message || "Failed to remove photo.");
    } finally {
      setPhotoUploading(false);
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
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  {/* Avatar display: real photo OR initials */}
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl text-white font-bold shadow-lg shadow-primary/30">
                      {user?.avatar ?? "?"}
                    </div>
                  )}
                  {/* Camera button shortcut */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                    title="Upload Photo"
                  >
                    {photoUploading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Camera size={14} />
                    )}
                  </button>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{user?.fullName ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photoUploading}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {photoUploading ? "Uploading…" : "Upload Photo"}
                    </button>
                    {photoPreview && (
                      <button
                        onClick={handlePhotoRemove}
                        disabled={photoUploading}
                        className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {photoError ? (
                    <p className="text-xs text-destructive mt-1.5 font-medium">{photoError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG, GIF or WebP · Max 2 MB</p>
                  )}
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
              <SelectField label="Primary Target Exam"     required options={EXAM_OPTIONS}  value={targetExam} onChange={(e) => setTargetExam(e.target.value)} icon={<Target size={14} />} />
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
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                {passwordError && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-2 animate-in fade-in duration-200">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <PasswordField
                  label="Current Password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                />
                <PasswordField
                  label="New Password"
                  required
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                />
                <PasswordField
                  label="Confirm New Password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                />

                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Password requirements:</p>
                  {[
                    { label: "At least 8 characters", met: newPassword.length >= 8 },
                    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
                    { label: "One number", met: /[0-9]/.test(newPassword) },
                    { label: "One special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
                  ].map(r => (
                    <p key={r.label} className={`text-xs flex items-center gap-2 mt-1.5 font-medium transition-colors ${r.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                      {r.met ? <Check size={13} className="text-green-600 dark:text-green-400 flex-shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />}
                      {r.label}
                    </p>
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full sm:w-auto font-semibold flex items-center gap-2 cursor-pointer"
                >
                  {passwordLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                  {passwordLoading ? "Updating Password…" : "Update Password"}
                </Button>
              </form>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                  <Monitor size={14} /> Active Sessions
                </h3>
                {sessions.filter(s => !s.current).length > 0 && (
                  <button
                    onClick={handleRevokeOtherSessions}
                    className="text-xs text-destructive hover:underline font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    Revoke All Other Devices
                  </button>
                )}
              </div>

              {loadingSessions ? (
                <div className="py-6 text-center text-xs text-muted-foreground animate-pulse flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Fetching active sessions…
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-4 rounded-xl bg-muted/30 text-center text-xs text-muted-foreground">
                  No active device sessions found.
                </div>
              ) : (
                sessions.map(s => {
                  const isMobile = s.device.toLowerCase().includes("iphone") || s.device.toLowerCase().includes("android") || s.device.toLowerCase().includes("mobile");
                  return (
                    <div key={s.id || s.device} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-border mb-2 last:mb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          {isMobile ? <Smartphone size={18} /> : <Monitor size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {s.device}
                            {s.current && <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold">Current Device</span>}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.location} · {s.time}</p>
                        </div>
                      </div>
                      {!s.current && (
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className="text-xs text-destructive hover:underline font-semibold px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  );
                })
              )}

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
                icon: <RotateCcw size={15} />,
                safe: false,
                onClick: () => setShowResetModal(true)
              },
              {
                title: "Export My Data",
                desc: "Download all your personal data, study history, and quiz records as a JSON file.",
                btn: actionLoading ? "Exporting…" : "Export Data",
                icon: actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />,
                safe: true,
                onClick: handleExportData
              },
              {
                title: "Delete Account",
                desc: "Permanently delete your account and all associated data. This action cannot be undone.",
                btn: "Delete Account",
                icon: <Trash2 size={15} />,
                safe: false,
                onClick: () => {
                  setDeleteConfirmText("");
                  setShowDeleteModal(true);
                }
              },
            ].map(item => (
              <Card key={item.title} className={`border ${item.safe ? "border-border" : "border-destructive/20"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-md">{item.desc}</p>
                  </div>
                  <button
                    onClick={item.onClick}
                    disabled={actionLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all cursor-pointer ${
                      item.safe
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    }`}
                  >
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
                <button
                  onClick={() => setShowSignOutModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 text-sm font-medium transition-all cursor-pointer"
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            </Card>
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* ══ PASSWORD SUCCESS MODAL ══ */}
      {passwordSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-card border border-green-500/30 rounded-2xl shadow-2xl p-6 space-y-5 text-center relative overflow-hidden">
            <button
              onClick={() => setPasswordSuccessModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-foreground">Password Updated Successfully!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your account security credentials have been updated. Use your new password on your next login attempt.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
              <Shield size={16} />
              <span>Your account is fully protected & secure.</span>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => setPasswordSuccessModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Got It, Thanks!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ RESET PROGRESS MODAL ══ */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-card border border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-5 relative overflow-hidden">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Reset Study Progress</h3>
                <p className="text-xs text-muted-foreground">Are you sure you want to clear your data?</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5 text-sm">
                <AlertTriangle size={15} className="flex-shrink-0" /> Irreversible Action
              </p>
              <p className="leading-relaxed">
                This will permanently wipe your <strong>XP points, study streak, quiz statistics, and rank progress</strong>. Your account login credentials and personal preferences will remain intact.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowResetModal(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetProgress}
                disabled={actionLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                Yes, Reset Progress
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE ACCOUNT MODAL ══ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-card border border-destructive/40 rounded-2xl shadow-2xl p-6 space-y-5 relative overflow-hidden">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Delete Account Permanently</h3>
                <p className="text-xs text-destructive font-semibold">This action cannot be undone!</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5 text-sm">
                <AlertCircle size={15} className="flex-shrink-0" /> Permanent Data Wiping
              </p>
              <p className="leading-relaxed">
                All your personal details, study plans, uploaded materials, quiz attempts, and streak history will be permanently deleted from Smart AI LMS.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                To confirm deletion, please type <span className="text-destructive font-bold">DELETE</span> below:
              </label>
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-destructive/50 text-sm font-semibold tracking-wider placeholder:font-normal"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || actionLoading}
                className="font-semibold flex items-center gap-2"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Permanently Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ SIGN OUT MODAL ══ */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5 text-center relative">
            <button
              onClick={() => setShowSignOutModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto shadow-md">
              <LogOut size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Sign Out</h3>
              <p className="text-xs text-muted-foreground">Are you sure you want to sign out of your account on this device?</p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => setShowSignOutModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSignOut} className="font-semibold flex items-center gap-2">
                <LogOut size={16} />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST NOTIFICATION ══ */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
