import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Phone, Video, Search, Send, Paperclip, Smile,
  CheckCheck, ArrowUpRight, ArrowDownLeft, PhoneOff, Mic, MicOff, 
  VideoOff, Users, Volume2, Shield, Clock, Award, Sparkles,
  MoreVertical, FileText, Image, User, Headphones, Trash2, Check, X, Download, Heart, UserCheck,
  ChevronLeft
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import { io, Socket } from "socket.io-client";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

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
  email: string;
  phone: string;
  avatar: string;
  isMock: boolean;
  online: boolean;
  statusMessage: string;
  level: number;
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
  fileData?: string;       // base64 data URL (images, video, audio)
  fileUrl?: string;        // static HTTP URL path
  audioDuration?: number;  // seconds for voice messages
  blobUrl?: string;        // transient object URL for documents (not persisted)
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);

  // Chats Data state
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});

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

  // Voice recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingDurationRef = useRef(0);

  // File picker refs
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const iceConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" }
    ]
  };

  const EMOJIS = ["😊", "👍", "👋", "📖", "✍️", "🧠", "⚡", "🚀", "💻", "🎓", "🧪", "📚", "🏆", "🔥", "🎉", "👏", "💡", "😅"];

  const safeSaveChatMessages = (email: string, updatedMessages: Record<string, Message[]>) => {
    try {
      localStorage.setItem(`lms_chat_messages_${email}`, JSON.stringify(updatedMessages));
    } catch (e) {
      console.warn("Storage quota exceeded (5MB limit reached). Message is kept in-memory for this session.", e);
    }
  };

  // Load Message history & Call logs from LocalStorage
  useEffect(() => {
    if (!user?.email) return;

    // Load added friend IDs
    const savedIds = localStorage.getItem(`lms_added_friends_${user.email}`);
    if (savedIds) {
      try {
        setAddedFriendIds(JSON.parse(savedIds));
      } catch (e) {
        console.error(e);
      }
    }

    const savedMessages = localStorage.getItem(`lms_chat_messages_${user.email}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Remove dummy preseeded conversations if present
        if (parsed["mock_1"] || parsed["mock_2"] || parsed["mock_4"]) {
          delete parsed["mock_1"];
          delete parsed["mock_2"];
          delete parsed["mock_4"];
          localStorage.setItem(`lms_chat_messages_${user.email}`, JSON.stringify(parsed));
        }
        setMessages(parsed);
      } catch (e) {
        console.error(e);
      }
    } else {
      setMessages({});
    }

    const savedCalls = localStorage.getItem(`lms_call_logs_${user.email}`);
    if (savedCalls) {
      try {
        const parsed = JSON.parse(savedCalls);
        // Remove dummy preseeded call logs if present
        const cleaned = parsed.filter((c: any) => c.id !== "c1" && c.id !== "c2");
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(`lms_call_logs_${user.email}`, JSON.stringify(cleaned));
        }
        setCallLogs(cleaned);
      } catch (e) {
        console.error(e);
      }
    } else {
      setCallLogs([]);
    }
  }, [user]);

  // Fetch users & setup socket connection
  useEffect(() => {
    fetchFriends();
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
        if (host.includes("vercel.app")) {
          return "https://smart-lms-cfxz.onrender.com";
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
        console.log("👤 [SOCKET] Registering user ID:", user.id);
        socket.emit("register-user", user.id);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [SOCKET] Connection error:", err.message);
    });


    socket.on("user-status-change", ({ userId, online }: { userId: string; online: boolean }) => {
      setFriends(prev => prev.map(friend => {
        if (friend.id === userId) {
          return { ...friend, online };
        }
        return friend;
      }));
    });

    // Real-time messaging listener — handles both text AND attachment messages
    socket.on("receive-message", ({
      id, from, content, timestamp,
      isAttachment, attachmentType, fileName, fileSize, fileMimeType, fileData, fileUrl, audioDuration
    }: any) => {
      // Automatically add to addedFriendIds if not already added
      setAddedFriendIds(prev => {
        if (!prev.includes(from)) {
          const updated = [...prev, from];
          if (user?.email) {
            localStorage.setItem(`lms_added_friends_${user.email}`, JSON.stringify(updated));
          }
          return updated;
        }
        return prev;
      });
      const newMsg: Message = {
        id: id || Math.random().toString(36).substring(7),
        senderId: from,
        receiverId: user?.id || "",
        content,
        timestamp: timestamp || new Date().toISOString(),
        status: "read",
        // Reconstruct attachment data if present
        ...(isAttachment && {
          isAttachment: true,
          attachmentType,
          fileName,
          fileSize,
          fileMimeType,
          fileData,
          fileUrl,
          audioDuration,
        }),
      };

      setMessages(prev => {
        const list = prev[from] || [];
        const isDuplicate = list.some(m =>
          (m.id && newMsg.id && m.id === newMsg.id) ||
          (m.fileUrl && newMsg.fileUrl && m.fileUrl === newMsg.fileUrl) ||
          (m.content === newMsg.content && m.fileName === newMsg.fileName && Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 10000)
        );
        if (isDuplicate) return prev;

        const updated = { ...prev, [from]: [...list, newMsg] };
        if (user?.email) {
          safeSaveChatMessages(user.email, updated);
        }
        return updated;
      });


      // Notification beep
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
    });

    // Incoming Call triggers
    socket.on("incoming-call", ({ from, fromName, fromAvatar, offer, isVideo }) => {
      setFriends(prev => {
        const found = prev.find(f => f.id === from);
        const tempFriend = found || {
          id: from,
          fullName: fromName,
          email: "peer@lms.com",
          phone: "",
          avatar: fromAvatar,
          isMock: false,
          online: true,
          statusMessage: "Active Peer",
          level: 1
        };
        setActiveCallFriend(tempFriend);
        setIsVideoCall(isVideo);
        setCallState("incoming");
        ringtoneRef.current?.startRinging();
        return prev;
      });

      (window as any).pendingOffer = offer;
    });

    socket.on("call-accepted", async ({ answer }) => {
      ringtoneRef.current?.stop();
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setCallState("connected");
          startCallTimer();
          logCall("outgoing", isVideoCall ? "video" : "voice");
        } catch (err) {
          cleanupCall();
        }
      }
    });

    socket.on("call-rejected", () => {
      ringtoneRef.current?.stop();
      alert("Call declined.");
      logCall("missed", isVideoCall ? "video" : "voice");
      cleanupCall();
    });

    socket.on("webrtc-signal", async ({ signal }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        } catch (err) {}
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {}
      }
    });

    socket.on("call-failed", ({ reason }) => {
      alert(`Call failed: ${reason}`);
      cleanupCall();
    });

    socket.on("end-call", () => {
      cleanupCall();
    });

    return () => {
      cleanupCall();
      socket.disconnect();
    };
  }, [user, isVideoCall]);

  // Re-register user on socket if user.id becomes available after socket connects
  useEffect(() => {
    if (user?.id && socketRef.current?.connected) {
      console.log("👤 [SOCKET] Re-emitting register-user for user:", user.id);
      socketRef.current.emit("register-user", user.id);
    }
  }, [user?.id]);

  // Fetch chat history from MongoDB whenever selected friend changes
  useEffect(() => {
    if (!selectedFriend || selectedFriend.isMock || !user?.id) return;

    const fetchChatHistory = async () => {
      try {
        const data = await apiRequest<{ success: boolean; messages: Message[] }>(`/friends/messages/${selectedFriend.id}`);
        if (data.success && Array.isArray(data.messages)) {
          setMessages(prev => {
            const currentList = prev[selectedFriend.id] || [];
            const existingIds = new Set(currentList.map((m: Message) => m.id));
            const existingUrls = new Set(currentList.map((m: Message) => m.fileUrl).filter(Boolean));

            const newMsgs = data.messages.filter((m: Message) => {
              if (existingIds.has(m.id)) return false;
              if (m.fileUrl && existingUrls.has(m.fileUrl)) return false;
              const matchesContent = currentList.some(
                c => c.content === m.content &&
                     c.senderId === m.senderId &&
                     Math.abs(new Date(c.timestamp).getTime() - new Date(m.timestamp).getTime()) < 10000
              );
              return !matchesContent;
            });


            if (newMsgs.length === 0) return prev;

            const combined = [...currentList, ...newMsgs].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            const updated = { ...prev, [selectedFriend.id]: combined };
            if (user?.email) {
              safeSaveChatMessages(user.email, updated);
            }
            return updated;
          });
        }
      } catch (err) {
        console.error("❌ Failed to fetch chat history from MongoDB:", err);
      }
    };

    fetchChatHistory();
  }, [selectedFriend?.id, user?.id]);



  // Scroll to bottom helper
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedFriend, isTyping]);

  const applyNicknames = (list: Friend[]) => {
    if (!user?.email) return list;
    const saved = localStorage.getItem(`lms_friend_nicknames_${user.email}`);
    if (!saved) return list;
    try {
      const nicknames = JSON.parse(saved);
      return list.map(f => {
        if (nicknames[f.id]) {
          const nick = nicknames[f.id];
          return {
            ...f,
            fullName: nick,
            avatar: nick.trim().split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
          };
        }
        return f;
      });
    } catch {
      return list;
    }
  };

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ success: boolean; friends: Friend[] }>("/friends");
      if (response.success) {
        const withNicknames = applyNicknames(response.friends);
        setFriends(withNicknames);
        
        // Auto select first friend
        if (withNicknames.length > 0 && !selectedFriend) {
          setSelectedFriend(withNicknames[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await apiRequest<{ success: boolean; requests: any[] }>("/friends/requests");
      if (response.success) {
        setPendingRequests(response.requests);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  const handleRespondToRequest = async (requestId: string, action: "accept" | "reject") => {
    try {
      const response = await apiRequest<{ success: boolean; status: string }>(`/friends/request/${requestId}`, {
        method: "PUT",
        body: JSON.stringify({ action })
      });
      if (response.success) {
        // Remove from pending state list
        setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
        // Re-fetch friends list to reflect updates
        fetchFriends();
        // Also refresh requests count
        fetchPendingRequests();
      }
    } catch (err) {
      console.error("Failed to respond to request:", err);
    }
  };

  const handleAddFriend = async () => {
    if (!addUsernameInput.trim() || !user) return;
    setAddFriendStatus(null);
    setAddingFriend(true);

    try {
      const response = await apiRequest<{ success: boolean; message: string; status?: string }>(
        "/friends/request",
        {
          method: "POST",
          body: JSON.stringify({ username: addUsernameInput.trim() })
        }
      );

      if (response.success) {
        setAddFriendStatus({
          type: "success",
          message: response.message || "Request sent successfully!"
        });
        
        // Refresh friends list & incoming requests in case of auto-acceptance
        fetchFriends();
        fetchPendingRequests();
        
        setAddUsernameInput("");
        setTimeout(() => {
          setShowContactsModal(false);
          setAddFriendStatus(null);
        }, 2000);
      }
    } catch (err: any) {
      setAddFriendStatus({
        type: "error",
        message: err.message || "Failed to search or send request. Check the username."
      });
    } finally {
      setAddingFriend(false);
    }
  };

  // Autocomplete debounced search whenever input changes
  useEffect(() => {
    if (!addUsernameInput.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearchingSuggestions(true);
        const response = await apiRequest<{ success: boolean; users: any[] }>(
          `/friends/search-list?query=${encodeURIComponent(addUsernameInput.trim())}`
        );
        if (response.success) {
          setSearchSuggestions(response.users);
        }
      } catch (err) {
        console.error("Autocomplete search error:", err);
      } finally {
        setSearchingSuggestions(false);
      }
    }, 250); // 250ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [addUsernameInput]);

  // Request/Connect action from search results list
  const handleSendRequestToUser = async (targetUsername: string) => {
    try {
      const response = await apiRequest<{ success: boolean; message: string; status?: string }>(
        "/friends/request",
        {
          method: "POST",
          body: JSON.stringify({ username: targetUsername })
        }
      );

      if (response.success) {
        setAddFriendStatus({
          type: "success",
          message: response.message || "Request sent successfully!"
        });
        
        // Update local suggestion item relationStatus
        setSearchSuggestions(prev => prev.map(s => {
          if (s.username === targetUsername) {
            return { ...s, relationStatus: response.status || "pending_sent" };
          }
          return s;
        }));

        fetchFriends();
        fetchPendingRequests();
        
        setTimeout(() => {
          setAddFriendStatus(null);
        }, 3000);
      }
    } catch (err: any) {
      setAddFriendStatus({
        type: "error",
        message: err.message || "Failed to send request."
      });
    }
  };

  const handleSaveMyName = async () => {
    if (!myNewName.trim() || myNewName.trim().length < 3 || !user) return;
    try {
      const response = await apiRequest<{ success: boolean; data: { name: string } }>("/profile/update", {
        method: "PUT",
        body: JSON.stringify({ name: myNewName.trim() })
      });
      if (response.success && updateUser) {
        updateUser({
          fullName: myNewName.trim(),
          avatar: myNewName.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2)
        });
        setShowEditMyNameModal(false);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile name.");
    }
  };

  const handleSavePartnerNickname = (newName: string) => {
    if (!selectedFriend || !user) return;
    const saved = localStorage.getItem(`lms_friend_nicknames_${user.email}`);
    const nicknames = saved ? JSON.parse(saved) : {};
    nicknames[selectedFriend.id] = newName.trim();
    localStorage.setItem(`lms_friend_nicknames_${user.email}`, JSON.stringify(nicknames));
    
    // Update friends list in state
    setFriends(prev => prev.map(f => {
      if (f.id === selectedFriend.id) {
        const nick = newName.trim();
        return { 
          ...f, 
          fullName: nick, 
          avatar: nick.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2) 
        };
      }
      return f;
    }));

    // Update active selected friend state
    setSelectedFriend(prev => {
      if (!prev) return null;
      const nick = newName.trim();
      return { 
        ...prev, 
        fullName: nick, 
        avatar: nick.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2) 
      };
    });

    setShowEditPartnerModal(false);
  };

  const logCall = (direction: "incoming" | "outgoing" | "missed", type: "voice" | "video") => {
    if (!activeCallFriend || !user?.email) return;

    const newLog: CallLog = {
      id: Math.random().toString(36).substring(7),
      friendId: activeCallFriend.id,
      friendName: activeCallFriend.fullName,
      friendAvatar: activeCallFriend.avatar,
      type,
      direction,
      timestamp: new Date().toISOString(),
      duration: callDuration > 0 ? callDuration : undefined
    };

    setCallLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem(`lms_call_logs_${user.email}`, JSON.stringify(updated));
      return updated;
    });
  };

  const cleanupCall = () => {
    ringtoneRef.current?.stop();
    if (offlineCallTimeoutRef.current) {
      clearTimeout(offlineCallTimeoutRef.current);
      offlineCallTimeoutRef.current = null;
    }
    if (canvasIntervalRef.current) { clearInterval(canvasIntervalRef.current); canvasIntervalRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(track => track.stop()); localStreamRef.current = null; }
    if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }

    setCallState("idle");
    setActiveCallFriend(null);
    setCallDuration(0);
    setUseSimulatedStream(false);
    setIsMuted(false);
    setIsVideoEnabled(true);
    delete (window as any).pendingOffer;
  };

  const startCallTimer = () => {
    setCallDuration(0);
    timerIntervalRef.current = window.setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Call triggers (including offline automatic simulation fallback so all call buttons work)
  const initiateCall = async (friend: Friend, isVideo: boolean) => {
    setActiveCallFriend(friend);
    setIsVideoCall(isVideo);
    setCallState("outgoing");
    ringtoneRef.current?.startRinging();

    // If offline user is called, simulate study bot auto-answering call after 3.5 seconds
    if (!friend.online) {
      console.log("☎️ Friend is offline. Initiating simulated study partner call connection.");
      
      offlineCallTimeoutRef.current = window.setTimeout(() => {
        ringtoneRef.current?.stop();
        setUseSimulatedStream(true);
        const simLocalStream = createSimulatedStream(isVideo);
        localStreamRef.current = simLocalStream;

        setTimeout(() => {
          if (localVideoRef.current && simLocalStream) {
            localVideoRef.current.srcObject = simLocalStream;
          }
          if (remoteVideoRef.current && simLocalStream) {
            remoteVideoRef.current.srcObject = simLocalStream;
          }
        }, 200);

        setCallState("connected");
        startCallTimer();
        logCall("outgoing", isVideo ? "video" : "voice");
      }, 3500);

      return;
    }

    // Standard live WebRTC trigger for online peers
    let localStream: MediaStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: isVideo ? { width: 640, height: 480 } : false,
        audio: true
      });
      setUseSimulatedStream(false);
    } catch (err) {
      localStream = createSimulatedStream(isVideo);
      setUseSimulatedStream(true);
    }

    localStreamRef.current = localStream;
    
    setTimeout(() => {
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }, 200);

    try {
      const pc = new RTCPeerConnection(iceConfiguration);
      peerConnectionRef.current = pc;

      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            to: friend.id,
            candidate: event.candidate
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit("call-user", {
        to: friend.id,
        offer,
        fromName: user?.fullName || "A Student",
        fromAvatar: user?.avatar || "LU",
        isVideo
      });

    } catch (err) {
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!activeCallFriend || !socketRef.current) return;
    ringtoneRef.current?.stop();

    let localStream: MediaStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: isVideoCall ? { width: 640, height: 480 } : false,
        audio: true
      });
      setUseSimulatedStream(false);
    } catch (err) {
      localStream = createSimulatedStream(isVideoCall);
      setUseSimulatedStream(true);
    }

    localStreamRef.current = localStream;

    setTimeout(() => {
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }, 200);

    try {
      const pc = new RTCPeerConnection(iceConfiguration);
      peerConnectionRef.current = pc;

      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            to: activeCallFriend.id,
            candidate: event.candidate
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = (window as any).pendingOffer;
      if (offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current.emit("accept-call", {
          to: activeCallFriend.id,
          answer
        });

        setCallState("connected");
        startCallTimer();
        logCall("incoming", isVideoCall ? "video" : "voice");
      } else {
        cleanupCall();
      }

    } catch (err) {
      cleanupCall();
    }
  };

  const declineCall = () => {
    if (!activeCallFriend || !socketRef.current) return;
    socketRef.current.emit("reject-call", { to: activeCallFriend.id });
    logCall("missed", isVideoCall ? "video" : "voice");
    cleanupCall();
  };

  const endCall = () => {
    if (activeCallFriend && socketRef.current) {
      socketRef.current.emit("end-call", { to: activeCallFriend.id });
    }
    if (callState === "connected") {
      logCall("outgoing", isVideoCall ? "video" : "voice");
    }
    cleanupCall();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const createSimulatedStream = (isVideo: boolean): MediaStream => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d")!;
    let hue = 0;
    let circleX = 100;
    let dir = 3;

    const draw = () => {
      ctx.fillStyle = `hsl(${hue}, 25%, 12%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(isVideo ? "WebRTC Simulated Camera Feed" : "Simulated Audio Feed", 320, 200);

      ctx.fillStyle = "#10B981";
      ctx.font = "16px sans-serif";
      ctx.fillText("Active peer stream collaboration", 320, 240);

      ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
      ctx.beginPath();
      ctx.arc(circleX, 300, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#10B981";
      ctx.beginPath();
      ctx.arc(circleX, 300, 15, 0, Math.PI * 2);
      ctx.fill();

      hue = (hue + 1) % 360;
      circleX += dir;
      if (circleX > 540 || circleX < 100) dir = -dir;
    };

    canvasIntervalRef.current = window.setInterval(draw, 30);
    const stream = (canvas as any).captureStream(30) as MediaStream;

    try {
      const ctxAudio = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctxAudio.createOscillator();
      const dest = ctxAudio.createMediaStreamDestination();
      osc.frequency.setValueAtTime(200, ctxAudio.currentTime);
      osc.connect(dest);
      osc.start();
      stream.addTrack(dest.stream.getAudioTracks()[0]);
    } catch {}

    return stream;
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedFriend || !user) return;

    const messageText = inputText.trim();
    setInputText("");

    const newMsg: Message = {
      id: Math.random().toString(36).substring(7),
      senderId: user.id,
      receiverId: selectedFriend.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      status: "sent"
    };

    const friendId = selectedFriend.id;
    setMessages(prev => {
      const list = prev[friendId] || [];
      const updated = { ...prev, [friendId]: [...list, newMsg] };
      safeSaveChatMessages(user.email, updated);
      return updated;
    });

    if (!selectedFriend.isMock && socketRef.current?.connected) {
      socketRef.current.emit("send-message", {
        to: selectedFriend.id,
        content: messageText
      });
    }

    // Trigger bot reply for mock study-buddy friends
    if (selectedFriend.isMock) {
      triggerBotReply(selectedFriend, messageText);
    }
  };

  // EMOJI CLICK HANDLER
  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Trigger real file pickers or toggle friend share modal
  const handleSendAttachment = (type: "document" | "image" | "contact") => {
    setShowAttachmentMenu(false);
    if (type === "document") { documentInputRef.current?.click(); return; }
    if (type === "image") { imageInputRef.current?.click(); return; }
    if (type === "contact") {
      setShowShareFriendModal(true);
    }
  };

  // Handle sharing a specific friend username/card
  const handleShareFriend = (targetFriend: Friend) => {
    setShowShareFriendModal(false);
    if (!selectedFriend || !user) return;
    const friend = selectedFriend;
    const newMsg: Message = {
      id: Math.random().toString(36).substring(7),
      senderId: user.id,
      receiverId: friend.id,
      content: `👤 Shared Friend: ${targetFriend.fullName} (@${targetFriend.id})`,
      timestamp: new Date().toISOString(),
      status: "sent",
      isAttachment: true,
      attachmentType: "contact",
      fileName: targetFriend.fullName,      // Shared Friend Name
      fileMimeType: targetFriend.id,         // Shared Friend ID/Username
      fileData: targetFriend.avatar,         // Shared Friend Avatar Initials
    };
    const friendId = friend.id;
    setMessages(prev => {
      const list = prev[friendId] || [];
      const updated = { ...prev, [friendId]: [...list, newMsg] };
      safeSaveChatMessages(user.email, updated);
      return updated;
    });
    // Transmit via socket to real online users
    if (!friend.isMock && socketRef.current?.connected) {
      socketRef.current.emit("send-message", {
        to: friend.id,
        content: newMsg.content,
        isAttachment: true,
        attachmentType: "contact",
        fileName: newMsg.fileName,
        fileMimeType: newMsg.fileMimeType,
        fileData: newMsg.fileData,
      });
    }
    // Bot auto-reply for mock friends
    if (friend.isMock) triggerAttachmentBotReply(friend, "contact");
  };

  // Handle real image / video file selection
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFriend || !user) return;
    const friend = selectedFriend;  // capture for async closure
    const currentUser = user;
    const isVideo = file.type.startsWith("video/");
    e.target.value = ""; // clear picker input

    // 1. Try uploading to backend server first
    const uploaded = await uploadFileToServer(file);

    if (uploaded) {
      const newMsg: Message = {
        id: Math.random().toString(36).substring(7),
        senderId: currentUser.id,
        receiverId: friend.id,
        content: isVideo ? `🎬 ${file.name}` : `🖼️ ${file.name}`,
        timestamp: new Date().toISOString(),
        status: "sent",
        isAttachment: true,
        attachmentType: isVideo ? "video" : "image",
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        fileMimeType: uploaded.fileMimeType,
        fileUrl: uploaded.fileUrl,
      };

      const friendId = friend.id;
      setMessages(prev => {
        const list = prev[friendId] || [];
        const updated = { ...prev, [friendId]: [...list, newMsg] };
        safeSaveChatMessages(currentUser.email, updated);
        return updated;
      });

      // Transmit to the other side via socket
      if (!friend.isMock && socketRef.current?.connected) {
        socketRef.current.emit("send-message", {
          to: friend.id,
          content: newMsg.content,
          isAttachment: true,
          attachmentType: newMsg.attachmentType,
          fileName: newMsg.fileName,
          fileSize: newMsg.fileSize,
          fileMimeType: newMsg.fileMimeType,
          fileUrl: newMsg.fileUrl,
        });
      }
      if (friend.isMock) triggerAttachmentBotReply(friend, isVideo ? "video" : "image");
      return;
    }

    // 2. Base64 fallback if server upload failed
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newMsg: Message = {
        id: Math.random().toString(36).substring(7),
        senderId: currentUser.id,
        receiverId: friend.id,
        content: isVideo ? `🎬 ${file.name}` : `🖼️ ${file.name}`,
        timestamp: new Date().toISOString(),
        status: "sent",
        isAttachment: true,
        attachmentType: isVideo ? "video" : "image",
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
        fileData: base64,
      };
      const friendId = friend.id;
      setMessages(prev => {
        const list = prev[friendId] || [];
        const updated = { ...prev, [friendId]: [...list, newMsg] };
        safeSaveChatMessages(currentUser.email, updated);
        return updated;
      });
      // ── Transmit to the other side ──
      if (!friend.isMock && socketRef.current?.connected) {
        socketRef.current.emit("send-message", {
          to: friend.id,
          content: newMsg.content,
          isAttachment: true,
          attachmentType: newMsg.attachmentType,
          fileName: file.name,
          fileSize: file.size,
          fileMimeType: file.type,
          fileData: base64,
        });
      }
      if (friend.isMock) triggerAttachmentBotReply(friend, isVideo ? "video" : "image");
    };
    reader.readAsDataURL(file);
  };

  // Handle real document file selection — reads as base64 so PDF always opens
  const handleDocumentFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFriend || !user) return;
    const friend = selectedFriend;
    const currentUser = user;
    e.target.value = ""; // clear picker input

    // 1. Try uploading to backend server first
    const uploaded = await uploadFileToServer(file);

    if (uploaded) {
      const newMsg: Message = {
        id: Math.random().toString(36).substring(7),
        senderId: currentUser.id,
        receiverId: friend.id,
        content: `📄 ${file.name}`,
        timestamp: new Date().toISOString(),
        status: "sent",
        isAttachment: true,
        attachmentType: "document",
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        fileMimeType: uploaded.fileMimeType,
        fileUrl: uploaded.fileUrl,
      };

      const friendId = friend.id;
      setMessages(prev => {
        const list = prev[friendId] || [];
        const updated = { ...prev, [friendId]: [...list, newMsg] };
        safeSaveChatMessages(currentUser.email, updated);
        return updated;
      });

      // Transmit via socket
      if (!friend.isMock && socketRef.current?.connected) {
        socketRef.current.emit("send-message", {
          to: friend.id,
          content: newMsg.content,
          isAttachment: true,
          attachmentType: "document",
          fileName: newMsg.fileName,
          fileSize: newMsg.fileSize,
          fileMimeType: newMsg.fileMimeType,
          fileUrl: newMsg.fileUrl,
        });
      }
      if (friend.isMock) triggerAttachmentBotReply(friend, "document");
      return;
    }

    // 2. Base64 fallback if server upload failed
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newMsg: Message = {
        id: Math.random().toString(36).substring(7),
        senderId: currentUser.id,
        receiverId: friend.id,
        content: `📄 ${file.name}`,
        timestamp: new Date().toISOString(),
        status: "sent",
        isAttachment: true,
        attachmentType: "document",
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
        fileData: base64,   // base64 persists across sessions, works for window.open
      };
      const friendId = friend.id;
      setMessages(prev => {
        const list = prev[friendId] || [];
        const updated = { ...prev, [friendId]: [...list, newMsg] };
        safeSaveChatMessages(currentUser.email, updated);
        return updated;
      });
      // ── Transmit to the other side ──
      if (!friend.isMock && socketRef.current?.connected) {
        socketRef.current.emit("send-message", {
          to: friend.id,
          content: newMsg.content,
          isAttachment: true,
          attachmentType: "document",
          fileName: file.name,
          fileSize: file.size,
          fileMimeType: file.type,
          fileData: base64,
        });
      }
      if (friend.isMock) triggerAttachmentBotReply(friend, "document");
    };
    reader.readAsDataURL(file);
  };

  // Start voice recording
  const startVoiceRecording = async () => {
    if (!selectedFriend || !user) return;
    const currentFriend = selectedFriend;
    const currentUser = user;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordingDurationRef.current = 0;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const dur = recordingDurationRef.current;
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const voiceFile = new File([blob], `voice_${Date.now()}.webm`, { type: mimeType });

        // 1. Try uploading to backend server first
        const uploaded = await uploadFileToServer(voiceFile);

        if (uploaded) {
          const newMsg: Message = {
            id: Math.random().toString(36).substring(7),
            senderId: currentUser.id,
            receiverId: currentFriend.id,
            content: `🎤 Voice message (${formatTime(dur)})`,
            timestamp: new Date().toISOString(),
            status: "sent",
            isAttachment: true,
            attachmentType: "audio",
            fileName: uploaded.fileName,
            fileSize: uploaded.fileSize,
            fileMimeType: uploaded.fileMimeType,
            fileUrl: uploaded.fileUrl,
            audioDuration: dur,
          };

          const friendId = currentFriend.id;
          setMessages(prev => {
            const list = prev[friendId] || [];
            const updated = { ...prev, [friendId]: [...list, newMsg] };
            safeSaveChatMessages(currentUser.email, updated);
            return updated;
          });

          // Transmit to the other side via socket
          if (!currentFriend.isMock && socketRef.current?.connected) {
            socketRef.current.emit("send-message", {
              to: currentFriend.id,
              content: newMsg.content,
              isAttachment: true,
              attachmentType: "audio",
              fileName: newMsg.fileName,
              fileSize: newMsg.fileSize,
              fileMimeType: newMsg.fileMimeType,
              fileUrl: newMsg.fileUrl,
              audioDuration: dur,
            });
          }
          if (currentFriend.isMock) triggerAttachmentBotReply(currentFriend, "audio");
          recordingDurationRef.current = 0;
          setRecordingDuration(0);
          return;
        }

        // 2. Base64 fallback if server upload failed
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const newMsg: Message = {
            id: Math.random().toString(36).substring(7),
            senderId: currentUser.id,
            receiverId: currentFriend.id,
            content: `🎤 Voice message (${formatTime(dur)})`,
            timestamp: new Date().toISOString(),
            status: "sent",
            isAttachment: true,
            attachmentType: "audio",
            fileName: `voice_${Date.now()}.webm`,
            fileMimeType: mimeType,
            fileData: base64,
            audioDuration: dur,
          };
          const friendId = currentFriend.id;
          setMessages(prev => {
            const list = prev[friendId] || [];
            const updated = { ...prev, [friendId]: [...list, newMsg] };
            safeSaveChatMessages(currentUser.email, updated);
            return updated;
          });
          // ── Transmit to the other side ──
          if (!currentFriend.isMock && socketRef.current?.connected) {
            socketRef.current.emit("send-message", {
              to: currentFriend.id,
              content: newMsg.content,
              isAttachment: true,
              attachmentType: "audio",
              fileName: newMsg.fileName,
              fileMimeType: mimeType,
              fileData: base64,
              audioDuration: dur,
            });
          }
          if (currentFriend.isMock) triggerAttachmentBotReply(currentFriend, "audio");
          recordingDurationRef.current = 0;
          setRecordingDuration(0);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = window.setInterval(() => {
        recordingDurationRef.current += 1;
        setRecordingDuration(recordingDurationRef.current);
      }, 1000);
    } catch {
      alert("Microphone access denied. Please allow microphone permissions to record voice messages.");
    }
  };

  // Stop voice recording (cancel = true discards the recording)
  const stopVoiceRecording = (cancel = false) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    if (cancel) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
        if (mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
      }
      audioChunksRef.current = [];
      recordingDurationRef.current = 0;
      setRecordingDuration(0);
      return;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // File size display helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Attachment-aware bot reply (for mock/simulated friends receiving files)
  const triggerAttachmentBotReply = (bot: Friend, attachType: string) => {
    const botId = bot.id;
    setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [botId]: true }));
    }, 800);
    setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [botId]: false }));
      const replies: Record<string, string> = {
        image:    "Nice image! That will definitely help for our study session. 🖼️",
        video:    "Great video! Let's watch it together on a call and go through the concepts. 🎬",
        document: "Got the document! I'll review it and we can discuss it in our next session. 📄",
        audio:    "Voice note received! Let me listen and I'll reply back soon. 🎤",
        contact:  "Thanks for the contact! I'll reach out to them for the study material. 👤",
      };
      const responseText = replies[attachType] || "Got it! Thanks for sharing. 👍";
      const botMsg: Message = {
        id: Math.random().toString(36).substring(7),
        senderId: botId,
        receiverId: user?.id || "",
        content: responseText,
        timestamp: new Date().toISOString(),
        status: "read"
      };
      setMessages(prev => {
        const list = prev[botId] || [];
        const updated = { ...prev, [botId]: [...list, botMsg] };
        if (user?.email) {
          safeSaveChatMessages(user.email, updated);
        }
        return updated;
      });
    }, 2500);
  };

  // Bot auto replies
  const triggerBotReply = (bot: Friend, text: string) => {
    const botId = bot.id;
    setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [botId]: true }));
    }, 1000);

    setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [botId]: false }));

      let responseText = "Let's work together. Do you want to start a voice or video call now?";
      const lower = text.toLowerCase();
      if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        responseText = `Hey study buddy! I am solving some practice questions. How is your study prep going?`;
      } else if (lower.includes("physics") || lower.includes("math") || lower.includes("chemistry")) {
        responseText = `Electrochemistry and Thermodynamics notes are ready. Let's start a video call to review them!`;
      } else if (lower.includes("call") || lower.includes("audio") || lower.includes("video")) {
        responseText = `I'm online. Go ahead and start the call, I'll join instantly.`;
      }

      const botMsg: Message = {
        id: Math.random().toString(36).substring(7),
        senderId: botId,
        receiverId: user?.id || "",
        content: responseText,
        timestamp: new Date().toISOString(),
        status: "read"
      };

      setMessages(prev => {
        const list = prev[botId] || [];
        const updated = { ...prev, [botId]: [...list, botMsg] };
        if (user?.email) {
          safeSaveChatMessages(user.email, updated);
        }
        return updated;
      });
    }, 3000);
  };


  // Utilities dropdown triggers
  const clearChatHistory = () => {
    if (!selectedFriend || !user?.email) return;
    setMessages(prev => {
      const updated = { ...prev, [selectedFriend.id]: [] };
      safeSaveChatMessages(user.email, updated);
      return updated;
    });
    setShowMoreMenu(false);
    setShowChatMoreMenu(false);
  };

  const handleRemovePartner = async () => {
    if (!selectedFriend || !user) return;
    const partnerId = selectedFriend.id;
    
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/friends/partner/${partnerId}`,
        { method: "DELETE" }
      );
      if (response.success) {
        // Refresh friends list
        fetchFriends();
        // Clear active chat selection
        setSelectedFriend(null);
        setShowChatMoreMenu(false);
      }
    } catch (err) {
      console.error("Failed to remove partner:", err);
    }
  };

  const clearAllCallLogs = () => {
    if (!user?.email) return;
    setCallLogs([]);
    localStorage.removeItem(`lms_call_logs_${user.email}`);
    setShowMoreMenu(false);
  };

  const openBase64File = (base64Data: string, mimeType: string, fileName?: string) => {
    try {
      const parts = base64Data.split(";base64,");
      const contentType = parts[0].split(":")[1] || mimeType;
      const raw = window.atob(parts[1] || base64Data);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      const newTab = window.open(blobUrl, "_blank");
      if (!newTab) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName || "file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Error opening base64 file:", err);
      window.open(base64Data, "_blank");
    }
  };

  const uploadFileToServer = async (file: File): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileMimeType: string } | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiRequest<{ success: boolean; fileUrl: string; fileName: string; fileSize: number; fileMimeType: string }>("/upload", {
        method: "POST",
        body: formData
      });
      if (data.success) {
        return {
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileMimeType: data.fileMimeType
        };
      }
      return null;
    } catch (err) {
      console.error("Error uploading file to server:", err);
      return null;
    }
  };


  const getFriendLastMsg = (friendId: string) => {
    const list = messages[friendId] || [];
    if (list.length === 0) return "No messages yet";
    const last = list[list.length - 1];
    const prefix = last.senderId === user?.id ? "You: " : "";
    if (last.isAttachment && last.attachmentType) {
      if (last.attachmentType === "image") return `${prefix}📷 Photo`;
      if (last.attachmentType === "video") return `${prefix}🎥 Video`;
      if (last.attachmentType === "audio") return `${prefix}🎤 Voice message`;
      if (last.attachmentType === "document") return `${prefix}📄 ${last.fileName || "Document"}`;
      if (last.attachmentType === "contact") return `${prefix}👤 Contact`;
    }
    return prefix + last.content;
  };

  const getFriendLastMsgTime = (friendId: string) => {
    const list = messages[friendId] || [];
    if (list.length === 0) return "";
    const date = new Date(list[list.length - 1].timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format seconds into mm:ss for call timer display
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Display all database-accepted friends
  const activeFriends = friends;

  // SORT FRIENDS: Online first, then offline (real & mock combined)
  const sortedFriends = [...activeFriends].sort((a, b) => {
    if (a.online && !b.online) return -1;
    if (!a.online && b.online) return 1;
    return a.fullName.localeCompare(b.fullName);
  });

  const filteredFriends = sortedFriends.filter(f => 
    f.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-70px)] bg-[#eae6df] dark:bg-slate-950 overflow-hidden font-sans">
      {/* Hidden file inputs wired to attachment handlers */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleImageFileSelect}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.csv"
        className="hidden"
        onChange={handleDocumentFileSelect}
      />
      
      {/* ── LEFT SIDEBAR: Chats vs Calls history ── */}
      <div className={`w-full lg:w-[410px] bg-white dark:bg-slate-900 border-r border-[#e9edef] dark:border-slate-800 flex flex-col flex-shrink-0 ${selectedFriend ? "hidden lg:flex" : "flex"}`}>
        
        {/* WhatsApp user header card */}
        <div className="bg-[#f0f2f5] dark:bg-slate-850 px-4 py-3 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm select-none shadow">
              {user?.avatar ?? "LU"}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground truncate max-w-[150px]">
                {user?.fullName?.split(" ")[0] ?? "Collaborator"}
              </p>
              <p className="text-[10px] text-muted-foreground">My Workspace</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground relative">
            {/* Friend List Option */}
            <button 
              onClick={() => setShowFriendListModal(true)}
              title="Friend List" 
              className="hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 active:scale-95"
            >
              <UserCheck size={20} />
            </button>

            {/* Partner Requests Notification */}
            <button 
              onClick={() => setShowRequestsModal(true)}
              title="Partner Requests" 
              className="hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 active:scale-95 relative"
            >
              <Heart size={19} className={pendingRequests.length > 0 ? "text-red-500 fill-red-500 animate-pulse" : ""} />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[8px] flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            {/* Users icon opens new chat list */}
            <button 
              onClick={() => setShowContactsModal(true)}
              title="New Chat" 
              className="hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 active:scale-95"
            >
              <Users size={20} />
            </button>

            {/* Three dots dropdown */}
            <button 
              onClick={() => setShowMoreMenu(v => !v)}
              title="Menu Options" 
              className={`hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 active:scale-95
                ${showMoreMenu ? "bg-[#e1e3e6] dark:bg-slate-800 text-foreground" : ""}
              `}
            >
              <MoreVertical size={20} />
            </button>

            {/* Dropdown Menu Popup */}
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 top-10 z-30 w-48 bg-white dark:bg-slate-800 border border-[#e9edef] dark:border-slate-700/80 rounded-xl shadow-xl overflow-hidden py-1">
                  <button 
                    onClick={() => {
                      setMyNewName(user?.fullName || "");
                      setShowEditMyNameModal(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs text-foreground hover:bg-[#f5f6f8] dark:hover:bg-slate-700/80 flex items-center gap-2"
                  >
                    <User size={13} className="text-emerald-500" /> Edit My Name
                  </button>
                  <button 
                    onClick={clearChatHistory}
                    className="w-full px-4 py-2.5 text-left text-xs text-foreground hover:bg-[#f5f6f8] dark:hover:bg-slate-700/80 flex items-center gap-2"
                  >
                    <Trash2 size={13} className="text-red-500" /> Clear Chat History
                  </button>
                  <button 
                    onClick={clearAllCallLogs}
                    className="w-full px-4 py-2.5 text-left text-xs text-foreground hover:bg-[#f5f6f8] dark:hover:bg-slate-700/80 flex items-center gap-2"
                  >
                    <Trash2 size={13} className="text-red-500" /> Clear Call History
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chats vs Calls navigation tabs */}
        <div className="flex border-b border-[#e9edef] dark:border-slate-800 bg-white dark:bg-slate-900">
          <button 
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-4 transition-all
              ${activeTab === "chats" 
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                : "border-transparent text-muted-foreground hover:bg-muted/30"
              }
            `}
          >
            <MessageSquare size={16} /> Chats
          </button>
          <button 
            onClick={() => setActiveTab("calls")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-4 transition-all
              ${activeTab === "calls" 
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                : "border-transparent text-muted-foreground hover:bg-muted/30"
              }
            `}
          >
            <Phone size={16} /> Calls
          </button>
        </div>

        {/* Search bar */}
        <div className="px-3 py-2 bg-white dark:bg-slate-900 border-b border-[#f0f2f5] dark:border-sidebar-border">
          <div className="relative flex items-center bg-[#f0f2f5] dark:bg-slate-800 rounded-xl px-3 py-1.5">
            <Search className="text-muted-foreground mr-3" size={15} />
            <input 
              type="text" 
              placeholder={activeTab === "chats" ? "Search or start new chat" : "Search call history"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-xs text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Contacts & Call history feeds */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5]/80 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-xs gap-3">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
              <p>Connecting to feeds...</p>
            </div>
          ) : activeTab === "chats" ? (
            filteredFriends.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No chats found.</div>
            ) : (
              filteredFriends.map(friend => {
                const isSelected = selectedFriend?.id === friend.id;
                const typing = isTyping[friend.id];
                const lastMsg = getFriendLastMsg(friend.id);
                const lastTime = getFriendLastMsgTime(friend.id);

                return (
                  <div 
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`flex items-center justify-between px-4 py-3.5 cursor-pointer border-b border-muted/20 transition-all duration-100
                      ${isSelected ? "bg-[#f0f2f5] dark:bg-slate-800" : "hover:bg-[#f5f6f8] dark:hover:bg-slate-850/60"}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br
                          ${friend.isMock ? "from-indigo-500 to-purple-600" : "from-emerald-400 to-teal-500"}
                        `}>
                          {friend.avatar}
                        </div>
                        {friend.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                        )}
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                          {friend.fullName}
                          {friend.isMock && (
                            <span className="text-[9px] px-1.5 py-0.1 bg-[#f0f2f5] dark:bg-slate-700 text-muted-foreground rounded font-normal">Bot</span>
                          )}
                        </h4>
                        
                        {typing ? (
                          <p className="text-xs text-emerald-500 font-medium animate-pulse">typing...</p>
                        ) : (
                          <p className="text-xs text-muted-foreground truncate">{lastMsg}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground font-medium">{lastTime}</span>
                      {friend.online && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            // Calls logs history
            callLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">No call logs found. Start a voice or video call to connect!</div>
            ) : (
              callLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#f5f6f8] dark:hover:bg-slate-850/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-500 flex items-center justify-center text-white font-bold text-xs">
                      {log.friendAvatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{log.friendName}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {log.direction === "incoming" && <ArrowDownLeft size={13} className="text-emerald-500" />}
                        {log.direction === "outgoing" && <ArrowUpRight size={13} className="text-blue-500" />}
                        {log.direction === "missed" && <ArrowDownLeft size={13} className="text-red-500" />}
                        <span>
                          {log.direction.charAt(0).toUpperCase() + log.direction.slice(1)} • {new Date(log.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        const peer = friends.find(f => f.id === log.friendId);
                        if (peer) initiateCall(peer, log.type === "video");
                      }}
                      className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full"
                    >
                      {log.type === "video" ? <Video size={16} /> : <Phone size={16} />}
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Active chat screen or idle landing ── */}
      <div className={`flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-slate-950 relative ${selectedFriend ? "flex" : "hidden lg:flex"}`}>
        
        {selectedFriend && activeTab === "chats" ? (
          <div className="flex-1 flex flex-col h-full justify-between relative">
            
            {/* Chat header with call buttons (now always enabled with offline simulation fallback) */}
            <div className="bg-[#f0f2f5] dark:bg-slate-900 border-b border-[#e9edef] dark:border-slate-800 px-4 py-2.5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedFriend(null)}
                  className="lg:hidden p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground mr-1"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br
                  ${selectedFriend.isMock ? "from-indigo-500 to-purple-600" : "from-emerald-400 to-teal-500"}
                `}>
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

              {/* Call triggers (enabled with offline backup study buddy simulations) */}
              <div className="flex items-center gap-4 text-muted-foreground">
                <button 
                  onClick={() => initiateCall(selectedFriend, false)}
                  title="Voice Call"
                  className="p-2 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 active:scale-95 transition-colors"
                >
                  <Phone size={19} />
                </button>
                <button 
                  onClick={() => initiateCall(selectedFriend, true)}
                  title="Video Call"
                  className="p-2 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 active:scale-95 transition-colors"
                >
                  <Video size={19} />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowChatMoreMenu(v => !v)}
                    title="Menu Options"
                    className={`hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 active:scale-95
                      ${showChatMoreMenu ? "bg-[#e1e3e6] dark:bg-slate-800 text-foreground" : ""}
                    `}
                  >
                    <MoreVertical size={19} />
                  </button>

                  {showChatMoreMenu && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowChatMoreMenu(false)} />
                      <div className="absolute right-0 top-10 z-30 w-48 bg-white dark:bg-slate-800 border border-[#e9edef] dark:border-slate-700/80 rounded-xl shadow-xl overflow-hidden py-1">
                        <button 
                          onClick={() => {
                            setPartnerNewName(selectedFriend.fullName);
                            setShowEditPartnerModal(true);
                            setShowChatMoreMenu(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs text-foreground hover:bg-[#f5f6f8] dark:hover:bg-slate-700/80 flex items-center gap-2"
                        >
                          <User size={13} className="text-emerald-500" /> Edit Partner Name
                        </button>
                        <button 
                          onClick={clearChatHistory}
                          className="w-full px-4 py-2.5 text-left text-xs text-foreground hover:bg-[#f5f6f8] dark:hover:bg-slate-700/80 flex items-center gap-2"
                        >
                          <Trash2 size={13} className="text-red-500" /> Clear Chat History
                        </button>
                        {!selectedFriend.isMock && (
                          <button 
                            onClick={handleRemovePartner}
                            className="w-full px-4 py-2.5 text-left text-xs text-foreground hover:bg-[#f5f6f8] dark:hover:bg-slate-700/80 flex items-center gap-2"
                          >
                            <Trash2 size={13} className="text-red-500" /> Remove Partner
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedFriend(null)}
                  title="Close Chat"
                  className="hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-[#e1e3e6] dark:hover:bg-slate-800 active:scale-95"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Chat message thread */}
            <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#efeae2] dark:bg-slate-950 scrollbar-thin relative
              after:content-[''] after:absolute after:inset-0 after:opacity-[0.04] dark:after:opacity-[0.02] after:pointer-events-none
              after:bg-[radial-gradient(#128c7e_1px,transparent_1px)] after:[background-size:16px_16px]
            ">
              {/* ── WhatsApp-style message list with grouped bubbles + date separators ── */}
              {(() => {
                const msgList = messages[selectedFriend.id] || [];
                if (msgList.length === 0) return (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center bg-white/80 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl max-w-xs shadow border border-border/40 text-xs text-muted-foreground">
                      🔒 Messages are secured. Start collaborating below!
                    </div>
                  </div>
                );

                const elements: React.ReactNode[] = [];
                let lastDateLabel = "";

                msgList.forEach((msg, idx) => {
                  const isSelf = msg.senderId === user?.id;
                  const prev = msgList[idx - 1];
                  const next = msgList[idx + 1];

                  // ── Date separator ──
                  const msgDate = new Date(msg.timestamp);
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(today.getDate() - 1);
                  let dateLabel = msgDate.toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
                  if (msgDate.toDateString() === today.toDateString()) dateLabel = "Today";
                  else if (msgDate.toDateString() === yesterday.toDateString()) dateLabel = "Yesterday";

                  if (dateLabel !== lastDateLabel) {
                    lastDateLabel = dateLabel;
                    elements.push(
                      <div key={`date-${msg.id}`} className="flex items-center justify-center py-2">
                        <span className="text-[10px] font-semibold text-muted-foreground bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full shadow-sm border border-border/30">
                          {dateLabel}
                        </span>
                      </div>
                    );
                  }

                  // Is this the last message in a run from the same sender?
                  const isLastInGroup = !next || next.senderId !== msg.senderId;
                  const isFirstInGroup = !prev || prev.senderId !== msg.senderId;

                  // Timestamp element reused across types
                  const ts = (
                    <div className="flex items-center justify-end gap-1 mt-0.5 select-none">
                      <span className="text-[9px] text-muted-foreground/70 font-semibold">
                        {msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isSelf && <CheckCheck size={11} className="text-blue-400" />}
                    </div>
                  );

                  // ── ATTACHMENT bubbles ──
                  if (msg.isAttachment && msg.attachmentType) {

                    // IMAGE
                    if (msg.attachmentType === "image") {
                      elements.push(
                        <div key={msg.id} className={`flex w-full gap-2 ${isSelf ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                          {!isSelf && (
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-auto
                              ${isLastInGroup ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "opacity-0 pointer-events-none"}`}>
                              {selectedFriend.avatar}
                            </div>
                          )}
                          <div className={`max-w-[65%] rounded-2xl shadow-sm overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800
                            ${isSelf ? "rounded-tr-none" : "rounded-tl-none"}`}>
                            {msg.fileUrl || msg.fileData ? (
                              <img
                                src={msg.fileUrl || msg.fileData}
                                alt={msg.fileName || "Image"}
                                className="w-full max-h-64 object-cover block cursor-zoom-in hover:opacity-95 transition-opacity"
                                onClick={() => {
                                  if (msg.fileUrl) {
                                    window.open(msg.fileUrl, "_blank");
                                  } else if (msg.fileData) {
                                    openBase64File(msg.fileData, msg.fileMimeType || "image/png", msg.fileName);
                                  }
                                }}
                              />
                            ) : (
                              <div className="flex items-center gap-2 px-4 py-3">
                                <Image size={18} className="text-teal-500" />
                                <p className="text-[13px] text-foreground">{msg.content}</p>
                              </div>
                            )}
                            <div className="px-3 pb-2">{ts}</div>
                          </div>
                        </div>
                      );
                      return;
                    }

                    // VIDEO
                    if (msg.attachmentType === "video") {
                      elements.push(
                        <div key={msg.id} className={`flex w-full gap-2 ${isSelf ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                          {!isSelf && (
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-auto
                              ${isLastInGroup ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "opacity-0 pointer-events-none"}`}>
                              {selectedFriend.avatar}
                            </div>
                          )}
                          <div className={`max-w-[65%] rounded-2xl shadow-sm overflow-hidden border border-black/20 bg-black
                            ${isSelf ? "rounded-tr-none" : "rounded-tl-none"}`}>
                            {msg.fileUrl || msg.fileData
                              ? <video src={msg.fileUrl || msg.fileData} controls className="w-full max-h-52 block" />
                              : <div className="flex items-center gap-2 px-4 py-3 bg-slate-900"><Video size={18} className="text-blue-400" /><p className="text-[13px] text-white">{msg.content}</p></div>}
                            <div className="px-3 pb-2 bg-black/30">{ts}</div>
                          </div>
                        </div>
                      );
                      return;
                    }

                    // AUDIO
                    if (msg.attachmentType === "audio") {
                      elements.push(
                        <div key={msg.id} className={`flex w-full gap-2 ${isSelf ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                          {!isSelf && (
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-auto
                              ${isLastInGroup ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "opacity-0 pointer-events-none"}`}>
                              {selectedFriend.avatar}
                            </div>
                          )}
                          <div className={`rounded-2xl shadow-sm overflow-hidden border
                            ${isSelf ? "rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b] border-[#c5e8bf] dark:border-emerald-800/30"
                                     : "rounded-tl-none bg-white dark:bg-slate-800 border-border/30"}`}>
                            <div className="flex items-center gap-3 px-4 py-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                <Mic size={16} className="text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                {msg.fileUrl || msg.fileData
                                  ? <audio src={msg.fileUrl || msg.fileData} controls className="h-7 w-44" style={{ accentColor: "#10b981" }} />
                                  : <div className="flex items-end gap-[2px] h-4">{[3,5,7,4,8,5,6,3,7,5].map((h,i) => <span key={i} className="bg-emerald-500/60 rounded-full" style={{ width:"2px", height:`${h*2}px` }} />)}</div>}
                                <p className="text-[10px] text-muted-foreground mt-0.5">{msg.audioDuration ? formatTime(msg.audioDuration) : "Voice message"}</p>
                              </div>
                            </div>
                            <div className="px-4 pb-2">{ts}</div>
                          </div>
                        </div>
                      );
                      return;
                    }

                    // DOCUMENT — opens via window.open (base64 or blobUrl)
                    if (msg.attachmentType === "document") {
                      elements.push(
                        <div key={msg.id} className={`flex w-full gap-2 ${isSelf ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                          {!isSelf && (
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-auto
                              ${isLastInGroup ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "opacity-0 pointer-events-none"}`}>
                              {selectedFriend.avatar}
                            </div>
                          )}
                          <div className={`max-w-[65%] rounded-2xl shadow-sm overflow-hidden border
                            ${isSelf ? "rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b] border-[#c5e8bf] dark:border-emerald-800/30"
                                     : "rounded-tl-none bg-white dark:bg-slate-800 border-border/30"}`}>
                            <div className="flex items-center gap-3 px-4 py-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                <FileText size={19} className="text-blue-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-foreground truncate max-w-[180px]">{msg.fileName || "Document"}</p>
                                <p className="text-[10px] text-muted-foreground">{msg.fileSize ? formatFileSize(msg.fileSize) : ""}</p>
                              </div>
                              {(msg.fileUrl || msg.fileData || msg.blobUrl) && (
                                <button
                                  onClick={() => {
                                    if (msg.fileUrl) {
                                      window.open(msg.fileUrl, "_blank");
                                    } else if (msg.fileData) {
                                      openBase64File(msg.fileData, msg.fileMimeType || "application/octet-stream", msg.fileName);
                                    } else if (msg.blobUrl) {
                                      window.open(msg.blobUrl, "_blank");
                                    }
                                  }}
                                  title="Open document"
                                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors active:scale-90"
                                >
                                  <Download size={14} />
                                </button>
                              )}
                            </div>
                            <div className="px-4 pb-2">{ts}</div>
                          </div>
                        </div>
                      );
                      return;
                    }

                    // CONTACT / SHARED FRIEND CARD
                    if (msg.attachmentType === "contact") {
                      const sharedName = msg.fileName || "Study Partner";
                      const sharedUsername = msg.fileMimeType || "unknown";
                      const sharedAvatar = msg.fileData || "?";
                      elements.push(
                        <div key={msg.id} className={`flex w-full gap-2 ${isSelf ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                          {!isSelf && (
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-auto
                              ${isLastInGroup ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "opacity-0 pointer-events-none"}`}>
                              {selectedFriend.avatar}
                            </div>
                          )}
                          <div className={`max-w-[65%] rounded-2xl shadow-sm overflow-hidden border
                            ${isSelf ? "rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b] border-[#c5e8bf] dark:border-emerald-800/30"
                                     : "rounded-tl-none bg-white dark:bg-slate-800 border-border/30"}`}>
                            <div className="flex flex-col p-3 gap-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                                  {sharedAvatar}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Shared Partner</p>
                                  <p className="text-[13px] font-semibold text-foreground truncate">{sharedName}</p>
                                  <p className="text-[11px] text-muted-foreground truncate">@{sharedUsername}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const targetUser = friends.find(f => f.id === sharedUsername);
                                  if (targetUser) {
                                    setSelectedFriend(targetUser);
                                  } else {
                                    // Set inputs to add friend modal
                                    setAddUsernameInput(sharedUsername);
                                    setShowContactsModal(true);
                                  }
                                }}
                                className="w-full mt-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                              >
                                <MessageSquare size={12} /> Message
                              </button>
                            </div>
                            <div className="px-3 pb-2">{ts}</div>
                          </div>
                        </div>
                      );
                      return;
                    }
                    return; // unknown attachment type
                  }

                  // ── Plain text bubble ──
                  elements.push(
                    <div
                      key={msg.id}
                      className={`flex w-full gap-2 ${isSelf ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}
                    >
                      {/* Friend avatar — shown only for last message in a group */}
                      {!isSelf && (
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white self-end
                          ${isLastInGroup ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "opacity-0 pointer-events-none"}`}>
                          {selectedFriend.avatar}
                        </div>
                      )}
                      <div className={`
                        max-w-[65%] rounded-2xl px-3.5 py-2 text-[13px] shadow-sm leading-relaxed
                        ${isSelf
                          ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-neutral-800 dark:text-neutral-100 rounded-tr-none"
                          : "bg-white dark:bg-slate-800 text-neutral-800 dark:text-neutral-200 rounded-tl-none"}
                      `}>
                        {msg.content}
                        <div className="flex items-center justify-end gap-1 mt-1 select-none">
                          <span className="text-[9px] text-muted-foreground/70 font-semibold">
                            {msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isSelf && <CheckCheck size={11} className="text-blue-400" />}
                        </div>
                      </div>
                    </div>
                  );
                });

                return elements;
              })()}

              {/* Typing indicator */}
              {isTyping[selectedFriend.id] && (
                <div className="flex w-full gap-2 justify-start mt-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white self-end">
                    {selectedFriend.avatar}
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              
              <div ref={chatBottomRef} />
            </div>

            {/* Bottom input area — recording-aware */}
            <div className="bg-[#f0f2f5] dark:bg-slate-900 px-4 py-3 border-t border-[#e9edef] dark:border-slate-800/80 z-10 relative">

              {isRecording ? (
                /* ── Voice recording UI ── */
                <div className="flex items-center gap-3">
                  {/* Cancel */}
                  <button
                    onClick={() => stopVoiceRecording(true)}
                    title="Cancel Recording"
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-colors active:scale-90"
                  >
                    <X size={20} />
                  </button>

                  {/* Waveform + timer */}
                  <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800/50 rounded-xl px-3 py-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    <div className="flex items-end gap-[2px] h-5 flex-shrink-0">
                      {[4,7,5,9,4,6,8,5,7,4,6,8].map((h, i) => (
                        <span
                          key={i}
                          className="bg-red-400 rounded-full animate-pulse"
                          style={{ width: "2.5px", height: `${Math.max(4, h * 2)}px`, animationDelay: `${i * 0.07}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-red-500 tabular-nums ml-1">{formatTime(recordingDuration)}</span>
                    <span className="text-[11px] text-muted-foreground ml-auto italic hidden sm:block">Recording...</span>
                  </div>

                  {/* Send */}
                  <button
                    onClick={() => stopVoiceRecording(false)}
                    title="Send Voice Message"
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors active:scale-90"
                  >
                    <Send size={17} />
                  </button>
                </div>
              ) : (
                /* ── Normal message input UI ── */
                <div className="flex items-center gap-3">

                  {/* Emoji icon and picker panel */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowEmojiPicker(v => !v); setShowAttachmentMenu(false); }}
                      title="Emojis" 
                      className={`text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full active:scale-90
                        ${showEmojiPicker ? "text-emerald-500" : ""}
                      `}
                    >
                      <Smile size={21} />
                    </button>

                    {showEmojiPicker && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setShowEmojiPicker(false)} />
                        <div className="absolute bottom-12 left-0 z-30 bg-white dark:bg-slate-800 border border-[#e9edef] dark:border-slate-700/85 p-3 rounded-2xl shadow-xl w-64">
                          <div className="grid grid-cols-6 gap-2">
                            {EMOJIS.map(emoji => (
                              <button 
                                key={emoji}
                                onClick={() => handleEmojiClick(emoji)}
                                className="text-lg hover:bg-muted p-1 rounded-lg transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Attachment paperclip icon and menu panel */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowAttachmentMenu(v => !v); setShowEmojiPicker(false); }}
                      title="Attach File" 
                      className={`text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full active:scale-90
                        ${showAttachmentMenu ? "text-emerald-500" : "rotate-45"}
                      `}
                    >
                      <Paperclip size={19} />
                    </button>

                    {showAttachmentMenu && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setShowAttachmentMenu(false)} />
                        <div className="absolute bottom-14 left-0 z-30 bg-white dark:bg-slate-800 border border-[#e9edef] dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden py-2 w-52 flex flex-col">
                          <button 
                            onClick={() => handleSendAttachment("document")}
                            className="px-4 py-3 text-foreground hover:bg-[#f5f6f8] dark:hover:bg-slate-700 flex items-center gap-3 text-left transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                              <FileText size={16} className="text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">Document</p>
                              <p className="text-[10px] text-muted-foreground">PDF, Word, Excel...</p>
                            </div>
                          </button>
                          <button 
                            onClick={() => handleSendAttachment("image")}
                            className="px-4 py-3 text-foreground hover:bg-[#f5f6f8] dark:hover:bg-slate-700 flex items-center gap-3 text-left transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0">
                              <Image size={16} className="text-teal-500" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">Photo or Video</p>
                              <p className="text-[10px] text-muted-foreground">From your gallery</p>
                            </div>
                          </button>
                          <button 
                            onClick={() => handleSendAttachment("contact")}
                            className="px-4 py-3 text-foreground hover:bg-[#f5f6f8] dark:hover:bg-slate-700 flex items-center gap-3 text-left transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                              <User size={16} className="text-orange-500" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">Share Partner</p>
                              <p className="text-[10px] text-muted-foreground">Share a partner profile</p>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Text input */}
                  <div className="flex-1">
                    <input 
                      type="text"
                      placeholder="Type a message"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-[#e9edef] dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm text-foreground placeholder:text-muted-foreground/60"
                    />
                  </div>

                  {/* Send button when typing, Mic button when input is empty */}
                  {inputText.trim() ? (
                    <button 
                      onClick={handleSendMessage}
                      title="Send Message"
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center active:scale-90 transition-all"
                    >
                      <Send size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={startVoiceRecording}
                      title="Record Voice Message"
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white flex items-center justify-center active:scale-90 transition-all"
                    >
                      <Mic size={18} />
                    </button>
                  )}

                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f8f9fa] dark:bg-slate-950 border-l border-[#e9edef]/80 dark:border-slate-800">
            <div className="max-w-md space-y-4">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/20 shadow-inner animate-pulse">
                <Users size={36} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">WhatsApp for LMS</h2>
              <p className="text-sm text-muted-foreground">
                Collaborate with study partners in real time. Select any contact from the left list to send documents, insert study emojis, start simulated study calls, or review logs.
              </p>
              <div className="pt-4 flex justify-center">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 bg-[#f0f2f5] dark:bg-slate-850 px-4 py-1.5 rounded-full border border-border/40 font-medium">
                  <Shield size={12} className="text-emerald-500" />
                  <span>End-to-end encrypted signalling channel</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── NEW CHAT / CONTACTS LIST MODAL ── */}
      {showContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal header */}
            <div className="bg-[#f0f2f5] dark:bg-slate-850 px-5 py-4 border-b border-[#e9edef] dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-emerald-500" size={18} />
                <h3 className="font-bold text-foreground text-sm">Add Partner by Username</h3>
              </div>
              <button 
                onClick={() => {
                  setShowContactsModal(false);
                  setAddFriendStatus(null);
                  setAddUsernameInput("");
                }}
                className="text-xs font-semibold px-3 py-1.5 bg-[#e1e3e6] dark:bg-slate-800 rounded-lg hover:opacity-90 active:scale-95 transition-all text-foreground"
              >
                Close
              </button>
            </div>

            {/* Form Section */}
            <div className="p-5 border-b border-[#e9edef] dark:border-slate-800 space-y-3">
              <p className="text-xs text-muted-foreground">Type your study partner's exact username to add them to your WhatsApp chat list.</p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter username (e.g. Akshat)" 
                  value={addUsernameInput}
                  onChange={(e) => setAddUsernameInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-foreground"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddFriend();
                  }}
                />
                <Button 
                  onClick={handleAddFriend}
                  disabled={addingFriend || !addUsernameInput.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 rounded-xl py-2.5 flex items-center gap-1 active:scale-95 transition-transform"
                >
                  {addingFriend ? "Adding..." : "Add"}
                </Button>
              </div>

              {/* Status Message */}
              {addFriendStatus && (
                <div className={`p-3 rounded-xl text-xs font-medium border ${
                  addFriendStatus.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}>
                  {addFriendStatus.message}
                </div>
              )}
            </div>

            {/* Autocomplete Suggestions List when typing */}
            {addUsernameInput.trim() ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Matching Users</h4>
                {searchingSuggestions ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Searching matching users...</p>
                ) : searchSuggestions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No matching users found.</p>
                ) : (
                  searchSuggestions.map(s => (
                    <div 
                      key={s.id}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-border/40 hover:border-emerald-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold select-none">
                          {s.avatar}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            {s.fullName}
                            <span className="text-[9px] font-normal bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Lvl {s.level}</span>
                          </h4>
                          <p className="text-[10px] text-muted-foreground">@{s.username}</p>
                        </div>
                      </div>
                      
                      <div>
                        {s.relationStatus === "accepted" ? (
                          <button
                            onClick={() => {
                              const targetUser = friends.find(f => f.id === s.id);
                              if (targetUser) setSelectedFriend(targetUser);
                              setShowContactsModal(false);
                            }}
                            className="text-[10px] font-bold px-2.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                          >
                            <MessageSquare size={11} /> Chat
                          </button>
                        ) : s.relationStatus === "pending_sent" ? (
                          <span className="text-[10px] font-bold px-2.5 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                            Requested
                          </span>
                        ) : s.relationStatus === "pending_received" ? (
                          <button
                            onClick={() => handleRespondToRequest(s.requestId, "accept")}
                            className="text-[10px] font-bold px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg active:scale-95 transition-all shadow-sm"
                          >
                            Accept
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendRequestToUser(s.username)}
                            className="text-[10px] font-bold px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg active:scale-95 transition-all shadow-sm"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Added Partners reference list when not typing */
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">My Connected Partners</h4>
                {friends.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No study partners added yet. Type a username above to search and connect!</p>
                ) : (
                  friends.map(friend => (
                    <div 
                      key={friend.id}
                      onClick={() => {
                        setSelectedFriend(friend);
                        setShowContactsModal(false);
                      }}
                      className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-muted/45 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {friend.avatar}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-foreground">{friend.fullName}</h4>
                          <p className="text-[10px] text-muted-foreground">@{friend.id}</p>
                        </div>
                      </div>
                      {friend.online ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">Online</span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Offline</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── REAL-TIME WEBRTC CALLING OVERLAY MODAL ── */}
      {callState !== "idle" && activeCallFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-3xl aspect-video rounded-3xl bg-neutral-900 overflow-hidden shadow-2xl border border-neutral-800 flex flex-col justify-between">
            
            {/* Security banner */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white/70 bg-black/35 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
              <Shield size={12} className="text-emerald-500" />
              <span>Peer-to-Peer WebRTC Encrypted</span>
            </div>

            {/* Outgoing & Incoming State Screen */}
            {(callState === "outgoing" || callState === "incoming") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900/90 to-neutral-950 text-white p-6 space-y-6">
                <div className="relative flex items-center justify-center w-36 h-36">
                  <div className="absolute inset-0 w-full h-full rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="absolute inset-4 w-28 h-28 rounded-full bg-emerald-500/30 animate-pulse" />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                    {activeCallFriend.avatar}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{activeCallFriend.fullName}</h2>
                  <p className="text-sm text-neutral-400">
                    {callState === "outgoing" ? "Calling study partner…" : `Incoming ${isVideoCall ? "Video" : "Voice"} study invite…`}
                  </p>
                  {useSimulatedStream && (
                    <span className="inline-block text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-md mt-1 border border-emerald-500/30">
                      AI Study Buddy Simulation Mode Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-500 bg-neutral-800/40 px-3 py-1 rounded-full border border-neutral-700/30">
                  <Volume2 size={10} className="text-emerald-500 animate-bounce" />
                  Ringing active
                </div>

                {callState === "incoming" && (
                  <div className="flex items-center gap-4 pt-4">
                    <button 
                      onClick={declineCall}
                      className="w-14 h-14 rounded-2xl bg-destructive hover:bg-destructive/90 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                    >
                      <PhoneOff size={22} />
                    </button>
                    <button 
                      onClick={acceptCall}
                      className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform animate-bounce"
                    >
                      {isVideoCall ? <Video size={22} /> : <Phone size={22} />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Connected State Streams Viewport */}
            {callState === "connected" && (
              <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
                {isVideoCall ? (
                  <>
                    <video 
                      ref={remoteVideoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute bottom-20 right-4 w-32 md:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-neutral-900">
                      <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                      {!isVideoEnabled && (
                        <div className="absolute inset-0 bg-neutral-850 flex items-center justify-center text-white text-[10px] font-medium bg-neutral-900/90">
                          Cam Off
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white space-y-6">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-white/10">
                        {activeCallFriend.avatar}
                      </div>
                      <div className="absolute -inset-2 rounded-full border-2 border-emerald-500/45 animate-ping opacity-60 pointer-events-none" />
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-xl font-bold">{activeCallFriend.fullName}</h3>
                      <p className="text-xs text-emerald-400 flex items-center justify-center gap-1.5 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Connected ({formatTime(callDuration)})
                      </p>
                    </div>

                    {/* Equalizer animation */}
                    <div className="flex items-end gap-1 h-8 pt-4">
                      <span className="w-1.5 bg-emerald-500/70 rounded-full animate-[pulse_1.2s_infinite] h-4" />
                      <span className="w-1.5 bg-emerald-500/80 rounded-full animate-[pulse_0.8s_infinite] h-7" />
                      <span className="w-1.5 bg-emerald-500 rounded-full animate-[pulse_1s_infinite] h-8" />
                      <span className="w-1.5 bg-[#10b981] rounded-full animate-[pulse_0.6s_infinite] h-5" />
                      <span className="w-1.5 bg-emerald-500/70 rounded-full animate-[pulse_1.1s_infinite] h-3" />
                    </div>

                    <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
                    <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
                  </div>
                )}
              </div>
            )}

            {/* Calling Header bar */}
            <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/85 to-transparent text-white">
              <div>
                <h4 className="font-semibold text-sm truncate max-w-[200px]">
                  {activeCallFriend.fullName}
                </h4>
                <p className="text-[10px] text-neutral-400">
                  {callState === "connected" ? `Connected • ${formatTime(callDuration)}` : "Connecting…"}
                </p>
              </div>
              <div className="text-xs font-bold bg-neutral-800/80 px-3 py-1 rounded-full border border-neutral-700/30">
                {isVideoCall ? "Video Call" : "Voice Call"}
              </div>
            </div>

            {/* Calling Controls bar */}
            <div className="relative z-10 flex items-center justify-center gap-4 p-5 bg-gradient-to-t from-black/90 via-black/45 to-transparent text-white">
              
              <button 
                onClick={toggleMute}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150 active:scale-95
                  ${isMuted 
                    ? "bg-destructive text-white hover:bg-destructive/90" 
                    : "bg-neutral-800/80 text-white hover:bg-neutral-700"
                  }
                `}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button 
                onClick={endCall}
                title="End Call"
                className="w-14 h-14 rounded-2xl bg-destructive hover:bg-destructive/90 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
              >
                <PhoneOff size={22} />
              </button>

              {isVideoCall && (
                <button 
                  onClick={toggleCamera}
                  title={isVideoEnabled ? "Turn Camera Off" : "Turn Camera On"}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150 active:scale-95
                    ${!isVideoEnabled 
                      ? "bg-destructive text-white hover:bg-destructive/90" 
                      : "bg-neutral-800/80 text-white hover:bg-neutral-700"
                    }
                  `}
                >
                  {isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── EDIT MY PROFILE NAME MODAL ── */}
      {showEditMyNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border p-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <User className="text-emerald-500" size={18} /> Edit My Profile Name
            </h3>
            <input 
              type="text" 
              value={myNewName}
              onChange={(e) => setMyNewName(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-foreground"
              placeholder="Enter your display name"
              onKeyDown={(e) => {
                if (e.key === "Enter" && myNewName.trim().length >= 3) handleSaveMyName();
              }}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowEditMyNameModal(false)}
                className="text-xs font-semibold px-3 py-2 bg-[#e1e3e6] dark:bg-slate-800 rounded-lg hover:opacity-90 active:scale-95 text-foreground"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveMyName}
                disabled={!myNewName.trim() || myNewName.trim().length < 3}
                className="text-xs font-semibold px-4 py-2 bg-emerald-500 text-white rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PARTNER NAME MODAL ── */}
      {showEditPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border p-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <User className="text-emerald-500" size={18} /> Edit Partner Name
            </h3>
            <input 
              type="text" 
              value={partnerNewName}
              onChange={(e) => setPartnerNewName(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-foreground"
              placeholder="Enter custom nickname"
              onKeyDown={(e) => {
                if (e.key === "Enter" && partnerNewName.trim()) handleSavePartnerNickname(partnerNewName);
              }}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowEditPartnerModal(false)}
                className="text-xs font-semibold px-3 py-2 bg-[#e1e3e6] dark:bg-slate-800 rounded-lg hover:opacity-90 active:scale-95 text-foreground"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSavePartnerNickname(partnerNewName)}
                disabled={!partnerNewName.trim()}
                className="text-xs font-semibold px-4 py-2 bg-emerald-500 text-white rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHARE FRIEND MODAL ── */}
      {showShareFriendModal && selectedFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 bg-[#f0f2f5] dark:bg-slate-800 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <User className="text-emerald-500" size={17} /> Share Partner Profile
              </h3>
              <button onClick={() => setShowShareFriendModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 max-h-[300px] overflow-y-auto divide-y divide-muted/30">
              {friends.filter(f => f.id !== selectedFriend.id).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No other friends added to share.</p>
              ) : (
                friends.filter(f => f.id !== selectedFriend.id).map(f => (
                  <div 
                    key={f.id}
                    onClick={() => handleShareFriend(f)}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-[#f5f6f8] dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs select-none">
                        {f.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{f.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">@{f.id}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full">Share</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-6 py-3 bg-[#f0f2f5] dark:bg-slate-800 border-t border-border flex justify-end">
              <button 
                onClick={() => setShowShareFriendModal(false)}
                className="text-xs font-semibold px-4 py-2 bg-emerald-500 text-white rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FRIEND REQUESTS MODAL ── */}
      {showRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 bg-[#f0f2f5] dark:bg-slate-800 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500" size={17} /> Partner Requests
              </h3>
              <button onClick={() => setShowRequestsModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 max-h-[350px] overflow-y-auto divide-y divide-muted/30">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Heart className="text-muted-foreground/30 mx-auto text-muted-foreground/30" size={40} />
                  <p className="text-xs text-muted-foreground">No pending partner requests.</p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.requestId} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {req.sender.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          {req.sender.fullName}
                          <span className="text-[9px] font-normal bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Level {req.sender.level}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">@{req.sender.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRespondToRequest(req.requestId, "accept")}
                        className="text-xs font-semibold px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg active:scale-95 transition-all shadow-sm"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRespondToRequest(req.requestId, "reject")}
                        className="text-xs font-semibold px-3 py-1.5 bg-destructive/10 hover:bg-destructive/15 text-destructive rounded-lg active:scale-95 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-6 py-3 bg-[#f0f2f5] dark:bg-slate-800 border-t border-border flex justify-end">
              <button 
                onClick={() => setShowRequestsModal(false)}
                className="text-xs font-semibold px-4 py-2 bg-emerald-500 text-white rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FRIEND LIST MODAL ── */}
      {showFriendListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 bg-[#f0f2f5] dark:bg-slate-800 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <UserCheck className="text-emerald-500" size={17} /> Connected Friends
              </h3>
              <button onClick={() => setShowFriendListModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 max-h-[350px] overflow-y-auto divide-y divide-muted/30">
              {friends.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <UserCheck className="text-muted-foreground/30 mx-auto" size={40} />
                  <p className="text-xs text-muted-foreground">No connected friends yet.</p>
                </div>
              ) : (
                friends.map(friend => (
                  <div 
                    key={friend.id}
                    onClick={() => {
                      setSelectedFriend(friend);
                      setShowFriendListModal(false);
                    }}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-[#f5f6f8] dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs select-none">
                        {friend.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{friend.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">@{friend.id}</p>
                      </div>
                    </div>
                    
                    <button className="text-[10px] font-bold px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg opacity-80 group-hover:opacity-100 transition-all flex items-center gap-1">
                      <MessageSquare size={10} /> Message
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-6 py-3 bg-[#f0f2f5] dark:bg-slate-850 border-t border-border flex justify-end">
              <button 
                onClick={() => setShowFriendListModal(false)}
                className="text-xs font-semibold px-4 py-2 bg-emerald-500 text-white rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
