const axios = require("axios");
const yts = require("yt-search");

/**
 * Parses ISO 8601 duration e.g. "PT14M20S" -> "14:20" or "PT1H5M30S" -> "1:05:30"
 */
function parseISO8601Duration(isoDuration) {
  if (!isoDuration) return "10:00";
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);
  if (!matches) return "10:00";

  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  if (hours > 0) {
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
  return `${minutes}:${formattedSeconds}`;
}

/**
 * Formats view count numbers into clean strings e.g. 1450000 -> 1.5M, 45000 -> 45K
 */
function formatViewCount(views) {
  const num = Number(views) || 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return `${num}`;
}

/**
 * Returns a sleek color gradient for UI cards
 */
function getRandomGradient() {
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-purple-600 to-indigo-700",
    "from-emerald-600 to-teal-700",
    "from-amber-500 to-orange-600",
    "from-rose-600 to-pink-700",
    "from-cyan-600 to-blue-700",
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

/**
 * Main YouTube Search Service using Official YouTube Data API v3 with yt-search fallback
 */
exports.searchYouTube = async ({
  query = "",
  category = "",
  pageToken = "",
  maxResults = 12,
  sort = "relevance",
  difficulty = ""
}) => {
  const apiKey = process.env.YOUTUBE_API_KEY;

  let finalQuery = query.trim() || category || "Educational Tutorials Courses";

  // 1. Try Official YouTube Data API v3
  if (apiKey && apiKey.length > 20) {
    try {
      let apiSort = "relevance";
      if (sort === "date" || sort === "newest") apiSort = "date";
      if (sort === "viewCount" || sort === "mostViewed") apiSort = "viewCount";
      if (sort === "rating") apiSort = "rating";

      const searchUrl = `https://www.googleapis.com/youtube/v3/search`;
      const searchRes = await axios.get(searchUrl, {
        params: {
          part: "snippet",
          maxResults: Math.min(maxResults, 25),
          q: finalQuery,
          type: "video",
          order: apiSort,
          pageToken: pageToken || undefined,
          key: apiKey
        },
        timeout: 7000
      });

      const items = searchRes.data.items || [];
      const nextPageToken = searchRes.data.nextPageToken || "";
      const videoIds = items.map(item => item.id.videoId).filter(Boolean);

      if (videoIds.length > 0) {
        let detailsMap = {};
        try {
          const videoRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: {
              part: "snippet,contentDetails,statistics",
              id: videoIds.join(","),
              key: apiKey
            },
            timeout: 7000
          });

          (videoRes.data.items || []).forEach(v => {
            detailsMap[v.id] = {
              duration: parseISO8601Duration(v.contentDetails?.duration),
              viewCount: formatViewCount(v.statistics?.viewCount),
              rawViews: Number(v.statistics?.viewCount || 0)
            };
          });
        } catch (detailErr) {
          console.warn("YouTube Video details fetch error:", detailErr.message);
        }

        const videos = items.map(item => {
          const vId = item.id.videoId;
          const details = detailsMap[vId] || {};

          return {
            videoId: vId,
            url: `https://www.youtube.com/watch?v=${vId}`,
            title: item.snippet.title,
            description: item.snippet.description || "Comprehensive learning video and tutorial.",
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
            publishedAt: item.snippet.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Recent",
            channel: item.snippet.channelTitle || "Educational Channel",
            channelId: item.snippet.channelId || "",
            channelAvatar: item.snippet.channelTitle ? item.snippet.channelTitle.substring(0, 2).toUpperCase() : "YT",
            duration: details.duration || "15:00",
            views: details.viewCount || "45K",
            subject: category || "Learning",
            level: difficulty || "All Levels",
            gradient: getRandomGradient(),
            emoji: "🎥"
          };
        });

        return {
          success: true,
          videos,
          nextPageToken,
          totalResults: searchRes.data.pageInfo?.totalResults || videos.length
        };
      }
    } catch (apiError) {
      console.warn("YouTube Data API v3 error/quota reached, falling back:", apiError.response?.data?.error?.message || apiError.message);
    }
  }

  // 2. Fallback to `yt-search`
  try {
    const r = await yts(finalQuery);
    const videos = (r.videos || []).slice(0, maxResults).map((v) => ({
      videoId: v.videoId,
      url: v.url,
      title: v.title,
      description: v.description || "Comprehensive learning video and tutorial.",
      thumbnail: v.thumbnail || v.image,
      duration: v.timestamp || (v.duration ? v.duration.toString() : "12:30"),
      views: formatViewCount(v.views),
      publishedAt: v.ago || "Recent",
      channel: v.author?.name || "YouTube Educator",
      channelId: v.author?.url || "",
      channelAvatar: v.author?.name ? v.author.name.substring(0, 2).toUpperCase() : "YT",
      subject: category || "Learning",
      level: difficulty || "All Levels",
      gradient: getRandomGradient(),
      emoji: "🎥"
    }));

    return {
      success: true,
      videos,
      nextPageToken: "",
      totalResults: videos.length
    };
  } catch (fallbackError) {
    console.error("Fallback YouTube Search Error:", fallbackError.message);
    throw new Error("Failed to fetch learning videos");
  }
};
