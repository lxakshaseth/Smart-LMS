import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Phone, Video, Search, Send, Paperclip, Smile,
  CheckCheck, ArrowUpRight, ArrowDownLeft, PhoneOff, Mic, MicOff, 
  VideoOff, Users, Volume2, Shield, Clock, Award, Sparkles,
  MoreVertical, FileText, Image as ImageIcon, User, Headphones, Trash2, Check, X, Download, Heart, UserCheck,
  ChevronLeft, Plus, Pin, BellOff, Info, Share2, CornerUpLeft, Forward, Camera
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import { io, Socket } from "socket.io-client";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

import { CreateGroupModal } from "./CreateGroupModal";
import { GroupInfoModal } from "./GroupInfoModal";
import { MessageInfoModal } from "./MessageInfoModal";
import { GroupMemberSelector } from "./GroupMemberSelector";
import { useFriendsPolling } from "../../hooks/useFriendsPolling";

// Audio Ringtone Helper
class RingtoneGenerator {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;

  startRinging() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = () => {
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc2.frequency.setValueAtTime(480, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime + 1.8);
        gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2.0);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc1.start();
        osc2.start();

        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch {}
        }, 2200);
      };

      playBeep();
      this.intervalId = window.setInterval(playBeep, 4000);
    } catch (e) {
      console.warn("Ringtone error:", e);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

interface Friend {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  phone: string;
  avatar: string;
  isMock: boolean;
  online: boolean;
  statusMessage: string;
  level: number;
}

interface GroupMember {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  avatar: string;
  level?: number;
}

interface Group {
  id: string;
  groupName: string;
  groupDescription?: string;
  groupAvatar?: string;
  createdBy: string;
  admins: string[];
  members: GroupMember[];
  inviteCode?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isGroup: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  unreadCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  isAttachment?: boolean;
  attachmentType?: "document" | "image" | "video" | "contact" | "audio";
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  fileData?: string;
  fileUrl?: string;
  audioDuration?: number;
  blobUrl?: string;
}

interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  messageType?: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  isAttachment?: boolean;
  attachmentType?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  fileData?: string;
  fileUrl?: string;
  audioDuration?: number;
  replyTo?: any;
  reactions?: { user: string; emoji: string }[];
  isDeleted?: boolean;
  isPinned?: boolean;
}

interface CallLog {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  type: "voice" | "video";
  direction: "incoming" | "outgoing" | "missed";
  timestamp: string;
  duration?: number;
}

export default function Friends() {
  const { user, updateUser } = useAuth();
  
  // WhatsApp Mode tabs: "chats" | "calls"
  const [activeTab, setActiveTab] = useState<"chats" | "calls">("chats");
  
  // Base lists
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Active Chat Selection (Either Friend or Group)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  // Chats Data state
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [groupMessages, setGroupMessages] = useState<Record<string, GroupMessage[]>>({});
  const [directUnread, setDirectUnread] = useState<Record<string, number>>({});
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [groupTypingUsers, setGroupTypingUsers] = useState<Record<string, string[]>>({});

  // Group Modals State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showMessageInfoModal, setShowMessageInfoModal] = useState(false);
  const [selectedMsgForInfo, setSelectedMsgForInfo] = useState<GroupMessage | null>(null);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  // Call Logs state
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  // Friends adding states
  const [addedFriendIds, setAddedFriendIds] = useState<string[]>([]);
  const [addUsernameInput, setAddUsernameInput] = useState("");
  const [addFriendStatus, setAddFriendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [addingFriend, setAddingFriend] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [searchingSuggestions, setSearchingSuggestions] = useState(false);

  // Overlays / Popover state managers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showChatMoreMenu, setShowChatMoreMenu] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showShareFriendModal, setShowShareFriendModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  // Count of unread pending requests detected by polling (used for badge)
  const [pollPendingCount, setPollPendingCount] = useState(0);
  const [showFriendListModal, setShowFriendListModal] = useState(false);

  // Profile / Partner Name Edit States
  const [showEditMyNameModal, setShowEditMyNameModal] = useState(false);
  const [myNewName, setMyNewName] = useState("");
  const [showEditPartnerModal, setShowEditPartnerModal] = useState(false);
  const [partnerNewName, setPartnerNewName] = useState("");

  // Calling overlay states
  const [callState, setCallState] = useState<"idle" | "incoming" | "outgoing" | "connected">("idle");
  const [activeCallFriend, setActiveCallFriend] = useState<Friend | null>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [useSimulatedStream, setUseSimulatedStream] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // WebRTC & Socket refs
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const ringtoneRef = useRef<RingtoneGenerator | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const offlineCallTimeoutRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  // Voice recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingDurationRef = useRef(0);

  // File picker refs
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  // Polling refs — updated every time the corresponding state changes
  // Using refs here avoids stale closures inside the polling hook
  const selectedFriendIdRef = useRef<string | null>(null);
  const selectedGroupIdRef = useRef<string | null>(null);

  const EMOJIS = ["😊", "👍", "👋", "📖", "✍️", "🧠", "⚡", "🚀", "💻", "🎓", "🧪", "📚", "🏆", "🔥", "🎉", "👏", "💡", "😅"];

  const safeSaveChatMessages = (email: string, updatedMessages: Record<string, Message[]>) => {
    try {
      localStorage.setItem(`lms_chat_messages_${email}`, JSON.stringify(updatedMessages));
    } catch (e) {
      console.warn("Storage quota limit reached for session storage.", e);
    }
  };

  // Load Message history, Call logs & Groups
  useEffect(() => {
    if (!user?.email) return;

    const savedIds = localStorage.getItem(`lms_added_friends_${user.email}`);
    if (savedIds) {
      try { setAddedFriendIds(JSON.parse(savedIds)); } catch (e) {}
    }

    const savedMessages = localStorage.getItem(`lms_chat_messages_${user.email}`);
    if (savedMessages) {
      try { setMessages(JSON.parse(savedMessages)); } catch (e) {}
    }

    const savedCalls = localStorage.getItem(`lms_call_logs_${user.email}`);
    if (savedCalls) {
      try { setCallLogs(JSON.parse(savedCalls)); } catch (e) {}
    }
  }, [user]);

  // Fetch Friends, Groups, and Pending Requests
  useEffect(() => {
    fetchFriends();
    fetchGroups();
    fetchPendingRequests();
    ringtoneRef.current = new RingtoneGenerator();

    const getSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL.trim();
      }
      const apiUrl = (import.meta.env.VITE_API_URL || "").trim();
      if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
        return apiUrl.replace(/\/api\/?$/, "");
      }
      if (typeof window !== "undefined") {
        const host = window.location.hostname;
        if (host === "localhost" || host === "127.0.0.1") {
          return "http://localhost:5000";
        }
      }
      return "http://localhost:5000";
    };

    const socketUrl = getSocketUrl();
    console.log("🔌 [SOCKET] Connecting to Socket.IO URL:", socketUrl);
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 [SOCKET] Connected successfully! Socket ID:", socket.id);
      if (user?.id) {
        socket.emit("register-user", user.id);
      }
    });

    socket.on("user-status-change", ({ userId, online }: { userId: string; online: boolean }) => {
      setFriends(prev => prev.map(friend => friend.id === userId ? { ...friend, online } : friend));
    });

    // 1-to-1 Private Message listener
    socket.on("receive-message", (msgData: any) => {
      const { id, from, content, timestamp, isAttachment, attachmentType, fileName, fileSize, fileMimeType, fileData, fileUrl, audioDuration } = msgData;
      setAddedFriendIds(prev => prev.includes(from) ? prev : [...prev, from]);

      const newMsg: Message = {
        id: id || Math.random().toString(36).substring(7),
        senderId: from,
        receiverId: user?.id || "",
        content,
        timestamp: timestamp || new Date().toISOString(),
        status: "sent",  // Receiver's copy starts at "sent"; sender gets status upgrades separately
        ...(isAttachment && { isAttachment: true, attachmentType, fileName, fileSize, fileMimeType, fileData, fileUrl, audioDuration }),
      };

      setMessages(prev => {
        const list = prev[from] || [];
        const isDuplicate = list.some(m => m.id === newMsg.id || (m.content === newMsg.content && Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 5000));
        if (isDuplicate) return prev;
        const updated = { ...prev, [from]: [...list, newMsg] };
        if (user?.email) safeSaveChatMessages(user.email, updated);
        return updated;
      });

      // Increment direct unread count if friend chat is not currently selected
      setDirectUnread(prev => {
        if (selectedFriend?.id === from) return prev;
        return { ...prev, [from]: (prev[from] || 0) + 1 };
      });

      playNotificationSound();
    });

    // ── GROUP SOCKET LISTENERS ──────────────────────────────────────
    socket.on("create-group", () => {
      fetchGroups();
    });

    socket.on("receive-group-message", (gMsg: GroupMessage) => {
      setGroupMessages(prev => {
        const currentList = prev[gMsg.groupId] || [];
        const exists = currentList.some(m => m.id === gMsg.id);
        if (exists) return prev;
        return { ...prev, [gMsg.groupId]: [...currentList, gMsg] };
      });

      setGroups(prev => prev.map(g => {
        if (g.id === gMsg.groupId) {
          return {
            ...g,
            lastMessage: gMsg.isAttachment ? `[${gMsg.attachmentType || "File"}] ${gMsg.fileName || ""}` : gMsg.content,
            lastMessageTime: gMsg.timestamp,
            unreadCount: (selectedGroup?.id === gMsg.groupId) ? 0 : ((g.unreadCount || 0) + 1)
          };
        }
        return g;
      }));

      playNotificationSound();
    });

    socket.on("group-message-delivered", ({ messageId, groupId, status }: any) => {
      setGroupMessages(prev => {
        const list = prev[groupId] || [];
        return {
          ...prev,
          [groupId]: list.map(m => m.id === messageId ? { ...m, status } : m)
        };
      });
    });

    socket.on("group-message-read", ({ groupId, userId }: any) => {
      setGroupMessages(prev => {
        const list = prev[groupId] || [];
        return {
          ...prev,
          [groupId]: list.map(m => m.senderId !== userId ? { ...m, status: "read" } : m)
        };
      });
    });

    socket.on("typing-group", ({ groupId, userName }: any) => {
      setGroupTypingUsers(prev => {
        const list = prev[groupId] || [];
        if (!list.includes(userName)) {
          return { ...prev, [groupId]: [...list, userName] };
        }
        return prev;
      });
    });

    socket.on("stop-typing-group", ({ groupId, userId }: any) => {
      setGroupTypingUsers(prev => ({
        ...prev,
        [groupId]: (prev[groupId] || []).filter(u => u !== userId)
      }));
    });

    socket.on("rename-group", () => {
      fetchGroups();
    });
    socket.on("member-added", () => {
      fetchGroups();
    });
    socket.on("member-removed", () => {
      fetchGroups();
    });

    // ── CALL SOCKET LISTENERS ──────────────────────────────────────────────
    socket.on("incoming-call", ({ from, fromName, fromAvatar, offer, isVideo }: any) => {
      // Find the friend in our list
      setFriends(prev => {
        const caller = prev.find(f => f.id === from) || {
          id: from, fullName: fromName, avatar: fromAvatar || fromName?.slice(0,2)?.toUpperCase() || "??",
          email: "", phone: "", isMock: false, online: true, statusMessage: "", level: 1
        } as Friend;
        setActiveCallFriend(caller);
        return prev;
      });
      setIsVideoCall(!!isVideo);
      setCallState("incoming");
      // Store offer on window for acceptCall to use
      (window as any).__lms_incomingOffer = offer;
      (window as any).__lms_callFrom = from;
      // Start ringtone (respects device volume automatically via Web Audio)
      ringtoneRef.current?.startRinging();
    });

    socket.on("call-accepted", async ({ from, answer }: any) => {
      ringtoneRef.current?.stop();
      try {
        if (peerConnectionRef.current && answer) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (e) { console.warn("setRemoteDescription answer error:", e); }
      setCallState("connected");
      // Start call timer
      setCallDuration(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    });

    socket.on("call-rejected", () => {
      ringtoneRef.current?.stop();
      if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
      cleanupCallMedia();
      setCallState("idle");
      setActiveCallFriend(null);
      setCallDuration(0);
    });

    socket.on("call-failed", ({ reason }: any) => {
      ringtoneRef.current?.stop();
      cleanupCallMedia();
      setCallState("idle");
      setActiveCallFriend(null);
      setCallDuration(0);
      alert(`Call failed: ${reason || "Friend is offline"}`);
    });

    socket.on("end-call", () => {
      ringtoneRef.current?.stop();
      if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
      cleanupCallMedia();
      setCallState("idle");
      setActiveCallFriend(null);
      setCallDuration(0);
    });

    socket.on("ice-candidate", async ({ candidate }: any) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) { console.warn("addIceCandidate error:", e); }
    });

    // ── BLUE TICK SOCKET LISTENERS ──────────────────────────────────────────────────
    // "message-delivered" — grey double tick (receiver got it)
    socket.on("message-delivered", ({ messageId }: { messageId: string }) => {
      if (!messageId) return;
      setMessages(prev => {
        let changed = false;
        const result: Record<string, Message[]> = {};
        for (const [fid, msgs] of Object.entries(prev)) {
          const updated = msgs.map(m => {
            if (m.id === messageId && m.status === "sent") {
              changed = true;
              return { ...m, status: "delivered" as const };
            }
            return m;
          });
          result[fid] = changed && result[fid] === undefined ? updated : msgs;
          result[fid] = updated;
        }
        return changed ? result : prev;
      });
    });

    // "message-read" — blue double tick (receiver opened conversation)
    socket.on("message-read", ({ messageIds }: { messageIds: string[] }) => {
      if (!messageIds || messageIds.length === 0) return;
      const idSet = new Set(messageIds);
      setMessages(prev => {
        let changed = false;
        const result: Record<string, Message[]> = {};
        for (const [fid, msgs] of Object.entries(prev)) {
          const updated = msgs.map(m => {
            if (idSet.has(m.id) && m.status !== "read") {
              changed = true;
              return { ...m, status: "read" as const };
            }
            return m;
          });
          result[fid] = updated;
        }
        return changed ? result : prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {}
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, groupMessages, selectedFriend, selectedGroup]);

  // Load group messages & mark read on selection
  useEffect(() => {
    if (selectedGroup) {
      setSelectedFriend(null);
      fetchGroupMessages(selectedGroup.id);
      markGroupMessagesRead(selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedFriend) {
      setSelectedGroup(null);
      fetchChatHistory(selectedFriend.id);
      setDirectUnread((prev) => ({ ...prev, [selectedFriend.id]: 0 }));
      // Tell the server we've read all of this friend's messages (triggers blue tick for them)
      if (socketRef.current?.connected) {
        socketRef.current.emit("mark-messages-read", { fromUserId: selectedFriend.id });
      }
    }
  }, [selectedFriend]);

  // ── Sync selectedFriend / selectedGroup into refs for the polling hook ──
  // Refs allow the hook to read current selection without stale closures.
  useEffect(() => {
    selectedFriendIdRef.current = selectedFriend?.id ?? null;
  }, [selectedFriend]);

  useEffect(() => {
    selectedGroupIdRef.current = selectedGroup?.id ?? null;
  }, [selectedGroup]);

  // ── Background polling (Socket.IO fallback, every 5s) ──────────────────
  // Silently merges any data Socket.IO may have missed.
  // Pauses on hidden tab / offline / logout. Zero page reloads.
  useFriendsPolling({
    userId: user?.id,
    selectedFriendIdRef,
    selectedGroupIdRef,
    setMessages,
    setGroups,
    setDirectUnread,
    onPendingCountChange: (count) => {
      setPollPendingCount(count);
      // If polling detects new requests that our live list doesn't have yet,
      // re-fetch the full requests list silently
      if (count > pendingRequests.length) {
        fetchPendingRequests();
      }
    },
  });

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/friends");
      if (data.success && Array.isArray(data.friends)) {
        setFriends(data.friends);
      }
    } catch (err) {
      console.error("Fetch friends error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await apiRequest("/groups");
      if (res.success && Array.isArray(res.groups)) {
        setGroups(res.groups);
      }
    } catch (err) {
      console.error("Fetch groups error:", err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const data = await apiRequest("/friends/requests");
      if (data.success && Array.isArray(data.requests)) {
        setPendingRequests(data.requests);
      }
    } catch (err) {
      console.error("Fetch requests error:", err);
    }
  };

  const fetchChatHistory = async (friendId: string) => {
    try {
      const res = await apiRequest(`/friends/messages/${friendId}`);
      if (res.success && Array.isArray(res.messages)) {
        setMessages(prev => ({ ...prev, [friendId]: res.messages }));
      }
    } catch (err) {
      console.error("Chat history load error:", err);
    }
  };

  const fetchGroupMessages = async (groupId: string) => {
    try {
      const res = await apiRequest(`/groups/${groupId}/messages`);
      if (res.success && Array.isArray(res.messages)) {
        setGroupMessages(prev => ({ ...prev, [groupId]: res.messages }));
      }
    } catch (err) {
      console.error("Group messages load error:", err);
    }
  };

  const markGroupMessagesRead = async (groupId: string) => {
    try {
      await apiRequest(`/groups/${groupId}/read`, { method: "POST" });
      if (socketRef.current?.connected) {
        socketRef.current.emit("group-message-read", { groupId });
      }
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, unreadCount: 0 } : g));
    } catch (err) {}
  };

  // Group Management Handlers
  const handleCreateGroup = async (groupData: { groupName: string; groupDescription: string; groupAvatar: string; memberIds: string[] }) => {
    const res = await apiRequest("/groups", {
      method: "POST",
      body: JSON.stringify({
        groupName: groupData.groupName,
        groupDescription: groupData.groupDescription,
        groupAvatar: groupData.groupAvatar,
        members: groupData.memberIds,
      }),
    });
    if (res.success) {
      fetchGroups();
      if (socketRef.current?.connected) {
        socketRef.current.emit("create-group", { groupId: res.group._id, memberIds: groupData.memberIds });
      }
    } else {
      throw new Error(res.message || "Failed to create group");
    }
  };

  const handleUpdateGroup = async (data: { groupName?: string; groupDescription?: string; groupAvatar?: string }) => {
    if (!selectedGroup) return;
    const res = await apiRequest(`/groups/${selectedGroup.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.success) {
      setSelectedGroup(prev => prev ? { ...prev, ...data } : null);
      fetchGroups();
      if (socketRef.current?.connected) {
        socketRef.current.emit("rename-group", { groupId: selectedGroup.id, ...data });
      }
    } else {
      throw new Error(res.message || "Failed to update group");
    }
  };

  const handleAddMembersToGroup = async (selectedIds: string[]) => {
    if (!selectedGroup) return;
    const res = await apiRequest(`/groups/${selectedGroup.id}/members`, {
      method: "POST",
      body: JSON.stringify({ newMembers: selectedIds }),
    });
    if (res.success) {
      fetchGroups();
      fetchGroupMessages(selectedGroup.id);
      if (socketRef.current?.connected) {
        socketRef.current.emit("member-added", { groupId: selectedGroup.id, addedMembers: selectedIds });
      }
    } else {
      throw new Error(res.message || "Failed to add members");
    }
  };

  const handleRemoveMemberFromGroup = async (memberId: string) => {
    if (!selectedGroup) return;
    const res = await apiRequest(`/groups/${selectedGroup.id}/members/${memberId}`, {
      method: "DELETE",
    });
    if (res.success) {
      fetchGroups();
      fetchGroupMessages(selectedGroup.id);
      if (socketRef.current?.connected) {
        socketRef.current.emit("member-removed", { groupId: selectedGroup.id, memberId });
      }
    } else {
      throw new Error(res.message || "Failed to remove member");
    }
  };

  const handlePromoteAdmin = async (memberId: string) => {
    if (!selectedGroup) return;
    const res = await apiRequest(`/groups/${selectedGroup.id}/admins/${memberId}`, {
      method: "POST",
    });
    if (res.success) {
      setSelectedGroup(prev => prev ? { ...prev, admins: [...prev.admins, memberId] } : null);
      fetchGroups();
    } else {
      throw new Error(res.message || "Failed to promote admin");
    }
  };

  const handleDemoteAdmin = async (memberId: string) => {
    if (!selectedGroup) return;
    const res = await apiRequest(`/groups/${selectedGroup.id}/admins/${memberId}`, {
      method: "DELETE",
    });
    if (res.success) {
      setSelectedGroup(prev => prev ? { ...prev, admins: prev.admins.filter(a => a !== memberId) } : null);
      fetchGroups();
    } else {
      throw new Error(res.message || "Failed to demote admin");
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    const res = await apiRequest(`/groups/${selectedGroup.id}/leave`, {
      method: "POST",
    });
    if (res.success) {
      setShowGroupInfoModal(false);
      setSelectedGroup(null);
      fetchGroups();
    } else {
      alert(res.message || "Failed to leave group");
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) return;
    const res = await apiRequest(`/groups/${selectedGroup.id}`, {
      method: "DELETE",
    });
    if (res.success) {
      setShowGroupInfoModal(false);
      setSelectedGroup(null);
      fetchGroups();
    } else {
      alert(res.message || "Failed to delete group");
    }
  };

  const handleTogglePinGroup = async () => {
    if (!selectedGroup) return;
    const res = await apiRequest(`/groups/${selectedGroup.id}/pin`, { method: "POST" });
    if (res.success) {
      setSelectedGroup(prev => prev ? { ...prev, isPinned: res.isPinned } : null);
      fetchGroups();
    }
  };

  const handleToggleMuteGroup = async () => {
    if (!selectedGroup) return;
    const res = await apiRequest(`/groups/${selectedGroup.id}/mute`, { method: "POST" });
    if (res.success) {
      setSelectedGroup(prev => prev ? { ...prev, isMuted: res.isMuted } : null);
      fetchGroups();
    }
  };

  // Input typing trigger for groups
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (selectedGroup && socketRef.current?.connected) {
      socketRef.current.emit("typing-group", { groupId: selectedGroup.id, userId: user?.id, userName: user?.fullName });
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = window.setTimeout(() => {
        socketRef.current?.emit("stop-typing-group", { groupId: selectedGroup.id, userId: user?.id });
      }, 2000);
    }
  };

  // Send Message (Text or Attachment)
  const handleSendMessage = async (
    text?: string,
    attachmentPayload?: {
      isAttachment: boolean;
      attachmentType: "document" | "image" | "video" | "contact" | "audio";
      fileName?: string;
      fileSize?: number;
      fileMimeType?: string;
      fileData?: string;
      fileUrl?: string;
      audioDuration?: number;
    }
  ) => {
    const messageContent = (text ?? inputText).trim();
    if (!messageContent && !attachmentPayload) return;

    // Send Group Message
    if (selectedGroup) {
      const tempId = Math.random().toString(36).substring(7);
      const newGMsg: GroupMessage = {
        id: tempId,
        groupId: selectedGroup.id,
        senderId: user?.id || "",
        senderName: user?.fullName || "Me",
        senderAvatar: (user?.fullName || "ME").trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2),
        content: messageContent,
        messageType: attachmentPayload ? attachmentPayload.attachmentType : "text",
        timestamp: new Date().toISOString(),
        status: "sent",
        ...(attachmentPayload && { ...attachmentPayload }),
      };

      setGroupMessages(prev => ({
        ...prev,
        [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newGMsg]
      }));
      setInputText("");

      // Transmit via Socket
      if (socketRef.current?.connected) {
        socketRef.current.emit("group-message", {
          groupId: selectedGroup.id,
          content: messageContent,
          messageType: newGMsg.messageType,
          ...(attachmentPayload && { ...attachmentPayload }),
        });
      }

      // REST Fallback API
      await apiRequest(`/groups/${selectedGroup.id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: messageContent,
          messageType: newGMsg.messageType,
          ...(attachmentPayload && { ...attachmentPayload }),
        }),
      });
      return;
    }

    // Send Private Friend Message
    if (selectedFriend) {
      const friend = selectedFriend;
      const newMsg: Message = {
        id: Math.random().toString(36).substring(7),
        senderId: user?.id || "",
        receiverId: friend.id,
        content: messageContent,
        timestamp: new Date().toISOString(),
        status: "sent",
        ...(attachmentPayload && { ...attachmentPayload }),
      };

      setMessages(prev => {
        const list = prev[friend.id] || [];
        const updated = { ...prev, [friend.id]: [...list, newMsg] };
        if (user?.email) safeSaveChatMessages(user.email, updated);
        return updated;
      });
      setInputText("");

      if (!friend.isMock && socketRef.current?.connected) {
        socketRef.current.emit("send-message", {
          to: friend.id,
          content: messageContent,
          ...(attachmentPayload && { ...attachmentPayload }),
        });
      }
    }
  };

  // Image & File Select Handlers
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    const isVid = file.type.startsWith("video/");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      await handleSendMessage("", {
        isAttachment: true,
        attachmentType: isVid ? "video" : "image",
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
        fileData: base64Data,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDocumentFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Document size exceeds 15MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      await handleSendMessage("", {
        isAttachment: true,
        attachmentType: "document",
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
        fileData: base64Data,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Friend Request Handlers ──────────────────────────────────────────────
  const handleSendFriendRequest = async () => {
    if (!addUsernameInput.trim()) return;
    setAddingFriend(true);
    setAddFriendStatus(null);
    try {
      const res = await apiRequest("/friends/request", {
        method: "POST",
        body: JSON.stringify({ username: addUsernameInput.trim() }),
      });
      if (res.success) {
        setAddFriendStatus({ type: "success", message: res.message || "Request sent!" });
        setAddUsernameInput("");
        setSearchSuggestions([]);
        fetchFriends();
      } else {
        setAddFriendStatus({ type: "error", message: res.message || "Failed to send request." });
      }
    } catch {
      setAddFriendStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setAddingFriend(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await apiRequest(`/friends/request/${requestId}`, {
        method: "PUT",
        body: JSON.stringify({ action: "accept" }),
      });
      if (res.success) {
        fetchPendingRequests();
        fetchFriends();
      }
    } catch (err) {
      console.error("Accept request error:", err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const res = await apiRequest(`/friends/request/${requestId}`, {
        method: "PUT",
        body: JSON.stringify({ action: "reject" }),
      });
      if (res.success) {
        fetchPendingRequests();
      }
    } catch (err) {
      console.error("Decline request error:", err);
    }
  };

  const handleSearchSuggestions = async (query: string) => {
    setAddUsernameInput(query);
    if (!query.trim() || query.trim().length < 1) {
      setSearchSuggestions([]);
      return;
    }
    setSearchingSuggestions(true);
    try {
      const res = await apiRequest(`/friends/search-list?query=${encodeURIComponent(query.trim())}`);
      if (res.success && Array.isArray(res.users)) {
        setSearchSuggestions(res.users);
      } else {
        setSearchSuggestions([]);
      }
    } catch {
      setSearchSuggestions([]);
    } finally {
      setSearchingSuggestions(false);
    }
  };

  // ── Helper: cleanup media streams & peer connection ───────────────────────
  const cleanupCallMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  // ── Helper: create RTCPeerConnection with ICE relaying ───────────────────
  const createPeerConnection = (targetUserId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.connected) {
        socketRef.current.emit("ice-candidate", {
          to: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        endCall();
      }
    };

    return pc;
  };

  // ── INITIATE CALL (caller side) ───────────────────────────────────────────
  const initiateCall = async (friend: Friend, isVideo: boolean) => {
    if (!socketRef.current?.connected) {
      alert("Not connected to server. Please try again.");
      return;
    }
    setActiveCallFriend(friend);
    setIsVideoCall(isVideo);
    setCallState("outgoing");
    setCallDuration(0);
    ringtoneRef.current?.startRinging();

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo ? { width: 640, height: 480, facingMode: "user" } : false,
      });
      localStreamRef.current = stream;

      // Show local video preview if video call
      if (localVideoRef.current && isVideo) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = createPeerConnection(friend.id);
      peerConnectionRef.current = pc;

      // Add tracks
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Emit call
      socketRef.current.emit("call-user", {
        to: friend.id,
        offer,
        fromName: user?.fullName || user?.email || "User",
        fromAvatar: user?.avatar || (user?.fullName || "U").slice(0, 2).toUpperCase(),
        isVideo,
      });
    } catch (err: any) {
      ringtoneRef.current?.stop();
      setCallState("idle");
      setActiveCallFriend(null);
      if (err.name === "NotAllowedError") {
        alert("Microphone/camera permission denied. Please allow access in browser settings.");
      } else {
        alert("Could not start call: " + (err.message || err));
      }
    }
  };

  // ── ACCEPT CALL (callee side) ─────────────────────────────────────────────
  const acceptCall = async () => {
    ringtoneRef.current?.stop();
    const incomingOffer = (window as any).__lms_incomingOffer;
    const callFrom = (window as any).__lms_callFrom;

    if (!incomingOffer || !callFrom) return;
    if (!socketRef.current?.connected) return;

    setCallState("connected");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall ? { width: 640, height: 480, facingMode: "user" } : false,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current && isVideoCall) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection(callFrom);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit("accept-call", { to: callFrom, answer });

      // Start call timer
      setCallDuration(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      endCall();
      if (err.name === "NotAllowedError") {
        alert("Microphone/camera permission denied.");
      }
    }
  };

  // ── REJECT CALL (callee side) ─────────────────────────────────────────────
  const rejectCall = () => {
    ringtoneRef.current?.stop();
    const callFrom = (window as any).__lms_callFrom;
    if (callFrom && socketRef.current?.connected) {
      socketRef.current.emit("reject-call", { to: callFrom });
    }
    (window as any).__lms_incomingOffer = null;
    (window as any).__lms_callFrom = null;
    cleanupCallMedia();
    setCallState("idle");
    setActiveCallFriend(null);
    setCallDuration(0);
  };

  // ── END CALL (both sides) ─────────────────────────────────────────────────
  const endCall = () => {
    ringtoneRef.current?.stop();
    const targetId = activeCallFriend?.id || (window as any).__lms_callFrom;
    if (targetId && socketRef.current?.connected) {
      socketRef.current.emit("end-call", { to: targetId });
    }
    (window as any).__lms_incomingOffer = null;
    (window as any).__lms_callFrom = null;
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    cleanupCallMedia();
    setCallState("idle");
    setActiveCallFriend(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoEnabled(true);
  };

  // ── TOGGLE MUTE ───────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // ── TOGGLE VIDEO ──────────────────────────────────────────────────────────
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // ── FORMAT CALL DURATION ──────────────────────────────────────────────────
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Render Ticks Helper
  const renderTicks = (status?: "sent" | "delivered" | "read") => {
    if (status === "read") {
      return <CheckCheck size={13} className="text-sky-400 font-bold" title="Seen by recipients" />;
    } else if (status === "delivered") {
      return <CheckCheck size={13} className="text-slate-400 dark:text-slate-400" title="Delivered to recipient(s)" />;
    } else {
      return <Check size={13} className="text-slate-400 dark:text-slate-400" title="Sent to server" />;
    }
  };

  // WhatsApp Style Unread Badge Counter (1, 2, 3... 5+)
  const formatUnreadBadge = (count?: number) => {
    if (!count || count <= 0) return null;
    const displayStr = count > 5 ? "5+" : count.toString();
    return (
      <span className="bg-emerald-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] h-4.5 flex items-center justify-center text-center shadow-sm border border-white dark:border-slate-900 animate-in zoom-in-50 duration-200">
        {displayStr}
      </span>
    );
  };

  // Helper to get last message timestamp for direct friend chat
  const getFriendLastTimestamp = (friendId: string): number => {
    const friendMsgs = messages[friendId] || [];
    if (friendMsgs.length > 0) {
      const lastMsg = friendMsgs[friendMsgs.length - 1];
      return new Date(lastMsg.timestamp).getTime();
    }
    return 0;
  };

  // Helper to get last message timestamp for group
  const getGroupLastTimestamp = (group: Group): number => {
    if (group.lastMessageTime) {
      return new Date(group.lastMessageTime).getTime();
    }
    return 0;
  };

  // Combine Groups and Friends into a unified conversation feed sorted by newest message first
  type ConversationItem =
    | { type: "group"; data: Group; timestamp: number; isPinned: boolean }
    | { type: "friend"; data: Friend; timestamp: number; isPinned: boolean };

  const allConversations: ConversationItem[] = [
    ...groups.map((g) => ({
      type: "group" as const,
      data: g,
      timestamp: getGroupLastTimestamp(g),
      isPinned: Boolean(g.isPinned),
    })),
    ...friends.map((f) => ({
      type: "friend" as const,
      data: f,
      timestamp: getFriendLastTimestamp(f.id),
      isPinned: false,
    })),
  ];

  // Sort Conversations: Pinned first, then newest message timestamp DESCENDING
  allConversations.sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return b.timestamp - a.timestamp;
  });

  // Filter conversations by search query
  const filteredConversations = allConversations.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (item.type === "group") {
      return (
        item.data.groupName.toLowerCase().includes(q) ||
        (item.data.groupDescription && item.data.groupDescription.toLowerCase().includes(q))
      );
    } else {
      return (
        item.data.fullName.toLowerCase().includes(q) ||
        (item.data.username && item.data.username.toLowerCase().includes(q))
      );
    }
  });

  return (
    <div className="flex h-full w-full bg-[#f0f2f5] dark:bg-slate-950 overflow-hidden font-sans text-foreground">
      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageFileSelect} />
      <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip" className="hidden" onChange={handleDocumentFileSelect} />

      {/* ── LEFT SIDEBAR: Chats vs Calls ── */}
      <div className={`w-full lg:w-[410px] bg-white dark:bg-slate-900 border-r border-[#e9edef] dark:border-slate-800 flex flex-col flex-shrink-0 ${selectedFriend || selectedGroup ? "hidden lg:flex" : "flex"}`}>
        
        {/* User Header Card */}
        <div className="bg-[#f0f2f5] dark:bg-slate-850 px-4 py-3 flex items-center justify-between relative">
          <div className="flex items-center gap-2.5">
            <div className="relative group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm select-none shadow">
                {user?.avatar ?? "LU"}
              </div>
              {/* Highlighted '+' Button beside Profile Avatar */}
              <button
                onClick={() => setShowCreateGroupModal(true)}
                title="Create Group Chat"
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-850 active:scale-95 transition-all animate-pulse"
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground truncate max-w-[130px]">
                {user?.fullName?.split(" ")[0] ?? "Collaborator"}
              </p>
              <p className="text-[10px] text-muted-foreground">My Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground relative">
            {/* Create Group Action Button */}
            <button
              onClick={() => setShowCreateGroupModal(true)}
              title="Create Group Chat"
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-full border border-emerald-500/30 transition-all active:scale-95 flex items-center justify-center shadow-sm"
            >
              <Plus size={19} strokeWidth={2.5} />
            </button>

            {/* Friend List */}
            <button
              onClick={() => setShowFriendListModal(true)}
              title="Friend List"
              className="hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 active:scale-95"
            >
              <UserCheck size={19} />
            </button>

            {/* Partner Requests */}
            <button
              onClick={() => setShowRequestsModal(true)}
              title="Partner Requests"
              className="hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 active:scale-95 relative"
            >
              {(() => {
                const badgeCount = Math.max(pendingRequests.length, pollPendingCount);
                return (
                  <>
                    <Heart size={18} className={badgeCount > 0 ? "text-red-500 fill-red-500 animate-pulse" : ""} />
                    {badgeCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[8px] flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">
                        {badgeCount > 9 ? "9+" : badgeCount}
                      </span>
                    )}
                  </>
                );
              })()}
            </button>

            {/* New Chat */}
            <button
              onClick={() => setShowContactsModal(true)}
              title="New Chat"
              className="hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 active:scale-95"
            >
              <Users size={19} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Chats vs Calls) */}
        <div className="flex border-b border-[#e9edef] dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "chats"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <MessageSquare size={15} /> Chats
          </button>
          <button
            onClick={() => setActiveTab("calls")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "calls"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <Phone size={15} /> Calls
          </button>
        </div>

        {/* Search bar */}
        <div className="px-3 py-2 bg-white dark:bg-slate-900 border-b border-[#f0f2f5] dark:border-slate-800">
          <div className="relative flex items-center bg-[#f0f2f5] dark:bg-slate-800 rounded-xl px-3 py-1.5">
            <Search className="text-muted-foreground mr-2.5" size={14} />
            <input
              type="text"
              placeholder={activeTab === "chats" ? "Search groups or friends..." : "Search call history"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-xs text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Sidebar Feeds */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5]/80 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-xs gap-3">
              <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
              <p>Loading conversations...</p>
            </div>
          ) : activeTab === "chats" ? (
            <div className="space-y-0.5">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">No conversations found.</div>
              ) : (
                filteredConversations.map((item) => {
                  if (item.type === "group") {
                    const grp = item.data;
                    const isSelected = selectedGroup?.id === grp.id;
                    const typers = groupTypingUsers[grp.id] || [];
                    const typingText =
                      typers.length > 0
                        ? typers.length === 1
                          ? `${typers[0]} typing...`
                          : "Multiple users typing..."
                        : null;

                    return (
                      <div
                        key={`group_${grp.id}`}
                        onClick={() => {
                          setSelectedGroup(grp);
                          setSelectedFriend(null);
                        }}
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-muted/20 transition-all ${
                          isSelected ? "bg-[#f0f2f5] dark:bg-slate-800" : "hover:bg-[#f5f6f8] dark:hover:bg-slate-850/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-bold text-white shadow-sm overflow-hidden border border-emerald-500/20">
                              {grp.groupAvatar ? (
                                <img src={grp.groupAvatar} alt={grp.groupName} className="w-full h-full object-cover" />
                              ) : (
                                <Users size={20} />
                              )}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5 truncate">
                              <span>{grp.groupName}</span>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                                Group
                              </span>
                              {grp.isPinned && <Pin size={11} className="text-indigo-500 fill-indigo-500 ml-0.5" />}
                            </h4>

                            {typingText ? (
                              <p className="text-xs text-emerald-500 font-medium animate-pulse">{typingText}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground truncate">{grp.lastMessage || "No messages yet"}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {grp.lastMessageTime ? new Date(grp.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                          {formatUnreadBadge(grp.unreadCount)}
                        </div>
                      </div>
                    );
                  } else {
                    const friend = item.data;
                    const isSelected = selectedFriend?.id === friend.id;
                    const friendMsgs = messages[friend.id] || [];
                    const lastMsgObj = friendMsgs[friendMsgs.length - 1];
                    const unreadCount = directUnread[friend.id] || 0;

                    return (
                      <div
                        key={`friend_${friend.id}`}
                        onClick={() => {
                          setSelectedFriend(friend);
                          setSelectedGroup(null);
                        }}
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-muted/20 transition-all ${
                          isSelected ? "bg-[#f0f2f5] dark:bg-slate-800" : "hover:bg-[#f5f6f8] dark:hover:bg-slate-850/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600">
                              {friend.avatar}
                            </div>
                            {friend.online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                              {friend.fullName}
                            </h4>
                            <p className={`text-xs truncate ${unreadCount > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                              {lastMsgObj ? (lastMsgObj.isAttachment ? `[Attachment]` : lastMsgObj.content) : "Tap to chat"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                          <span className={`text-[10px] font-medium ${unreadCount > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground"}`}>
                            {lastMsgObj ? new Date(lastMsgObj.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                          {formatUnreadBadge(unreadCount)}
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>
          ) : (
            /* Calls Tab */
            <div className="p-8 text-center text-xs text-muted-foreground">No call logs recorded yet.</div>
          )}
        </div>
      </div>

      {/* ── RIGHT MAIN SCREEN: Group or Private Chat Window ── */}
      <div className={`flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-slate-950 relative ${selectedFriend || selectedGroup ? "flex" : "hidden lg:flex"}`}>
        
        {/* GROUP CHAT WINDOW */}
        {selectedGroup ? (
          <div className="flex-1 flex flex-col h-full justify-between relative">
            {/* Group Header */}
            <div className="bg-[#f0f2f5] dark:bg-slate-900 border-b border-[#e9edef] dark:border-slate-800 px-4 py-2.5 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowGroupInfoModal(true)}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGroup(null);
                  }}
                  className="lg:hidden p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground mr-1"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-bold text-white shadow-sm overflow-hidden">
                  {selectedGroup.groupAvatar ? (
                    <img src={selectedGroup.groupAvatar} alt={selectedGroup.groupName} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <span>{selectedGroup.groupName}</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                      Group
                    </span>
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {groupTypingUsers[selectedGroup.id]?.length > 0
                      ? `${groupTypingUsers[selectedGroup.id].join(", ")} typing...`
                      : `${selectedGroup.members.length} members • Click for info`}
                  </p>
                </div>
              </div>

              {/* Group Action Icons */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <button
                  onClick={() => setShowGroupInfoModal(true)}
                  title="Group Info"
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <Info size={19} />
                </button>
                {/* Close Chat Button */}
                <button
                  onClick={() => setSelectedGroup(null)}
                  title="Close Chat"
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-full transition-all active:scale-95"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Group Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]/80 dark:bg-slate-950/80">
              {(groupMessages[selectedGroup.id] || []).map((msg) => {
                const isSelf = msg.senderId === user?.id;

                if (msg.messageType === "system") {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <span className="bg-black/10 dark:bg-white/10 text-muted-foreground text-[10px] px-3 py-1 rounded-full font-medium shadow-sm">
                        {msg.senderName} {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group ${isSelf ? "items-end" : "items-start"}`}
                  >
                    <div
                      onClick={() => {
                        if (isSelf) {
                          setSelectedMsgForInfo(msg);
                          setShowMessageInfoModal(true);
                        }
                      }}
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm relative text-xs cursor-pointer transition-all ${
                        isSelf
                          ? "bg-[#d9fdd3] dark:bg-emerald-950 text-slate-900 dark:text-slate-100 rounded-tr-none"
                          : "bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50"
                      }`}
                    >
                      {/* Sender Tag for Group Chat */}
                      {!isSelf && (
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                          {msg.senderName}
                        </p>
                      )}

                      {/* Content or Attachments */}
                      {msg.isAttachment ? (
                        <div className="space-y-1.5">
                          {msg.attachmentType === "image" && (
                            <img src={msg.fileData || msg.fileUrl} alt="attachment" className="rounded-xl max-h-60 object-cover w-full" />
                          )}
                          {msg.attachmentType === "video" && (
                            <video src={msg.fileData || msg.fileUrl} controls className="rounded-xl max-h-60 w-full" />
                          )}
                          {msg.attachmentType === "document" && (
                            <a
                              href={msg.fileData || msg.fileUrl}
                              download={msg.fileName || "document"}
                              className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10"
                            >
                              <FileText size={18} className="text-emerald-500" />
                              <span className="font-medium underline truncate">{msg.fileName || "Download Attachment"}</span>
                            </a>
                          )}
                          {msg.content && <p className="mt-1">{msg.content}</p>}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}

                      {/* Timestamp & Ticks */}
                      <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground mt-1">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isSelf && renderTicks(msg.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-[#f0f2f5] dark:bg-slate-900 border-t border-[#e9edef] dark:border-slate-800 px-4 py-2.5 flex items-center gap-2">
              <button onClick={() => imageInputRef.current?.click()} title="Send Media" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-muted-foreground">
                <ImageIcon size={19} />
              </button>
              <button onClick={() => documentInputRef.current?.click()} title="Send Document" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-muted-foreground">
                <Paperclip size={19} />
              </button>

              <input
                type="text"
                placeholder="Type a group message..."
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2.5 h-10 w-10 flex items-center justify-center shadow-md"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        ) : selectedFriend ? (
          /* PRIVATE FRIEND CHAT WINDOW */
          <div className="flex-1 flex flex-col h-full justify-between relative">
            {/* Header */}
            <div className="bg-[#f0f2f5] dark:bg-slate-900 border-b border-[#e9edef] dark:border-slate-800 px-4 py-2.5 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedFriend(null)} className="lg:hidden p-1 rounded-full hover:bg-black/5 text-muted-foreground mr-1">
                  <ChevronLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                  {selectedFriend.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{selectedFriend.fullName}</h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {selectedFriend.online ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">online</span>
                      </>
                    ) : "offline"}
                  </p>
                </div>
              </div>

              {/* Call Buttons */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <button onClick={() => initiateCall(selectedFriend, false)} title="Voice Call" className="p-2 hover:bg-black/5 rounded-full">
                  <Phone size={19} />
                </button>
                <button onClick={() => initiateCall(selectedFriend, true)} title="Video Call" className="p-2 hover:bg-black/5 rounded-full">
                  <Video size={19} />
                </button>
                {/* Close Chat Button */}
                <button
                  onClick={() => setSelectedFriend(null)}
                  title="Close Chat"
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-full transition-all active:scale-95"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]/80 dark:bg-slate-950/80">
              {(messages[selectedFriend.id] || []).map((msg) => {
                const isSelf = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex flex-col group ${isSelf ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm relative text-xs ${
                        isSelf
                          ? "bg-[#d9fdd3] dark:bg-emerald-950 text-slate-900 dark:text-slate-100 rounded-tr-none"
                          : "bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/50"
                      }`}
                    >
                      {msg.isAttachment ? (
                        <div className="space-y-1.5">
                          {msg.attachmentType === "image" && <img src={msg.fileData || msg.fileUrl} alt="attachment" className="rounded-xl max-h-60 object-cover w-full" />}
                          {msg.attachmentType === "video" && <video src={msg.fileData || msg.fileUrl} controls className="rounded-xl max-h-60 w-full" />}
                          {msg.attachmentType === "document" && (
                            <a href={msg.fileData || msg.fileUrl} download={msg.fileName} className="flex items-center gap-2 p-2 bg-black/5 rounded-lg">
                              <FileText size={18} className="text-emerald-500" />
                              <span className="font-medium underline truncate">{msg.fileName || "Download"}</span>
                            </a>
                          )}
                          {msg.content && <p>{msg.content}</p>}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}

                      <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground mt-1">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isSelf && renderTicks(msg.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-[#f0f2f5] dark:bg-slate-900 border-t border-[#e9edef] dark:border-slate-800 px-4 py-2.5 flex items-center gap-2">
              <button onClick={() => imageInputRef.current?.click()} title="Send Media" className="p-2 hover:bg-black/5 rounded-full text-muted-foreground">
                <ImageIcon size={19} />
              </button>
              <button onClick={() => documentInputRef.current?.click()} title="Send Document" className="p-2 hover:bg-black/5 rounded-full text-muted-foreground">
                <Paperclip size={19} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2.5 h-10 w-10 flex items-center justify-center shadow-md"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        ) : (
          /* IDLE LANDING */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f0f2f5] dark:bg-slate-950">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 shadow-sm">
              <Users size={36} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Smart-LMS Real-time Chat & Groups</h2>
            <p className="text-xs text-muted-foreground max-w-sm mt-2">
              Select a friend or group chat from the sidebar, or click the highlighted <span className="font-bold text-emerald-500">+</span> button to create a new group!
            </p>
            <Button
              onClick={() => setShowCreateGroupModal(true)}
              className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md shadow-emerald-500/20"
            >
              <Plus size={16} />
              <span>Create New Group</span>
            </Button>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {/* 1. Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        friends={friends}
        onCreateGroup={handleCreateGroup}
      />

      {/* 2. Group Info Modal */}
      {selectedGroup && (
        <GroupInfoModal
          isOpen={showGroupInfoModal}
          onClose={() => setShowGroupInfoModal(false)}
          group={selectedGroup}
          currentUserId={user?.id || ""}
          onUpdateGroup={handleUpdateGroup}
          onOpenAddMembers={() => setShowAddMembersModal(true)}
          onRemoveMember={handleRemoveMemberFromGroup}
          onPromoteAdmin={handlePromoteAdmin}
          onDemoteAdmin={handleDemoteAdmin}
          onLeaveGroup={handleLeaveGroup}
          onDeleteGroup={handleDeleteGroup}
          onTogglePin={handleTogglePinGroup}
          onToggleMute={handleToggleMuteGroup}
          groupMessages={groupMessages[selectedGroup.id] || []}
        />
      )}

      {/* 3. Add Members Selector Modal */}
      {selectedGroup && (
        <GroupMemberSelector
          isOpen={showAddMembersModal}
          onClose={() => setShowAddMembersModal(false)}
          availableFriends={friends}
          existingMemberIds={selectedGroup.members.map((m) => m.id)}
          onAddMembers={handleAddMembersToGroup}
        />
      )}

      {/* 4. WhatsApp Message Info Receipt Modal */}
      {selectedGroup && selectedMsgForInfo && (
        <MessageInfoModal
          isOpen={showMessageInfoModal}
          onClose={() => {
            setShowMessageInfoModal(false);
            setSelectedMsgForInfo(null);
          }}
          groupId={selectedGroup.id}
          messageId={selectedMsgForInfo.id}
          messageContent={selectedMsgForInfo.content}
          messageTime={selectedMsgForInfo.timestamp}
        />
      )}

      {/* 5. Add Friend / Contacts Modal — Instagram-style search */}
      {showContactsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => { setShowContactsModal(false); setAddFriendStatus(null); setAddUsernameInput(""); setSearchSuggestions([]); }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#e9edef] dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-foreground">Add Study Partner</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Find people by name or username</p>
              </div>
              <button
                onClick={() => { setShowContactsModal(false); setAddFriendStatus(null); setAddUsernameInput(""); setSearchSuggestions([]); }}
                className="w-8 h-8 rounded-full bg-[#f0f2f5] dark:bg-slate-800 hover:bg-[#e1e3e6] dark:hover:bg-slate-700 flex items-center justify-center text-muted-foreground transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                {searchingSuggestions && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-emerald-400/40 border-t-emerald-500 rounded-full animate-spin" />
                )}
                <input
                  type="text"
                  placeholder="Search by name or @username…"
                  value={addUsernameInput}
                  onChange={(e) => handleSearchSuggestions(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && addUsernameInput.trim()) handleSendFriendRequest(); }}
                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-[#e9edef] dark:border-slate-700 rounded-2xl bg-[#f0f2f5] dark:bg-slate-800 text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Results List — Instagram style */}
            <div className="flex-1 overflow-y-auto">
              {searchSuggestions.length > 0 ? (
                <div className="pb-3">
                  {addUsernameInput.trim() && (
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-5 pb-2">Results</p>
                  )}
                  {searchSuggestions.map((u: any, idx: number) => {
                    const isAlreadyFriend = u.relationStatus === "accepted";
                    const isPendingSent = u.relationStatus === "pending_sent";
                    const isPendingReceived = u.relationStatus === "pending_received";
                    return (
                      <div
                        key={u.id || u._id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f7f7f7] dark:hover:bg-slate-800/60 transition-colors"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {(u.fullName || u.name || u.username || "U").slice(0, 2).toUpperCase()}
                          </div>
                          {isAlreadyFriend && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                              <Check size={8} strokeWidth={3} className="text-white" />
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate leading-tight">{u.fullName || u.name || u.username}</p>
                          <p className="text-[11px] text-muted-foreground truncate">@{u.username} · Lv {u.level || 1}</p>
                          {isAlreadyFriend && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Already partners</span>
                          )}
                          {isPendingSent && (
                            <span className="text-[10px] text-amber-500 font-medium">Request sent</span>
                          )}
                          {isPendingReceived && (
                            <span className="text-[10px] text-blue-500 font-medium">Wants to partner</span>
                          )}
                        </div>

                        {/* Action Button */}
                        {!isAlreadyFriend && !isPendingSent && !isPendingReceived && (
                          <button
                            onClick={() => {
                              setAddUsernameInput(u.username || "");
                              setTimeout(() => handleSendFriendRequest(), 0);
                            }}
                            className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
                          >
                            Add
                          </button>
                        )}
                        {isPendingSent && (
                          <span className="flex-shrink-0 text-[10px] text-amber-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded-lg font-medium">Pending</span>
                        )}
                        {isPendingReceived && (
                          <button
                            onClick={() => handleAcceptRequest(u.requestId)}
                            className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
                          >
                            Accept
                          </button>
                        )}
                        {isAlreadyFriend && (
                          <button
                            onClick={() => {
                              const friend = friends.find(f => f.id === u.id);
                              if (friend) { setSelectedFriend(friend); setShowContactsModal(false); }
                            }}
                            className="flex-shrink-0 bg-[#f0f2f5] dark:bg-slate-700 hover:bg-[#e1e3e6] text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                          >
                            Message
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : addUsernameInput.trim() && !searchingSuggestions ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                  <User size={32} className="opacity-30" />
                  <p className="text-sm">No users found for "{addUsernameInput}"</p>
                </div>
              ) : !addUsernameInput.trim() ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                  <Search size={32} className="opacity-20" />
                  <p className="text-sm">Start typing to search people</p>
                </div>
              ) : null}
            </div>

            {/* Status Toast */}
            {addFriendStatus && (
              <div className={`mx-4 mb-4 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-medium ${
                addFriendStatus.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
              }`}>
                {addFriendStatus.type === "success" ? <Check size={15} /> : <X size={15} />}
                {addFriendStatus.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Partner Requests Modal */}
      {showRequestsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setShowRequestsModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Partner Requests</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pendingRequests.length > 0 ? `${pendingRequests.length} pending request${pendingRequests.length > 1 ? "s" : ""}` : "No pending requests"}
                </p>
              </div>
              <button
                onClick={() => setShowRequestsModal(false)}
                className="p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 text-muted-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 -mx-1 px-1">
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                  <Heart size={40} className="opacity-30" />
                  <p className="text-sm text-center">No pending partner requests.<br/>Ask someone to connect with you!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingRequests.map((req: any) => (
                    <div key={req.requestId} className="flex items-center gap-3 p-3 bg-[#f0f2f5] dark:bg-slate-800 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(req.senderName || req.fullName || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{req.senderName || req.fullName || "User"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">@{req.senderUsername || req.username || req.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAcceptRequest(req.requestId)}
                          title="Accept"
                          className="p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-95 shadow-sm"
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.requestId)}
                          title="Decline"
                          className="p-1.5 rounded-full bg-[#e1e3e6] dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-all active:scale-95"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Friend List Modal */}
      {showFriendListModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setShowFriendListModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Study Partners</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{friends.length} partner{friends.length !== 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={() => setShowFriendListModal(false)}
                className="p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 text-muted-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 -mx-1 px-1">
              {friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                  <UserCheck size={40} className="opacity-30" />
                  <p className="text-sm text-center">No partners yet.<br/>Use the search to find someone!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 p-3 bg-[#f0f2f5] dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                      onClick={() => { setSelectedFriend(f); setSelectedGroup(null); setShowFriendListModal(false); }}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {f.avatar || f.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                          f.online ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{f.fullName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{f.online ? "Online" : f.statusMessage}</p>
                      </div>
                      <Award size={14} className="text-amber-400 flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground">Lv {f.level}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* WHATSAPP-STYLE CALL OVERLAY                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {callState !== "idle" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.92)" }}>

          {/* ── VIDEO CALL: Connected ── */}
          {callState === "connected" && isVideoCall ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
              {/* Remote Video (full screen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* If no remote video yet, show avatar */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {!remoteVideoRef.current?.srcObject && (
                  <>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl mb-4">
                      {activeCallFriend?.avatar}
                    </div>
                    <p className="text-white text-lg font-semibold">{activeCallFriend?.fullName}</p>
                    <p className="text-white/60 text-sm mt-1">Connecting video…</p>
                  </>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute bottom-28 right-4 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-800">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <VideoOff size={20} className="text-white/50" />
                  </div>
                )}
              </div>

              {/* Call Timer */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <p className="text-white font-semibold text-base">{activeCallFriend?.fullName}</p>
                <p className="text-emerald-400 text-sm font-mono font-bold">{formatDuration(callDuration)}</p>
              </div>

              {/* Controls */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-5">
                <button
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${isMuted ? "bg-white text-slate-900" : "bg-white/20 text-white border border-white/30"}`}
                >
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-xl transition-all active:scale-90"
                >
                  <PhoneOff size={26} className="text-white" />
                </button>
                <button
                  onClick={toggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${!isVideoEnabled ? "bg-white text-slate-900" : "bg-white/20 text-white border border-white/30"}`}
                >
                  {isVideoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
                </button>
              </div>
            </div>

          ) : callState === "connected" && !isVideoCall ? (
            /* ── VOICE CALL: Connected ── */
            <div className="flex flex-col items-center justify-between w-full h-full py-16 px-6"
              style={{ background: "linear-gradient(160deg, #1e293b 0%, #0f172a 60%, #1e293b 100%)" }}>
              {/* Hidden audio element for remote audio */}
              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />

              <div className="flex flex-col items-center gap-4 mt-8">
                {/* Ripple avatar */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-36 h-36 rounded-full bg-emerald-500/10 animate-ping" />
                  <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-pulse" />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl z-10">
                    {activeCallFriend?.avatar}
                  </div>
                </div>
                <p className="text-white text-2xl font-bold mt-4">{activeCallFriend?.fullName}</p>
                <p className="text-emerald-400 text-base font-mono font-bold tracking-widest">{formatDuration(callDuration)}</p>
                <p className="text-white/50 text-xs">Voice Call • Connected</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-8 mb-6">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${isMuted ? "bg-white text-slate-900" : "bg-white/10 text-white border border-white/20"}`}
                  >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                  <span className="text-white/50 text-[10px]">{isMuted ? "Unmute" : "Mute"}</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={endCall}
                    className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl transition-all active:scale-90"
                  >
                    <PhoneOff size={28} className="text-white" />
                  </button>
                  <span className="text-white/50 text-[10px]">End</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    className="w-14 h-14 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center shadow-lg transition-all active:scale-90"
                  >
                    <Volume2 size={22} />
                  </button>
                  <span className="text-white/50 text-[10px]">Speaker</span>
                </div>
              </div>
            </div>

          ) : callState === "outgoing" ? (
            /* ── OUTGOING CALL SCREEN ── */
            <div className="flex flex-col items-center justify-between w-full h-full py-16 px-6"
              style={{ background: "linear-gradient(160deg, #1e293b 0%, #0f172a 60%, #1e293b 100%)" }}>
              <div className="flex flex-col items-center gap-4 mt-12">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-40 h-40 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: "1.5s" }} />
                  <div className="absolute w-32 h-32 rounded-full bg-emerald-500/15 animate-pulse" />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl z-10">
                    {activeCallFriend?.avatar}
                  </div>
                </div>
                <p className="text-white text-2xl font-bold mt-6">{activeCallFriend?.fullName}</p>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  {isVideoCall ? <Video size={15} /> : <Phone size={15} />}
                  <span>{isVideoCall ? "Video" : "Voice"} call…</span>
                </div>

                {/* Animated dots */}
                <div className="flex gap-1.5 mt-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-1">Ringing…</p>
              </div>

              {/* Local video preview for video calls */}
              {isVideoCall && (
                <div className="w-32 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-800 my-6">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                </div>
              )}

              {/* Cancel button */}
              <div className="flex flex-col items-center gap-2 mb-8">
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl transition-all active:scale-90"
                >
                  <PhoneOff size={26} className="text-white" />
                </button>
                <span className="text-white/50 text-xs">Cancel</span>
              </div>
            </div>

          ) : callState === "incoming" ? (
            /* ── INCOMING CALL SCREEN ── */
            <div className="flex flex-col items-center justify-between w-full h-full py-16 px-6"
              style={{ background: "linear-gradient(160deg, #1e293b 0%, #0f172a 60%, #1e293b 100%)" }}>
              <div className="flex flex-col items-center gap-4 mt-12">
                <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-2">
                  Incoming {isVideoCall ? "Video" : "Voice"} Call
                </p>
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-40 h-40 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: "1.2s" }} />
                  <div className="absolute w-32 h-32 rounded-full bg-emerald-500/20 animate-pulse" />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl z-10 ring-4 ring-emerald-400/40">
                    {activeCallFriend?.avatar}
                  </div>
                </div>
                <p className="text-white text-2xl font-bold mt-6">{activeCallFriend?.fullName}</p>
                <p className="text-white/50 text-sm">{isVideoCall ? "Wants to video call you" : "Wants to voice call you"}</p>
              </div>

              {/* Accept / Decline buttons */}
              <div className="flex items-end justify-center gap-16 mb-8">
                {/* Decline */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={rejectCall}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl transition-all active:scale-90"
                  >
                    <PhoneOff size={26} className="text-white" />
                  </button>
                  <span className="text-white/50 text-xs">Decline</span>
                </div>

                {/* Accept */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={acceptCall}
                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-2xl transition-all active:scale-90 animate-pulse"
                  >
                    {isVideoCall ? <Video size={26} className="text-white" /> : <Phone size={26} className="text-white" />}
                  </button>
                  <span className="text-white/50 text-xs">Accept</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
