import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import { Youtube, Sparkles, Bookmark, History, Compass, Loader2, AlertCircle } from "lucide-react";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import VideoCard, { VideoItem } from "./VideoCard";
import VideoPlayerModal from "./VideoPlayerModal";
import SkeletonCard from "./SkeletonCard";
import RecommendationPanel from "./RecommendationPanel";
import { apiRequest } from "../../lib/api";
import { UNIVERSAL_RECOMMENDED_QUERIES, buildSanitizedSearchQuery } from "../../lib/examCategoryMap";

export default function YouTube() {
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

  // Recommendation Queries
  const [recommendedQueries, setRecommendedQueries] = useState<string[]>(UNIVERSAL_RECOMMENDED_QUERIES);

  // Infinite Scroll Observer Target
  const observerTarget = useRef<HTMLDivElement>(null);

  // Keep search input synced with URL ?q= parameter
  useEffect(() => {
    const qFromUrl = searchParams.get("q") || "";
    if (qFromUrl !== query) {
      setQuery(qFromUrl);
    }
  }, [searchParams]);

  // Load Bookmarks, History & Recommendations on initial mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const [bmRes, histRes, recRes] = await Promise.allSettled([
          apiRequest<{ success: boolean; savedVideos: VideoItem[] }>("/youtube/bookmarks"),
          apiRequest<{ success: boolean; watchHistory: VideoItem[] }>("/youtube/history"),
          apiRequest<{
            success: boolean;
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

        if (recRes.status === "fulfilled" && recRes.value?.success && recRes.value.recommendedQueries?.length) {
          setRecommendedQueries(recRes.value.recommendedQueries);
        }
      } catch (e) {
        console.error("Failed to load user video metadata:", e);
      }
    }
    loadUserData();
  }, []);

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
    []
  );

  // Trigger search when query, category, or sort changes
  useEffect(() => {
    if (activeTab === "explore" || activeTab === "recommendations") {
      const sanitizedQuery = buildSanitizedSearchQuery(query, selectedCategory);
      fetchVideos(sanitizedQuery, selectedCategory, sort);
    }
  }, [query, selectedCategory, sort, activeTab, fetchVideos]);

  // Infinite Scroll Handler via IntersectionObserver
  useEffect(() => {
    if (activeTab !== "explore") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPageToken && !loadingMore && !loading) {
          const sanitizedQuery = buildSanitizedSearchQuery(query, selectedCategory);
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
  }, [nextPageToken, loadingMore, loading, activeTab, query, selectedCategory, sort, fetchVideos]);

  // Handle Search input submit
  const handleSearchSubmit = (searchTerm: string) => {
    setSearchParams(searchTerm ? { q: searchTerm } : {});
    setSelectedCategory("");
    setActiveTab("explore");
    const sanitized = buildSanitizedSearchQuery(searchTerm, "");
    fetchVideos(sanitized, "", sort);
  };

  // Handle Category Chip Select
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActiveTab("explore");
    const sanitized = buildSanitizedSearchQuery(query, category);
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
              Universal AI-Powered Educational Video & Course Search
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
            <History size={14} /> Watch History ({watchHistory.length})
          </button>
        </div>
      </div>

      {/* Main Search Component */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        onSearch={handleSearchSubmit}
        sort={sort}
        setSort={setSort}
      />

      {/* AI Recommendation Banner */}
      {(activeTab === "explore" || activeTab === "recommendations") && (
        <RecommendationPanel
          recommendedQueries={recommendedQueries}
          onSelectQuery={(qStr) => handleSearchSubmit(qStr)}
        />
      )}

      {/* Horizontal Category Filter Chips */}
      {(activeTab === "explore" || activeTab === "recommendations") && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      )}

      {/* Video Content Grid */}
      {loading && displayedVideos.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : error && displayedVideos.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-3xl space-y-3 max-w-xl mx-auto my-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="font-bold text-lg text-foreground">Could not load videos</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
          <button
            onClick={() => fetchVideos(query, selectedCategory, sort)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-1.5"
          >
            Try Again
          </button>
        </div>
      ) : displayedVideos.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-3xl space-y-3 max-w-xl mx-auto my-8 shadow-xs">
          <h3 className="font-bold text-lg text-foreground">No learning videos found</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeTab === "bookmarks"
              ? "You haven't saved any videos yet. Click the bookmark icon on any video card to save it here."
              : activeTab === "history"
              ? "Your watch history is empty. Start watching videos to keep track of them here."
              : "Try searching for another topic like 'Java DSA', 'React 19', 'AI & Machine Learning', or 'Calculus'."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayedVideos.map((video) => (
              <VideoCard
                key={video.videoId}
                video={video}
                onSelectVideo={handleSelectVideo}
                isBookmarked={bookmarkedVideos.some((v) => v.videoId === video.videoId)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>

          {/* Infinite Scroll Spinner Target */}
          {activeTab === "explore" && nextPageToken && (
            <div ref={observerTarget} className="py-8 flex items-center justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-card border border-border px-4 py-2 rounded-full shadow-xs">
                  <Loader2 size={16} className="animate-spin text-primary" /> Loading more videos...
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          isBookmarked={bookmarkedVideos.some((v) => v.videoId === selectedVideo.videoId)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}
    </div>
  );
}
