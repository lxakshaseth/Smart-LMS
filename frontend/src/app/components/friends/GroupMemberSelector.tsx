import React, { useState } from "react";
import { X, Search, Check, UserPlus } from "lucide-react";
import { Button } from "../ui/button";

interface Friend {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  avatar: string;
  online?: boolean;
  statusMessage?: string;
}

interface GroupMemberSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  availableFriends: Friend[];
  existingMemberIds: string[];
  onAddMembers: (selectedIds: string[]) => Promise<void>;
}

export const GroupMemberSelector: React.FC<GroupMemberSelectorProps> = ({
  isOpen,
  onClose,
  availableFriends,
  existingMemberIds,
  onAddMembers,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Filter out friends who are already in the group
  const nonMembers = availableFriends.filter((f) => !existingMemberIds.includes(f.id));

  const filteredFriends = nonMembers.filter(
    (f) =>
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.username && f.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSubmitting(true);
      setError("");
      await onAddMembers(selectedIds);
      setSelectedIds([]);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add members");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-[#e9edef] dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#f0f2f5] dark:bg-slate-800/90 px-6 py-4 flex items-center justify-between border-b border-[#e9edef] dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <UserPlus size={20} className="text-emerald-500" />
            <h2 className="text-base font-bold text-foreground">Add Members to Group</h2>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search friends to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e9edef] dark:border-slate-700 bg-[#f9fafb] dark:bg-slate-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filteredFriends.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">
                {nonMembers.length === 0
                  ? "All your friends are already in this group!"
                  : `No friends match "${searchQuery}"`}
              </p>
            ) : (
              filteredFriends.map((friend) => {
                const isSelected = selectedIds.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    onClick={() => toggleSelect(friend.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "hover:bg-[#f0f2f5] dark:hover:bg-slate-800/80 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs">
                        {friend.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{friend.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">@{friend.username || friend.email}</p>
                      </div>
                    </div>
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

        {/* Footer */}
        <div className="bg-[#f0f2f5] dark:bg-slate-800/90 px-6 py-4 flex items-center justify-end gap-3 border-t border-[#e9edef] dark:border-slate-700/60">
          <Button variant="outline" onClick={onClose} className="text-xs rounded-xl" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isSubmitting || selectedIds.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl flex items-center gap-1.5"
          >
            {isSubmitting ? "Adding..." : `Add Selected (${selectedIds.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
};
