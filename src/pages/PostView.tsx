import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Post, Comment } from '../types';
import Markdown from 'react-markdown';
import { ArrowLeft, Loader2, Calendar, MessageSquare, User, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PostView() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment form states
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (!id) return;
    const commentsRef = collection(db, 'posts', id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    }, (error) => {
      console.error("Error fetching comments:", error);
    });

    return () => unsubscribe();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim() || !commentName.trim()) return;

    setSubmitting(true);
    try {
      const commentsRef = collection(db, 'posts', id, 'comments');
      await addDoc(commentsRef, {
        text: commentText.trim(),
        authorName: commentName.trim(),
        createdAt: serverTimestamp()
      });
      setCommentText('');
      setCommentName('');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert('Erro ao enviar comentário.');
    } finally {
      setSubmitting(false);
    }
  };

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

        <div className="prose prose-lg prose-blue max-w-none text-black prose-headings:font-black prose-a:text-[#0000ff] prose-a:no-underline hover:prose-a:underline prose-p:leading-relaxed mx-auto mb-16">
          <div className="markdown-body">
            <Markdown>{post.content}</Markdown>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-3xl mx-auto border-t border-gray-200 pt-12">
          <div className="flex items-center gap-3 mb-8 text-black">
            <MessageSquare size={28} />
            <h2 className="text-2xl font-black uppercase tracking-wider">Comentários ({comments.length})</h2>
          </div>

          <form onSubmit={handleCommentSubmit} className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Seu Nome</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={commentName}
                  onChange={e => setCommentName(e.target.value)}
                  placeholder="Como você quer ser chamado?"
                  className="w-full pl-10 pr-4 py-3 bg-white text-black border border-gray-300 focus:border-[#0000ff] focus:ring-1 focus:ring-[#0000ff] outline-none transition-all rounded-md"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Seu Comentário</label>
              <textarea 
                required
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="O que você achou desta matéria?"
                rows={4}
                className="w-full px-4 py-3 bg-white text-black border border-gray-300 focus:border-[#0000ff] focus:ring-1 focus:ring-[#0000ff] outline-none transition-all rounded-md resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-[#0000ff] text-white font-bold uppercase tracking-wider px-8 py-3 rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Enviar Comentário</>}
            </button>
          </form>

          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-lg text-black">{comment.authorName}</h4>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {comment.createdAt ? format(comment.createdAt.toDate(), "dd MMM yyyy 'às' HH:mm", { locale: ptBR }) : 'Agora'}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.text}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-gray-500 italic py-8">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
