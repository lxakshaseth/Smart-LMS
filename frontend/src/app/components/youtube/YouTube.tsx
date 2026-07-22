import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import { Youtube, Sparkles, Bookmark, History, Compass, RefreshCw, Loader2, AlertCircle, Film } from "lucide-react";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import VideoCard, { VideoItem } from "./VideoCard";
import VideoPlayerModal from "./VideoPlayerModal";
import SkeletonCard from "./SkeletonCard";
import RecommendationPanel from "./RecommendationPanel";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTargetExam } from "../../lib/targetExam";
import { getExamMapping, buildSanitizedSearchQuery } from "../../lib/examCategoryMap";

export default function YouTube() {
  const { user } = useAuth();
  const targetExam = getCurrentTargetExam(user);
  const examMapping = getExamMapping(targetExam);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState("relevance");
  const [activeTab, setActiveTab] = useState<"explore" | "recommendations" | "bookmarks" | "history">("explore");

  // Video Data state
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [nextPageToken, setNextPageToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Player & Bookmarks state
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<VideoItem[]>([]);
  const [watchHistory, setWatchHistory] = useState<VideoItem[]>([]);

  // Recommendation Metadata state
  const [recData, setRecData] = useState<{
    targetExam: string;
    weakSubject: string;
    recommendedQueries: string[];
  }>({
    targetExam: targetExam || "General",
    weakSubject: user?.weakSubject || "None",
    recommendedQueries: examMapping.recommendedQueries
  });

  // Infinite Scroll Observer Target
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset category & queries whenever active Target Exam changes
  useEffect(() => {
    setSelectedCategory("");
    const newMapping = getExamMapping(targetExam);
    setRecData({
      targetExam,
      weakSubject: user?.weakSubject || "None",
      recommendedQueries: newMapping.recommendedQueries
    });
  }, [targetExam, user?.weakSubject]);

  // Keep search input synced with URL ?q= parameter
  useEffect(() => {
    const qFromUrl = searchParams.get("q") || "";
    if (qFromUrl !== query) {
      setQuery(qFromUrl);
    }
  }, [searchParams]);

  // Load Bookmarks & History on initial mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const [bmRes, histRes, recRes] = await Promise.allSettled([
          apiRequest<{ success: boolean; savedVideos: VideoItem[] }>("/youtube/bookmarks"),
          apiRequest<{ success: boolean; watchHistory: VideoItem[] }>("/youtube/history"),
          apiRequest<{
            success: boolean;
            targetExam: string;
            weakSubject: string;
            recommendedQueries: string[];
          }>("/youtube/recommendations")
        ]);

        if (bmRes.status === "fulfilled" && bmRes.value?.success) {
          setBookmarkedVideos(bmRes.value.savedVideos || []);
        } else {
          const localBm = localStorage.getItem("yt_bookmarks");
          if (localBm) setBookmarkedVideos(JSON.parse(localBm));
        }

        if (histRes.status === "fulfilled" && histRes.value?.success) {
          setWatchHistory(histRes.value.watchHistory || []);
        } else {
          const localHist = localStorage.getItem("yt_history");
          if (localHist) setWatchHistory(JSON.parse(localHist));
        }

        if (recRes.status === "fulfilled" && recRes.value?.success) {
          setRecData({
            targetExam: recRes.value.targetExam || targetExam,
            weakSubject: recRes.value.weakSubject || "None",
            recommendedQueries: recRes.value.recommendedQueries || examMapping.recommendedQueries
          });
        }
      } catch (e) {
        console.error("Failed to load user video metadata:", e);
      }
    }
    loadUserData();
  }, [targetExam]);

  // Main API Video Fetcher
  const fetchVideos = useCallback(
    async (searchTerm: string, cat: string, sortOrder: string, pageTkn: string = "", append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const queryParams = new URLSearchParams({
          q: searchTerm,
          category: cat,
          sort: sortOrder,
          pageToken: pageTkn,
          targetExam,
          maxResults: "12"
        });

        const res = await apiRequest<{
          success: boolean;
          videos: VideoItem[];
          nextPageToken: string;
          message?: string;
        }>(`/youtube/search?${queryParams.toString()}`);

        if (res && res.success) {
          if (append) {
            setVideos((prev) => [...prev, ...(res.videos || [])]);
          } else {
            setVideos(res.videos || []);
          }
          setNextPageToken(res.nextPageToken || "");
        } else {
          throw new Error(res?.message || "Failed to fetch learning videos");
        }
      } catch (err: any) {
        console.error("Error fetching YouTube videos:", err);
        setError(err.message || "Failed to load videos. Please check your network or try another query.");
        if (!append) setVideos([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [targetExam]
  );

  // Trigger search when query, category, or sort changes
  useEffect(() => {
    if (activeTab === "explore" || activeTab === "recommendations") {
      const sanitizedQuery = buildSanitizedSearchQuery(query, selectedCategory, targetExam, user?.weakSubject || "");
      fetchVideos(sanitizedQuery, selectedCategory, sort);
    }
  }, [query, selectedCategory, sort, activeTab, fetchVideos, targetExam, user?.weakSubject]);

  // Infinite Scroll Handler via IntersectionObserver
  useEffect(() => {
    if (activeTab !== "explore") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPageToken && !loadingMore && !loading) {
          const sanitizedQuery = buildSanitizedSearchQuery(query, selectedCategory, targetExam, user?.weakSubject || "");
          fetchVideos(sanitizedQuery, selectedCategory, sort, nextPageToken, true);
        }
      },
      { threshold: 0.5 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [nextPageToken, loadingMore, loading, activeTab, query, selectedCategory, sort, fetchVideos, targetExam, user?.weakSubject]);

  // Handle Search input submit
  const handleSearchSubmit = (searchTerm: string) => {
    setSearchParams(searchTerm ? { q: searchTerm } : {});
    setSelectedCategory("");
    setActiveTab("explore");
    const sanitized = buildSanitizedSearchQuery(searchTerm, "", targetExam, user?.weakSubject || "");
    fetchVideos(sanitized, "", sort);
  };

  // Handle Category Chip Select
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActiveTab("explore");
    const sanitized = buildSanitizedSearchQuery(query, category, targetExam, user?.weakSubject || "");
    fetchVideos(sanitized, category, sort);
  };

  // Toggle Video Bookmark
  const handleToggleBookmark = async (e: React.MouseEvent, video: VideoItem) => {
    e.stopPropagation();
    const isBookmarked = bookmarkedVideos.some((v) => v.videoId === video.videoId);
    let updated: VideoItem[] = [];

    if (isBookmarked) {
      updated = bookmarkedVideos.filter((v) => v.videoId !== video.videoId);
    } else {
      updated = [video, ...bookmarkedVideos];
    }
    setBookmarkedVideos(updated);

    try {
      localStorage.setItem("yt_bookmarks", JSON.stringify(updated));
      await apiRequest("/youtube/bookmark", {
        method: "POST",
        body: JSON.stringify({ video })
      });
    } catch (err) {
      console.error("Failed to sync bookmark to server:", err);
    }
  };

  // Open Video Player Modal and record Watch History
  const handleSelectVideo = async (video: VideoItem) => {
    setSelectedVideo(video);
    const filteredHist = watchHistory.filter((v) => v.videoId !== video.videoId);
    const updatedHist = [video, ...filteredHist].slice(0, 30);
    setWatchHistory(updatedHist);

    try {
      localStorage.setItem("yt_history", JSON.stringify(updatedHist));
      await apiRequest("/youtube/history", {
        method: "POST",
        body: JSON.stringify({ video, progressSeconds: 0, totalSeconds: 600 })
      });
    } catch (err) {
      console.error("Failed to sync watch history to server:", err);
    }
  };

  // Determine current active video list depending on active tab
  let displayedVideos = videos;
  if (activeTab === "bookmarks") {
    displayedVideos = bookmarkedVideos;
  } else if (activeTab === "history") {
    displayedVideos = watchHistory;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
            <Youtube size={26} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Learning Videos</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalized YouTube Learning Feed for <span className="font-semibold text-primary underline">{targetExam}</span>
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center p-1.5 bg-card border border-border rounded-2xl shadow-xs self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "explore"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Compass size={14} /> Explore Feed
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "recommendations"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Sparkles size={14} /> AI Recommended
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "bookmarks"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Bookmark size={14} /> Saved ({bookmarkedVideos.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <History size={14} /> History ({watchHistory.length})
          </button>
        </div>
      </div>

      {/* Large Rounded Search Bar */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        onSearch={handleSearchSubmit}
        sort={sort}
        setSort={setSort}
      />

      {/* Exam-Specific Category Chips Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        targetExam={targetExam}
      />

      {/* Personalized AI Recommendations Hero Strip */}
      {activeTab === "recommendations" && (
        <RecommendationPanel
          targetExam={recData.targetExam}
          weakSubject={recData.weakSubject}
          recommendedQueries={recData.recommendedQueries}
          onSelectQuery={(qStr) => {
            setQuery(qStr);
            handleSearchSubmit(qStr);
          }}
        />
      )}

      {/* Video Grid Section */}
      <div className="space-y-4">
        {/* Error Alert Bar */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                const sanitized = buildSanitizedSearchQuery(query, selectedCategory, targetExam, user?.weakSubject || "");
                fetchVideos(sanitized, selectedCategory, sort);
              }}
              className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Loading State: Skeleton Shimmer Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : displayedVideos.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card/50 border border-dashed border-border/80 rounded-3xl my-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
              <Film size={28} />
            </div>
            <h3 className="text-lg font-bold text-foreground">No videos found for {targetExam}</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {activeTab === "bookmarks"
                ? "You haven't saved any videos yet. Click the bookmark icon on any video to save it here!"
                : activeTab === "history"
                ? "Your watch history is empty. Start watching videos to track your history!"
                : `No learning videos matched your search query for ${targetExam}. Try another keyword or category.`}
            </p>
            <button
              onClick={() => {
                setQuery("");
                setSelectedCategory("");
                setActiveTab("explore");
                const sanitized = buildSanitizedSearchQuery("", "", targetExam, user?.weakSubject || "");
                fetchVideos(sanitized, "", sort);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
            >
              Reset Search & Category
            </button>
          </div>
        ) : (
          /* Responsive Video Grid (4 cols desktop, 2 tablet, 1 mobile) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedVideos.map((video) => {
              const isBm = bookmarkedVideos.some((v) => v.videoId === video.videoId);
              return (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  onSelectVideo={handleSelectVideo}
                  isBookmarked={isBm}
                  onToggleBookmark={handleToggleBookmark}
                />
              );
            })}
          </div>
        )}

        {/* Infinite Scroll Loader & Sentinel */}
        {activeTab === "explore" && nextPageToken && (
          <div ref={observerTarget} className="py-8 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-4 py-2 rounded-full shadow-xs">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span>Loading more {targetExam} learning videos...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* In-App YouTube Embedded Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          relatedVideos={videos.filter((v) => v.videoId !== selectedVideo.videoId)}
          onSelectVideo={handleSelectVideo}
          isBookmarked={bookmarkedVideos.some((v) => v.videoId === selectedVideo.videoId)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}
    </div>
  );
}
