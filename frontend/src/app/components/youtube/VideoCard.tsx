import React from "react";
import { Play, Bookmark, Share2, CheckCircle, Clock, Eye } from "lucide-react";

export interface VideoItem {
  videoId: string;
  url?: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration?: string;
  views?: string;
  publishedAt?: string;
  channel?: string;
  channelAvatar?: string;
  subject?: string;
  level?: string;
  gradient?: string;
  emoji?: string;
}

interface VideoCardProps {
  video: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, video: VideoItem) => void;
}

export default function VideoCard({
  video,
  onSelectVideo,
  isBookmarked,
  onToggleBookmark
}: VideoCardProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = video.url || `https://www.youtube.com/watch?v=${video.videoId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert("Video link copied to clipboard!");
    }
  };

  return (
    <div
      onClick={() => onSelectVideo(video)}
      className="group bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback thumbnail if broken
              (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play size={20} className="fill-current ml-0.5" />
            </div>
          </div>

          {/* Duration Badge */}
          {video.duration && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono font-medium tracking-tight">
              {video.duration}
            </span>
          )}

          {/* Subject Badge */}
          {video.subject && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-card/90 backdrop-blur-xs text-foreground text-[10px] font-bold shadow-xs">
              {video.subject}
            </span>
          )}
        </div>

        {/* Content Container */}
        <div className="p-4 space-y-2.5">
          <div className="flex gap-2.5 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {video.channelAvatar || video.channel?.substring(0, 2).toUpperCase() || "YT"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <span className="truncate max-w-[140px]">{video.channel || "YouTube Educator"}</span>
                <CheckCircle size={12} className="text-blue-500 fill-blue-500/20 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
            {video.description || "Comprehensive learning video and tutorial."}
          </p>
        </div>
      </div>

      {/* Footer Stats & Actions */}
      <div className="px-4 pb-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px]">
            <Eye size={13} /> {video.views || "10K"}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Clock size={13} /> {video.publishedAt || "Recent"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Share Video"
          >
            <Share2 size={15} />
          </button>

          <button
            onClick={(e) => onToggleBookmark(e, video)}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? "bg-primary/15 text-primary"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark size={15} className={isBookmarked ? "fill-current" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
