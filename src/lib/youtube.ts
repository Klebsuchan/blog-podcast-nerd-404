import { Video } from '../types';

export async function fetchYouTubeVideos(): Promise<Video[]> {
  try {
    const res = await fetch('/api/youtube');
    
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data && data.videos) {
      return data.videos;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching YouTube videos from local API:", error);
    return [];
  }
}
