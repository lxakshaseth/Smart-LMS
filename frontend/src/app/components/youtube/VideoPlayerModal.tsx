import React, { useState } from "react";
import { X, Bookmark, Share2, ThumbsUp, Sparkles, CheckCircle, Clock, Eye, Play } from "lucide-react";
import { VideoItem } from "./VideoCard";

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  relatedVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, video: VideoItem) => void;
}

export default function VideoPlayerModal({
  video,
  onClose,
  relatedVideos,
  onSelectVideo,
  isBookmarked,
  onToggleBookmark
}: VideoPlayerModalProps) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!video) return null;

  const embedUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`;

  const handleShare = () => {
    const shareUrl = video.url || `https://www.youtube.com/watch?v=${video.videoId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert("Video link copied to clipboard!");
    }
  };

  // Generate AI next-topic suggestions based on video title
  const aiTopics = [
    `${video.title.split(" ")[0]} Practice Questions`,
    "Core Concepts Summary",
    "Interview Problems & Tricks",
    "Advanced Deep Dive"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">In-App Player</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Close Player"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 overflow-y-auto p-4 sm:p-6 gap-6 scrollbar-thin">
          {/* Main Video & Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* YouTube Embedded iFrame */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-border/50">
              <iframe
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Title */}
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
              {video.title}
            </h1>

            {/* Channel Info & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center">
                  {video.channelAvatar || video.channel?.substring(0, 2).toUpperCase() || "YT"}
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm text-foreground">
                    <span>{video.channel || "YouTube Educator"}</span>
                    <CheckCircle size={14} className="text-blue-500 fill-blue-500/20" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{video.views || "10K"} views</span>
                    <span>•</span>
                    <span>{video.publishedAt || "Recent"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    liked
                      ? "bg-primary/15 border-primary/30 text-primary"
                      : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <ThumbsUp size={15} className={liked ? "fill-current" : ""} />
                  <span>{liked ? "Liked" : "Like"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="px-3.5 py-2 rounded-xl bg-muted/50 border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <Share2 size={15} />
                  <span>Share</span>
                </button>

                <button
                  onClick={(e) => onToggleBookmark(e, video)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isBookmarked
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Bookmark size={15} className={isBookmarked ? "fill-current" : ""} />
                  <span>{isBookmarked ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>

            {/* AI Next Topic Suggestions */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="text-xs font-bold text-foreground">AI Recommended Follow-up Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onClose();
                      onSelectVideo({ ...video, title: topic });
                    }}
                    className="px-3 py-1 rounded-xl bg-card border border-primary/20 text-foreground hover:bg-primary hover:text-primary-foreground text-xs font-medium transition-all"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Block */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-2">
              <p className={`leading-relaxed ${showFullDesc ? "" : "line-clamp-3"}`}>
                {video.description || "Comprehensive learning video and tutorial for students."}
              </p>
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="font-bold text-primary hover:underline text-xs"
              >
                {showFullDesc ? "Show less" : "Read more"}
              </button>
            </div>
          </div>

          {/* Related / Next Videos Sidebar (1 Col) */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>Related Learning Videos</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {relatedVideos.map((item) => (
                <div
                  key={item.videoId}
                  onClick={() => onSelectVideo(item)}
                  className="flex gap-3 p-2 rounded-xl hover:bg-muted/60 transition-all cursor-pointer group"
                >
                  <div className="relative aspect-video w-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {item.duration && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono">
                        {item.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate mt-1">{item.channel || "Educator"}</p>
                    <span className="text-[10px] text-muted-foreground">{item.views || "10K"} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
