import React from "react";

export default function SkeletonCard() {
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-xs animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-video bg-muted/70 w-full" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-muted/80 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted/80 rounded-md w-11/12" />
            <div className="h-3 bg-muted/60 rounded-md w-3/4" />
          </div>
        </div>
        <div className="h-3 bg-muted/50 rounded-md w-full" />
        <div className="flex justify-between items-center pt-2 border-t border-border/40">
          <div className="h-3 bg-muted/60 rounded-md w-20" />
          <div className="h-7 bg-muted/70 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}
