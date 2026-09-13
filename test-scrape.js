async function run() {
  const channelId = "UCkaLylQOY0vDszGH1lAQYww";
  const response = await fetch(`https://www.youtube.com/channel/${channelId}/videos`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });
  const html = await response.text();
  const scriptRegex = /var ytInitialData = (.*?);<\/script>/;
  const match = html.match(scriptRegex);
  if (!match) return console.error("ytInitialData not found");
  const data = JSON.parse(match[1]);
  const tabs = data.contents.twoColumnBrowseResultsRenderer.tabs;
  const videosTab = tabs.find(t => t.tabRenderer && t.tabRenderer.title.toLowerCase().includes('v'));
  
  const items = videosTab.tabRenderer.content.richGridRenderer.contents;
  const videos = items.filter(i => i.richItemRenderer && i.richItemRenderer.content.lockupViewModel).map(i => {
      const lockup = i.richItemRenderer.content.lockupViewModel;
      const videoId = lockup.contentId;
      const title = lockup.metadata?.lockupMetadataViewModel?.title?.content || '';
      const publishedAt = lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[1]?.metadataParts?.[0]?.text?.content || new Date().toISOString();
      const sources = lockup.contentImage?.thumbnailViewModel?.image?.sources || [];
      const thumbnailUrl = sources.length > 0 ? sources.sort((a,b)=> b.width - a.width)[0].url : `https://i1.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      return { videoId, title, publishedAt, thumbnailUrl };
  });
  console.log("Found:", videos.slice(0,2));
}
run();
