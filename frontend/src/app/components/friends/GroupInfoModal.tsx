import React, { useState } from "react";
import {
  X,
  Users,
  Shield,
  ShieldAlert,
  UserPlus,
  UserMinus,
  Edit2,
  Share2,
  Bell,
  BellOff,
  Pin,
  Trash2,
  LogOut,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  Check,
  Copy,
  Camera,
} from "lucide-react";
import { Button } from "../ui/button";

interface GroupMember {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  avatar: string;
  level?: number;
}

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: {
    id: string;
    groupName: string;
    groupDescription?: string;
    groupAvatar?: string;
    createdBy: string;
    admins: string[];
    members: GroupMember[];
    inviteCode?: string;
    isPinned?: boolean;
    isMuted?: boolean;
  };
  currentUserId: string;
  onUpdateGroup: (data: { groupName?: string; groupDescription?: string; groupAvatar?: string }) => Promise<void>;
  onOpenAddMembers: () => void;
  onRemoveMember: (memberId: string) => Promise<void>;
  onPromoteAdmin: (memberId: string) => Promise<void>;
  onDemoteAdmin: (memberId: string) => Promise<void>;
  onLeaveGroup: () => Promise<void>;
  onDeleteGroup: () => Promise<void>;
  onTogglePin: () => Promise<void>;
  onToggleMute: () => Promise<void>;
  groupMessages?: any[];
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  isOpen,
  onClose,
  group,
  currentUserId,
  onUpdateGroup,
  onOpenAddMembers,
  onRemoveMember,
  onPromoteAdmin,
  onDemoteAdmin,
  onLeaveGroup,
  onDeleteGroup,
  onTogglePin,
  onToggleMute,
  groupMessages = [],
}) => {
  const [activeTab, setActiveTab] = useState<"members" | "media" | "docs" | "links">("members");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group?.groupName || "");
  const [editDesc, setEditDesc] = useState(group?.groupDescription || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !group) return null;

  const isAdmin = group.admins.includes(currentUserId);
  const isCreator = group.createdBy === currentUserId;

  const filteredMembers = group.members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.username && m.username.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  // Extract shared media, docs, and links from group messages
  const mediaFiles = groupMessages.filter(
    (m) => m.isAttachment && (m.attachmentType === "image" || m.attachmentType === "video")
  );
  const docFiles = groupMessages.filter(
    (m) => m.isAttachment && (m.attachmentType === "document" || m.attachmentType === "audio")
  );
  const linkMsgs = groupMessages.filter(
    (m) => m.content && /https?:\/\/[^\s]+/.test(m.content)
  );

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/join-group/${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setError("Group name cannot be empty");
      return;
    }
    try {
      setIsSubmitting(true);
      setError("");
      await onUpdateGroup({ groupName: editName.trim(), groupDescription: editDesc.trim() });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        try {
          await onUpdateGroup({ groupAvatar: result });
        } catch {}
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-[#e9edef] dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#f0f2f5] dark:bg-slate-800/90 px-6 py-4 flex items-center justify-between border-b border-[#e9edef] dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <Users size={20} className="text-emerald-500" />
            <h2 className="text-base font-bold text-foreground">Group Info</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 text-xs text-red-500 text-center font-medium">
            {error}
          </div>
        )}

        {/* Group Hero Section */}
        <div className="p-6 bg-[#f9fafb] dark:bg-slate-850 border-b border-[#e9edef] dark:border-slate-800 flex flex-col items-center text-center relative">
          <div className="relative group mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800 overflow-hidden">
              {group.groupAvatar ? (
                <img src={group.groupAvatar} alt={group.groupName} className="w-full h-full object-cover" />
              ) : (
                <Users size={32} />
              )}
            </div>
            {isAdmin && (
              <label className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full cursor-pointer shadow hover:bg-emerald-700 transition-colors">
                <Camera size={13} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            )}
          </div>

          {isEditing ? (
            <div className="w-full space-y-2 mt-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-center px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground font-bold text-sm"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description..."
                rows={2}
                className="w-full text-center px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground text-xs resize-none"
              />
              <div className="flex justify-center gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="h-7 text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={isSubmitting} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-bold text-foreground">{group.groupName}</h3>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditName(group.groupName);
                      setEditDesc(group.groupDescription || "");
                      setIsEditing(true);
                    }}
                    className="text-muted-foreground hover:text-emerald-500 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {group.groupDescription || "No group description set."}
              </p>
              <p className="text-[11px] text-emerald-500 font-medium mt-2">
                Group • {group.members.length} Members
              </p>
            </div>
          )}

          {/* Quick Action Toggles */}
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                group.isMuted
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-muted-foreground border-slate-200 dark:border-slate-700"
              }`}
            >
              {group.isMuted ? <BellOff size={13} /> : <Bell size={13} />}
              <span>{group.isMuted ? "Muted" : "Mute"}</span>
            </button>

            <button
              onClick={onTogglePin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                group.isPinned
                  ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-muted-foreground border-slate-200 dark:border-slate-700"
              }`}
            >
              <Pin size={13} />
              <span>{group.isPinned ? "Pinned" : "Pin"}</span>
            </button>

            {group.inviteCode && (
              <button
                onClick={handleCopyInviteLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              >
                {copiedLink ? <Check size={13} /> : <Share2 size={13} />}
                <span>{copiedLink ? "Link Copied!" : "Invite Link"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e9edef] dark:border-slate-800 bg-[#f0f2f5]/50 dark:bg-slate-800/40 px-4">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
              activeTab === "members"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Members ({group.members.length})
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
              activeTab === "media"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Media ({mediaFiles.length})
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
              activeTab === "docs"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Docs ({docFiles.length})
          </button>
          <button
            onClick={() => setActiveTab("links")}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
              activeTab === "links"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Links ({linkMsgs.length})
          </button>
        </div>

        {/* Body content based on Active Tab */}
        <div className="p-5 overflow-y-auto flex-1 max-h-72">
          {activeTab === "members" && (
            <div className="space-y-4">
              {/* Member Search & Add button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#e9edef] dark:border-slate-700 bg-[#f9fafb] dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                {isAdmin && (
                  <Button
                    onClick={onOpenAddMembers}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-xl flex items-center gap-1"
                  >
                    <UserPlus size={14} />
                    <span>Add</span>
                  </Button>
                )}
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {filteredMembers.map((member) => {
                  const memberIsAdmin = group.admins.includes(member.id);
                  const memberIsCreator = group.createdBy === member.id;
                  const isSelf = member.id === currentUserId;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#f9fafb] dark:bg-slate-800/60 border border-[#e9edef] dark:border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-foreground">{member.fullName}</p>
                            {isSelf && (
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded font-medium text-slate-700 dark:text-slate-300">
                                You
                              </span>
                            )}
                            {memberIsAdmin && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                                <Shield size={9} />
                                {memberIsCreator ? "Group Creator" : "Admin"}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">@{member.username || member.email}</p>
                        </div>
                      </div>

                      {/* Admin member controls */}
                      {isAdmin && !isSelf && (
                        <div className="flex items-center gap-1">
                          {memberIsAdmin ? (
                            !memberIsCreator && (
                              <button
                                onClick={() => onDemoteAdmin(member.id)}
                                title="Dismiss as admin"
                                className="p-1 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                              >
                                <ShieldAlert size={14} />
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => onPromoteAdmin(member.id)}
                              title="Make group admin"
                              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            >
                              <Shield size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => onRemoveMember(member.id)}
                            title="Remove from group"
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <UserMinus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div>
              {mediaFiles.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">No shared photos or videos yet</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {mediaFiles.map((m, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-black">
                      {m.attachmentType === "image" ? (
                        <img src={m.fileData || m.fileUrl} alt="media" className="w-full h-full object-cover" />
                      ) : (
                        <video src={m.fileData || m.fileUrl} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "docs" && (
            <div className="space-y-2">
              {docFiles.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">No shared documents yet</p>
              ) : (
                docFiles.map((d, idx) => (
                  <a
                    key={idx}
                    href={d.fileData || d.fileUrl}
                    download={d.fileName || "document"}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f9fafb] dark:bg-slate-800/60 border border-[#e9edef] dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition"
                  >
                    <FileText size={18} className="text-emerald-500" />
                    <div className="flex-1 truncate">
                      <p className="text-xs font-semibold text-foreground truncate">{d.fileName || "File"}</p>
                      <p className="text-[10px] text-muted-foreground">{d.fileSize || "Attachment"}</p>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

          {activeTab === "links" && (
            <div className="space-y-2">
              {linkMsgs.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">No shared links yet</p>
              ) : (
                linkMsgs.map((l, idx) => {
                  const match = l.content.match(/https?:\/\/[^\s]+/);
                  const url = match ? match[0] : "#";
                  return (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f9fafb] dark:bg-slate-800/60 border border-[#e9edef] dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition"
                    >
                      <LinkIcon size={16} className="text-blue-500" />
                      <p className="text-xs text-blue-500 underline truncate">{url}</p>
                    </a>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f0f2f5] dark:bg-slate-800/90 px-6 py-4 flex items-center justify-between border-t border-[#e9edef] dark:border-slate-700/60">
          <Button
            variant="outline"
            onClick={onLeaveGroup}
            className="text-xs text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-xl flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Leave Group</span>
          </Button>

          {isAdmin && (
            <Button
              onClick={onDeleteGroup}
              className="bg-red-600 hover:bg-red-700 text-white text-xs rounded-xl flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Delete Group</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
