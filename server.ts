import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Parser from "rss-parser";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const parser = new Parser({
    customFields: {
      item: [
        ['media:group', 'mediaGroup'],
        ['yt:videoId', 'videoId'],
      ]
    }
  });

  // API routes
  app.get("/api/youtube", async (req, res) => {
    try {
      const channelId = "UCkaLylQOY0vDszGH1lAQYww";
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      
      const feed = await parser.parseURL(feedUrl);
      
      const videos = feed.items
        .map((rawItem) => {
        const item = rawItem as any;
        const title = item.title?.toLowerCase() || '';
        const link = item.link || '';
        const isShort = link.includes('/shorts/') || title.includes('#shorts') || title.includes('#short') || title.includes('corte');
        
        let thumbnailUrl = "";
        if (item.mediaGroup && item.mediaGroup['media:thumbnail'] && item.mediaGroup['media:thumbnail'][0]) {
          thumbnailUrl = item.mediaGroup['media:thumbnail'][0].$.url;
        } else {
          // Fallback thumbnail using video ID
          thumbnailUrl = `https://i1.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
        }

        return {
          id: item.videoId,
          title: item.title,
          youtubeUrl: item.link,
          thumbnailUrl: thumbnailUrl,
          publishedAt: item.isoDate || item.pubDate,
          author: item.author,
          isShort
        };
      });

      res.json({ videos });
    } catch (error) {
      console.error("Error fetching YouTube feed:", error);
      res.status(500).json({ error: "Failed to fetch YouTube feed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
