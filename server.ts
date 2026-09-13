import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // API routes
  app.get("/api/youtube", async (req, res) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const channelId = "UCkaLylQOY0vDszGH1lAQYww"; // Nerd 404 Channel ID
      
      // 1. Tenta usar a API oficial primeiro (se houver chave configurada)
      if (apiKey) {
        const uploadsPlaylistId = channelId.replace(/^UC/, 'UU');
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=15&key=${apiKey}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (response.ok) {
          const videos = data.items.map((item: any) => {
            const snippet = item.snippet;
            const title = snippet.title || '';
            const titleLower = title.toLowerCase();
            const videoId = snippet.resourceId.videoId;
            return {
              id: videoId,
              title: title,
              youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
              thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || `https://i1.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              publishedAt: snippet.publishedAt,
              author: snippet.videoOwnerChannelTitle || snippet.channelTitle,
              isShort: titleLower.includes('#shorts') || titleLower.includes('#short') || titleLower.includes('corte')
            };
          });
          return res.json({ videos });
        }
        // Se a API oficial falhar, loga o erro e tenta o fallback de scraping
        console.warn("YouTube API failed, falling back to scraping:", data.error?.message);
      }
      
      // 2. Fallback: Web Scraping do YouTube 
      // Não precisa de API Key e contorna o bloqueio de RSS 404
      const response = await fetch(`https://www.youtube.com/channel/${channelId}/videos`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      
      const html = await response.text();
      const scriptRegex = /var ytInitialData = (.*?);<\/script>/;
      const match = html.match(scriptRegex);
      
      if (!match) {
        throw new Error("Could not find ytInitialData in page");
      }
      
      const ytData = JSON.parse(match[1]);
      const tabs = ytData.contents?.twoColumnBrowseResultsRenderer?.tabs;
      
      if (!tabs) throw new Error("Could not find tabs in YouTube page");
      
      const videosTab = tabs.find((t: any) => t.tabRenderer?.title?.toLowerCase().includes('v'));
      if (!videosTab) throw new Error("Could not find videos tab");
      
      const items = videosTab.tabRenderer.content.richGridRenderer.contents;
      
      const videos = items
        .filter((item: any) => item.richItemRenderer && item.richItemRenderer.content.lockupViewModel)
        .slice(0, 15)
        .map((item: any) => {
          const lockup = item.richItemRenderer.content.lockupViewModel;
          const videoId = lockup.contentId;
          const title = lockup.metadata?.lockupMetadataViewModel?.title?.content || '';
          const titleLower = title.toLowerCase();
          
          let publishedStr = "N/A";
          try {
             // Extract published date if available
             const metaRows = lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows;
             if (metaRows && metaRows.length > 1) {
                publishedStr = metaRows[1]?.metadataParts?.[0]?.text?.content || "N/A";
             }
          } catch (e) {
             console.error("Error parsing date:", e);
          }

          const sources = lockup.contentImage?.thumbnailViewModel?.image?.sources || [];
          const thumbnailUrl = sources.length > 0 
            ? sources.sort((a: any, b: any) => b.width - a.width)[0].url 
            : `https://i1.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          
          return {
            id: videoId,
            title: title,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: thumbnailUrl,
            publishedAt: publishedStr,
            author: "Podcast Nerd 404",
            isShort: titleLower.includes('#shorts') || titleLower.includes('#short') || titleLower.includes('corte')
          };
        });
        
      res.json({ videos });

    } catch (error: any) {
      console.error("Error fetching YouTube feed:", error);
      res.status(500).json({ error: error.message || "Failed to fetch YouTube feed" });
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
