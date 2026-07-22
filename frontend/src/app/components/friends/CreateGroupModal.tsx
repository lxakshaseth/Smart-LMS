import React, { useState } from "react";
import { X, Search, Check, Users, ArrowRight, ArrowLeft, Image as ImageIcon, Camera } from "lucide-react";
import { Button } from "../ui/button";

interface Friend {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  avatar: string;
  online?: boolean;
  statusMessage?: string;
  level?: number;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  onCreateGroup: (groupData: {
    groupName: string;
    groupDescription: string;
    groupAvatar: string;
    memberIds: string[];
  }) => Promise<void>;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  friends,
  onCreateGroup,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Group image must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setGroupAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelectFriend = (friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.username && f.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedFriends = friends.filter((f) => selectedFriendIds.includes(f.id));

  const handleNextStep = () => {
    if (!groupName.trim()) {
      setErrorMessage("Please enter a group name");
      return;
    }
    setErrorMessage("");
    setStep(2);
  };

  const handleCreate = async () => {
    if (selectedFriendIds.length < 2) {
      setErrorMessage("Please select at least 2 friends to form a group");
      return;
    }
    if (selectedFriendIds.length > 256) {
      setErrorMessage("Maximum members allowed is 256");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await onCreateGroup({
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
        groupAvatar,
        memberIds: selectedFriendIds,
      });
      // Reset state & close
      setStep(1);
      setGroupName("");
      setGroupDescription("");
      setGroupAvatar("");
      setAvatarPreview(null);
      setSelectedFriendIds([]);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-[#e9edef] dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#f0f2f5] dark:bg-slate-800/90 px-6 py-4 flex items-center justify-between border-b border-[#e9edef] dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users size={20} className="text-emerald-500" />
                {step === 1 ? "Create New Group" : "Add Group Members"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Step {step} of 2 • {step === 1 ? "Group Details" : "Select Friends"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 text-xs text-red-500 font-medium text-center">
            {errorMessage}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            /* STEP 1: GROUP INFO */
            <div className="space-y-6">
              {/* Group Avatar Upload */}
              <div className="flex flex-col items-center justify-center">
                <label className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-2xl shadow-md overflow-hidden border-4 border-white dark:border-slate-800">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Group Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Users size={36} />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                </label>
                <span className="text-[11px] text-muted-foreground mt-2">Click to upload group icon</span>
              </div>

              {/* Group Name Input */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Study Group, Physics Squad..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e9edef] dark:border-slate-700 bg-[#f9fafb] dark:bg-slate-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                  autoFocus
                />
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Group Description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="Topic, rules, or goals for this group..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e9edef] dark:border-slate-700 bg-[#f9fafb] dark:bg-slate-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none"
                />
              </div>
            </div>
          ) : (
            /* STEP 2: SELECT MEMBERS */
            <div className="space-y-4">
              {/* Selected Friends Chips */}
              {selectedFriends.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
                    <span>Selected Members ({selectedFriends.length})</span>
                    <span className="text-[11px] text-emerald-500">Min 2 • Max 256</span>
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-[#f9fafb] dark:bg-slate-800/60 rounded-xl border border-[#e9edef] dark:border-slate-700/50">
                    {selectedFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium"
                      >
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
                          {friend.avatar}
                        </span>
                        <span>{friend.fullName}</span>
                        <button
                          onClick={() => toggleSelectFriend(friend.id)}
                          className="hover:text-red-500 transition-colors ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e9edef] dark:border-slate-700 bg-[#f9fafb] dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                />
              </div>

              {/* Friend List */}
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {filteredFriends.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">
                    No friends found matching "{searchQuery}"
                  </p>
                ) : (
                  filteredFriends.map((friend) => {
                    const isSelected = selectedFriendIds.includes(friend.id);
                    return (
                      <div
                        key={friend.id}
                        onClick={() => toggleSelectFriend(friend.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : "hover:bg-[#f0f2f5] dark:hover:bg-slate-800/80 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                            {friend.avatar}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{friend.fullName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {friend.statusMessage || `Level ${friend.level || 1}`}
                            </p>
                          </div>
                        </div>

                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f0f2f5] dark:bg-slate-800/90 px-6 py-4 flex items-center justify-end gap-3 border-t border-[#e9edef] dark:border-slate-700/60">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs rounded-xl"
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          {step === 1 ? (
            <Button
              onClick={handleNextStep}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight size={14} />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={isSubmitting || selectedFriendIds.length < 2}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              {isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <Check size={14} />
                  <span>Create Group ({selectedFriends.length + 1} Members)</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
