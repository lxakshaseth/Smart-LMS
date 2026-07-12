const axios = require("axios");

const INSTANCES = [
  "https://yewtu.be",
  "https://inv.nadeko.net",
  "https://invidious.privacydev.net"
];

const searchYouTubeFree = async (query) => {
  for (let base of INSTANCES) {
    try {
      const response = await axios.get(`${base}/api/v1/search`, {
        params: {
          q: query,
          type: "video"
        },
        timeout: 5000
      });

      const videos = response.data
        .filter(item => item.type === "video")
        .slice(0, 5)
        .map(video => ({
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.videoThumbnails?.[0]?.url,
          channel: video.author
        }));

      return videos;

    } catch (error) {
      console.log(`Instance failed: ${base}`);
    }
  }

  return [];
};

module.exports = {
  searchYouTubeFree
};
