import React, { useEffect, useState } from "react";
import { X, CheckCheck, Check, Clock, Eye, Send } from "lucide-react";
import { apiRequest } from "../../lib/api";

interface MessageUser {
  id: string;
  fullName: string;
  avatar: string;
  email?: string;
}

interface DeliveryReceipt {
  user: MessageUser;
  timestamp: string | null;
}

interface MessageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  messageId: string;
  messageContent?: string;
  messageTime?: string;
}

export const MessageInfoModal: React.FC<MessageInfoModalProps> = ({
  isOpen,
  onClose,
  groupId,
  messageId,
  messageContent,
  messageTime,
}) => {
  const [loading, setLoading] = useState(true);
  const [deliveredTo, setDeliveredTo] = useState<DeliveryReceipt[]>([]);
  const [seenBy, setSeenBy] = useState<DeliveryReceipt[]>([]);
  const [msgDetails, setMsgDetails] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && groupId && messageId) {
      fetchMessageInfo();
    }
  }, [isOpen, groupId, messageId]);

  const fetchMessageInfo = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest(`/groups/${groupId}/messages/${messageId}/info`);
      if (res.success) {
        setDeliveredTo(res.deliveredTo || []);
        setSeenBy(res.seenBy || []);
        setMsgDetails(res.message);
      } else {
        setError(res.message || "Failed to load message info");
      }
    } catch (err: any) {
      setError("Error loading details");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatTimestamp = (ts?: string | null) => {
    if (!ts) return "—";
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-[#e9edef] dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#f0f2f5] dark:bg-slate-800/90 px-6 py-4 flex items-center justify-between border-b border-[#e9edef] dark:border-slate-700/60">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCheck size={18} className="text-blue-500" />
              Message Info
            </h2>
            <p className="text-[11px] text-muted-foreground">Delivery & Read receipts</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Preview Card */}
        <div className="p-4 bg-[#efeae2]/50 dark:bg-slate-950/60 border-b border-[#e9edef] dark:border-slate-800">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-[#e9edef] dark:border-slate-700/80 max-w-[90%] ml-auto">
            <p className="text-xs text-foreground whitespace-pre-wrap">
              {msgDetails?.content || messageContent || "Message"}
            </p>
            <p className="text-[10px] text-muted-foreground text-right mt-1 flex items-center justify-end gap-1">
              <span>{formatTimestamp(msgDetails?.timestamp || messageTime)}</span>
            </p>
          </div>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="text-center py-8 text-xs text-muted-foreground animate-pulse">
              Loading message status...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-xs text-red-500">{error}</div>
          ) : (
            <>
              {/* READ / SEEN BY SECTION */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-blue-500 border-b border-blue-500/10 pb-2">
                  <CheckCheck size={16} />
                  <span>Read by ({seenBy.length})</span>
                </div>
                {seenBy.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic px-2">No members have read this yet</p>
                ) : (
                  <div className="space-y-2">
                    {seenBy.map((item, idx) => (
                      <div
                        key={item.user?.id || idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#f9fafb] dark:bg-slate-800/60 border border-[#e9edef] dark:border-slate-700/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs">
                            {item.user?.avatar || "LU"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{item.user?.fullName || "User"}</p>
                            <p className="text-[10px] text-muted-foreground">Read</p>
                          </div>
                        </div>
                        <div className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
                          <Clock size={11} />
                          <span>{formatTimestamp(item.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DELIVERED TO SECTION */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-500/10 pb-2">
                  <CheckCheck size={16} />
                  <span>Delivered to ({deliveredTo.length})</span>
                </div>
                {deliveredTo.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic px-2">Pending delivery</p>
                ) : (
                  <div className="space-y-2">
                    {deliveredTo.map((item, idx) => (
                      <div
                        key={item.user?.id || idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#f9fafb] dark:bg-slate-800/60 border border-[#e9edef] dark:border-slate-700/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-500 to-slate-700 text-white font-bold flex items-center justify-center text-xs">
                            {item.user?.avatar || "LU"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{item.user?.fullName || "User"}</p>
                            <p className="text-[10px] text-muted-foreground">Delivered</p>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock size={11} />
                          <span>{formatTimestamp(item.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
