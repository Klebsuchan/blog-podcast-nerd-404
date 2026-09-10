import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Video } from '../types';
import { Youtube, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setVideos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Video)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'videos');
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return `https://www.youtube.com/embed/${urlParams.get('v')}`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-[#05001d] text-white pt-12 pb-24 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-end mb-12 border-b border-[#ffffff1a] pb-4">
           <h1 className="text-black bg-[#ffc107] text-3xl md:text-5xl font-bold uppercase inline-block px-4 py-2">
             Vídeos
           </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-400 py-20 bg-[#111122] rounded-md border border-[#ffffff1a]">
            <PlayCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">Nenhum vídeo adicionado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div 
                key={video.id}
                className="flex flex-col group"
              >
                <div className="aspect-video w-full bg-black mb-4 relative overflow-hidden">
                  <iframe 
                    className="w-full h-full z-0 relative"
                    src={getEmbedUrl(video.youtubeUrl)} 
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                  <div className="absolute top-2 left-2 bg-[#0000ff] text-white text-[10px] font-bold italic px-1 z-10 pointer-events-none">eiNERD!</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {format(video.createdAt.toDate(), "dd MMM, yyyy", { locale: ptBR })}
                  </div>
                  <h2 className="text-xl font-light mb-2 line-clamp-2 leading-snug group-hover:text-blue-400 uppercase transition-colors cursor-pointer">{video.title}</h2>
                  {video.description && (
                    <p className="text-gray-400 text-sm line-clamp-3">{video.description}</p>
                  )}
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2 mt-4 pb-2 border-b-2 border-blue-600 self-start hover:text-blue-400 hover:border-blue-400 transition-colors inline-flex">
                    Assista Aqui →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
