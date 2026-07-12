const yts = require("yt-search");

exports.searchYouTube = async (query) => {
  try {
    const r = await yts(query);
    
    // Get up to 12 video results and map to clean object format
    const videos = r.videos.slice(0, 12).map((v) => ({
      videoId: v.videoId,
      url: v.url,
      title: v.title,
      description: v.description,
      thumbnail: v.thumbnail || v.image,
      duration: v.timestamp || v.duration.toString(),
      views: v.views >= 1000000 
        ? `${(v.views / 1000000).toFixed(1)}M` 
        : v.views >= 1000 
          ? `${(v.views / 1000).toFixed(0)}K` 
          : `${v.views}`,
      uploadedAt: v.ago || "Recent",
      channel: v.author.name || "YouTube",
      channelAvatar: v.author.name ? v.author.name.substring(0, 2).toUpperCase() : "YT",
      likes: "N/A",
      subject: "YouTube",
      level: "General",
      tags: [],
      gradient: getRandomGradient(),
      emoji: "🎥"
    }));

    return videos;
  } catch (error) {
    console.error("YouTube Search Error:", error.message);
    throw new Error("Failed to fetch YouTube videos");
  }
};

function getRandomGradient() {
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-orange-500 to-rose-600",
    "from-yellow-500 to-orange-500",
    "from-green-500 to-teal-600",
    "from-emerald-500 to-green-600",
    "from-cyan-500 to-blue-500",
    "from-amber-500 to-yellow-500",
    "from-purple-500 to-violet-600",
    "from-fuchsia-500 to-pink-600",
    "from-sky-500 to-cyan-500"
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

