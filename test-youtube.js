import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['yt:videoId', 'videoId'],
    ]
  }
});

async function run() {
  try {
    const channelId = "UCkaLylQOY0vDszGH1lAQYww";
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const feed = await parser.parseURL(feedUrl);
    console.log("Success! Items:", feed.items.length);
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
