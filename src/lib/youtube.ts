import { Video } from '../types';

export async function fetchYouTubeVideos(): Promise<Video[]> {
  try {
    const channelId = "UCkaLylQOY0vDszGH1lAQYww";
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    if (data.status === 'ok' && data.items) {
      return data.items.map((item: any) => {
        const title = item.title || '';
        const titleLower = title.toLowerCase();
        const link = item.link || '';
        
        // Extract ID from guid like "yt:video:ID" or from the URL
        let id = '';
        if (item.guid && item.guid.includes('yt:video:')) {
          id = item.guid.split('yt:video:')[1];
        } else {
          const match = link.match(/[?&]v=([^&]+)/) || link.match(/shorts\/([^/?]+)/);
          if (match) id = match[1];
        }

        const isShort = link.includes('/shorts/') || titleLower.includes('#shorts') || titleLower.includes('#short') || titleLower.includes('corte');
        
        return {
          id,
          title,
          youtubeUrl: link,
          thumbnailUrl: item.thumbnail || `https://i1.ytimg.com/vi/${id}/hqdefault.jpg`,
          publishedAt: item.pubDate,
          author: item.author,
          isShort
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
}
