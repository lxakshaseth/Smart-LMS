/**
 * useFriendsPolling
 *
 * Silent background polling hook for the Friends module.
 * Acts as a 5-second fallback sync layer ON TOP of Socket.IO.
 *
 * Behaviour:
 *  - Polls GET /api/friends/poll?since=<ISO> every 5 seconds
 *  - Deduplicates messages against existing state by ID
 *  - Never downgrades message status (sent < delivered < read)
 *  - Pauses automatically when:
 *      . document.hidden === true  (tab in background)
 *      . navigator.onLine === false (browser offline)
 *      . userId is falsy (logged out)
 *  - Resumes immediately when any pause condition clears
 *  - Cancels in-flight requests via AbortController on unmount
 *  - Returns zero re-renders when nothing changed (referential equality)
 */

import { useEffect, useRef, useCallback } from "react";
import { apiRequest } from "../lib/api";

// --- Minimal type mirrors (matching Friends.tsx interfaces) -------------------

export interface PollMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  isAttachment?: boolean;
  attachmentType?: string;
  fileName?: string;
  fileSize?: string | number;
  fileMimeType?: string;
  fileData?: string;
  fileUrl?: string;
  audioDuration?: number;
}

export interface PollGroupUpdate {
  groupId: string;
  lastMessage: string;
  lastMessageTime: string | null;
  unreadCount: number;
}

interface PollResponse {
  success: boolean;
  serverTime?: string;
  since: string;
  newMessages: PollMessage[];
  statusUpdates: { messageId: string; status: "delivered" | "read" }[];
  pendingRequestCount: number;
  groupUpdates: PollGroupUpdate[];
  newGroupMessages?: any[];
}

// --- Status rank (higher = more complete) -------------------------------------

const STATUS_RANK: Record<string, number> = { sent: 0, delivered: 1, read: 2 };

const POLL_INTERVAL_MS = 5000;

// --- Hook options -------------------------------------------------------------

export interface UseFriendsPollingOptions {
  /** Current logged-in user ID -- polling stops when undefined/null */
  userId: string | undefined;
  /**
   * Ref tracking the ID of the currently open friend DM.
   * Updated by Friends.tsx whenever selectedFriend changes.
   * Used to decide whether to increment the unread badge.
   */
  selectedFriendIdRef: React.MutableRefObject<string | null>;
  /**
   * Ref tracking the ID of the currently open group chat.
   * Updated by Friends.tsx whenever selectedGroup changes.
   * Used to suppress group unread count when that group is active.
   */
  selectedGroupIdRef: React.MutableRefObject<string | null>;
  /** State setter for private message map (keyed by friendId) */
  setMessages: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  /** State setter for group messages map (keyed by groupId) */
  setGroupMessages?: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  /** State setter for groups array */
  setGroups: React.Dispatch<React.SetStateAction<any[]>>;
  /** State setter for direct unread count map (keyed by friendId) */
  setDirectUnread: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  /**
   * Callback fired when pendingRequestCount changes.
   * Friends.tsx uses this to show a badge on the requests button.
   */
  onPendingCountChange: (count: number) => void;
}

// --- Hook --------------------------------------------------------------------

export function useFriendsPolling({
  userId,
  selectedFriendIdRef,
  selectedGroupIdRef,
  setMessages,
  setGroupMessages,
  setGroups,
  setDirectUnread,
  onPendingCountChange,
}: UseFriendsPollingOptions) {
  // ISO timestamp of the last successful poll -- used as the `since` param
  const lastPolledAt = useRef<string>(new Date(Date.now() - 10000).toISOString());

  // AbortController for the current in-flight request
  const abortRef = useRef<AbortController | null>(null);

  // Interval ID
  const intervalRef = useRef<number | null>(null);

  // Whether polling should be skipped on the next tick
  const pausedRef = useRef<boolean>(false);

  // Track last received pending count to avoid unnecessary callbacks
  const lastPendingCountRef = useRef<number>(-1);

  // Stable callback ref for onPendingCountChange to prevent recreating poll function on every render
  const onPendingCountChangeRef = useRef(onPendingCountChange);
  useEffect(() => {
    onPendingCountChangeRef.current = onPendingCountChange;
  });

  // Track previous userId to prevent resetting cursor on non-userId renders
  const prevUserIdRef = useRef<string | undefined>(undefined);

  // --- Core poll function ---------------------------------------------------

  const poll = useCallback(async () => {
    // Respect all pause conditions
    if (pausedRef.current) return;
    if (!userId) return;
    if (!navigator.onLine) return;
    if (document.hidden) return;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Capture the start time BEFORE the request so we do not miss messages
    // that arrive during the request round-trip
    const pollStart = new Date().toISOString();
    const since = lastPolledAt.current;

    try {
      const data = await apiRequest<PollResponse>(
        `/friends/poll?since=${encodeURIComponent(since)}`,
        { signal: controller.signal }
      );

      if (!data.success) return;

      // --- Merge new incoming DMs ------------------------------------------
      if (data.newMessages && data.newMessages.length > 0) {
        const incoming = data.newMessages;

        setMessages((prev) => {
          let changed = false;
          const updated = { ...prev };

          for (const msg of incoming) {
            const key = msg.senderId;
            const existing = updated[key] || [];

            // Dedup: skip if message ID already in state (Socket.IO beat us)
            if (existing.some((m: any) => m.id === msg.id)) continue;

            updated[key] = [...existing, msg];
            changed = true;

            // Increment unread badge only if this friend's chat is NOT open
            if (selectedFriendIdRef.current !== key) {
              setDirectUnread((prev2) => ({
                ...prev2,
                [key]: (prev2[key] || 0) + 1,
              }));
            }
          }

          // Return same reference if nothing changed -> zero re-render
          return changed ? updated : prev;
        });
      }

      // --- Merge incoming group messages -----------------------------------
      if (setGroupMessages && data.newGroupMessages && data.newGroupMessages.length > 0) {
        const incomingGrp = data.newGroupMessages;
        setGroupMessages((prev) => {
          let changed = false;
          const updated = { ...prev };

          for (const msg of incomingGrp) {
            const key = msg.groupId;
            const existing = updated[key] || [];

            if (existing.some((m: any) => m.id === msg.id)) continue;

            updated[key] = [...existing, msg];
            changed = true;
          }

          return changed ? updated : prev;
        });
      }

      // --- Merge status updates (blue ticks) --------------------------------
      // Only upgrade status, never downgrade (sent -> delivered -> read)
      if (data.statusUpdates && data.statusUpdates.length > 0) {
        const updates = data.statusUpdates;

        setMessages((prev) => {
          let changed = false;
          const result = { ...prev };

          for (const [friendId, msgs] of Object.entries(result)) {
            let conversationChanged = false;
            const updated = (msgs as any[]).map((msg) => {
              const upd = updates.find((u) => u.messageId === msg.id);
              if (!upd) return msg;

              const currentRank = STATUS_RANK[msg.status] ?? 0;
              const newRank = STATUS_RANK[upd.status] ?? 0;

              // Only upgrade -- never downgrade
              if (newRank > currentRank) {
                conversationChanged = true;
                return { ...msg, status: upd.status };
              }
              return msg;
            });

            if (conversationChanged) {
              result[friendId] = updated;
              changed = true;
            }
          }

          return changed ? result : prev;
        });
      }

      // --- Update group summaries (preview + unread badges) ----------------
      if (data.groupUpdates && data.groupUpdates.length > 0) {
        const updates = data.groupUpdates;
        const activeGroupId = selectedGroupIdRef.current;

        setGroups((prev) => {
          let changed = false;
          const result = prev.map((g) => {
            const upd = updates.find((u) => u.groupId === g.id);
            if (!upd) return g;

            const newUnread =
              activeGroupId === g.id
                ? 0 // Zero out if this group is currently open
                : upd.unreadCount;

            // Only update if something actually changed
            const previewChanged =
              upd.lastMessage !== g.lastMessage ||
              upd.lastMessageTime !== g.lastMessageTime;
            const unreadChanged = newUnread !== (g.unreadCount ?? 0);

            if (!previewChanged && !unreadChanged) return g;

            changed = true;
            return {
              ...g,
              lastMessage: upd.lastMessage || g.lastMessage,
              lastMessageTime: upd.lastMessageTime || g.lastMessageTime,
              unreadCount: newUnread,
            };
          });

          return changed ? result : prev;
        });
      }

      // --- Pending request count badge -------------------------------------
      if (
        typeof data.pendingRequestCount === "number" &&
        data.pendingRequestCount !== lastPendingCountRef.current
      ) {
        lastPendingCountRef.current = data.pendingRequestCount;
        onPendingCountChangeRef.current?.(data.pendingRequestCount);
      }

      // Advance cursor using server-side time if available (eliminates client clock drift)
      lastPolledAt.current = data.serverTime || pollStart;
    } catch (err: any) {
      // Intentional abort (e.g., component unmounted) -- silent
      if (err.name === "AbortError") return;
      // Network/auth errors -- silent (Socket.IO is still the primary channel)
      console.debug("[POLL] Silent fallback error:", err.message ?? err);
    }
  }, [
    userId,
    selectedFriendIdRef,
    selectedGroupIdRef,
    setMessages,
    setGroupMessages,
    setGroups,
    setDirectUnread,
  ]);

  // --- Lifecycle: start, pause, resume, cleanup ----------------------------

  useEffect(() => {
    if (!userId) return; // Do not poll if logged out

    // Only reset cursor when userId actually changes (e.g. login / account switch)
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId;
      lastPolledAt.current = new Date(Date.now() - 10000).toISOString();
      lastPendingCountRef.current = -1;
    }
    pausedRef.current = false;

    // Run an immediate initial poll on mount / login
    poll();

    // --- Visibility change: pause when tab is hidden, resume when active ---
    const onVisibility = () => {
      if (document.hidden) {
        pausedRef.current = true;
        abortRef.current?.abort(); // Cancel in-flight request immediately
      } else {
        pausedRef.current = false;
        poll(); // Fire an immediate catch-up poll on tab focus
      }
    };

    // --- Network events: pause when offline, resume when online -----------
    const onOffline = () => {
      pausedRef.current = true;
      abortRef.current?.abort();
    };
    const onOnline = () => {
      pausedRef.current = false;
      poll(); // Immediate catch-up after reconnect
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    // Start the polling interval
    intervalRef.current = window.setInterval(poll, POLL_INTERVAL_MS);

    // Cleanup: stop everything on unmount or userId change
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      abortRef.current?.abort();
      abortRef.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [userId, poll]);
}
