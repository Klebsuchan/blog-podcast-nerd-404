import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Post } from '../types';
import Markdown from 'react-markdown';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PostView() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `posts/${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0000ff]" size={48} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
        <h1 className="text-4xl font-black text-black mb-4">Artigo não encontrado</h1>
        <p className="text-gray-600 mb-8">Parece que este artigo foi removido ou não existe.</p>
        <Link to="/" className="text-[#0000ff] font-bold hover:underline flex items-center gap-2 uppercase tracking-wider transition-colors">
          <ArrowLeft size={20} /> Voltar para o Início
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-black">
      <div className="max-w-[1000px] mx-auto px-4 lg:px-8 mt-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-[#0000ff] transition-colors mb-8 uppercase text-xs tracking-wider">
          <ArrowLeft size={16} /> Voltar
        </Link>
        
        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-4">
          <span className="text-[#0000ff]">Cinema E TV</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            {format(post.createdAt.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          <span>•</span>
          <div>Por <span className="text-black">Podcast Nerd 404</span></div>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-8 leading-[1.1]">
          {post.title}
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 font-medium leading-relaxed">
           {post.excerpt}
        </p>

        {post.coverImage && (
          <div className="w-full aspect-video relative bg-gray-900 mb-12 overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {post.videoUrl && (
          <div className="w-full aspect-video bg-gray-900 mb-12 overflow-hidden shadow-lg border border-gray-200">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${(() => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = post.videoUrl.match(regExp);
                return (match && match[2].length === 11) ? match[2] : '';
              })()}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="prose prose-lg prose-blue max-w-none text-black prose-headings:font-black prose-a:text-[#0000ff] prose-a:no-underline hover:prose-a:underline prose-p:leading-relaxed mx-auto">
          <div className="markdown-body">
            <Markdown>{post.content}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
