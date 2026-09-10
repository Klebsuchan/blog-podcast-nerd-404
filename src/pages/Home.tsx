import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Post, Video } from '../types';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const postsQ = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));
        const postsSnapshot = await getDocs(postsQ);
        setPosts(postsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Post)));

        const videosQ = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(3));
        const videosSnapshot = await getDocs(videosQ);
        setVideos(videosSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Video)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'posts/videos');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const featuredPosts = posts.slice(0, 4);
  const regularPosts = posts.slice(4);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-xl font-bold">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      
      {/* Hero Section - Split Image/Yellow */}
      {featuredPosts.length > 0 && (
        <div className="flex flex-col lg:flex-row h-auto lg:h-[600px] w-full">
          {/* Left Side (Image) */}
          <Link to={`/post/${featuredPosts[0].id}`} className="relative lg:w-2/3 h-[400px] lg:h-full bg-black group block">
            {featuredPosts[0].coverImage ? (
              <img src={featuredPosts[0].coverImage} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <div className="w-full h-full bg-gray-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 lg:p-12 w-full">
              <h2 className="text-white text-3xl lg:text-5xl font-bold leading-tight group-hover:underline underline-offset-4 decoration-[#ffc107]">
                {featuredPosts[0].title}
              </h2>
              <p className="text-gray-200 mt-4 text-lg lg:text-xl line-clamp-2">
                {featuredPosts[0].excerpt}
              </p>
            </div>
          </Link>

          {/* Right Side (Yellow bg list) */}
          <div className="lg:w-1/3 bg-[#ffc107] p-8 lg:p-12 flex flex-col justify-center">
            <h3 className="font-light text-xl mb-8 uppercase tracking-widest text-black">Mais Lidas</h3>
            <div className="flex flex-col gap-8">
              {featuredPosts.slice(1, 4).map((post, idx) => (
                <Link key={post.id} to={`/post/${post.id}`} className="flex gap-4 group">
                  <div className="w-12 h-12 bg-[#0000ff] text-white flex items-center justify-center text-3xl font-bold italic flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Cinema E TV</span>
                    <h4 className="text-lg font-medium leading-tight group-hover:underline">{post.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        
        {/* Timeline Posts */}
        <div className="max-w-4xl mb-16 relative">
          <div className="absolute left-[70px] top-4 bottom-0 w-px bg-blue-200 -z-10 hidden md:block"></div>
          
          <div className="flex flex-col gap-12">
            {regularPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="flex flex-col md:flex-row gap-6 relative">
                <div className="hidden md:block w-[140px] flex-shrink-0 pt-2">
                   <span className="bg-white border border-blue-200 text-black text-xs font-bold uppercase py-1 px-3 rounded-full shadow-sm z-10 relative">Agora Mesmo</span>
                </div>
                
                <Link to={`/post/${post.id}`} className="flex flex-col md:flex-row gap-6 group flex-1">
                  <div className="w-full md:w-[320px] aspect-video bg-gray-200 flex-shrink-0 overflow-hidden">
                    {post.coverImage && (
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 pr-8">
                    <span className="text-xs font-bold uppercase tracking-wider mb-2">Cinema E TV</span>
                    <h4 className="text-2xl font-bold leading-tight group-hover:text-blue-700 transition-colors mb-3">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 text-lg line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
                {/* Floating Notification Icon mock */}
                <div className="absolute right-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 p-2 rounded-full bg-gray-50 border border-gray-200 text-blue-500 shadow-sm cursor-pointer hover:bg-gray-100">
                  <Bell size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      {/* YouTube Section (Dark Blue) */}
      <div className="bg-[#05001d] w-full py-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-12 border-b border-[#ffffff1a] pb-4">
             <h2 className="text-black bg-[#ffc107] text-3xl md:text-5xl font-bold uppercase inline-block px-4 py-2">
               Assista no Canal
             </h2>
             <Link to="/videos" className="text-white hover:text-gray-300 flex items-center gap-1 font-bold tracking-widest text-sm uppercase">
                EiNerd no Youtube <ArrowRight size={16} className="-rotate-45" />
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="flex flex-col group">
                <div className="aspect-video w-full bg-gray-900 mb-4 overflow-hidden relative">
                   <iframe 
                    className="w-full h-full z-0"
                    src={video.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                    title={video.title}
                    allowFullScreen
                  />
                  {/* Mock EiNerd watermark */}
                  <div className="absolute top-2 left-2 bg-[#0000ff] text-white text-[10px] font-bold italic px-1 z-10 pointer-events-none">eiNERD!</div>
                </div>
                <h4 className="text-white text-lg font-light leading-snug group-hover:text-blue-400 transition-colors uppercase mb-4">
                  {video.title}
                </h4>
                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2 mt-auto pb-2 border-b-2 border-blue-600 self-start hover:text-blue-400 hover:border-blue-400 transition-colors">
                  Assista Aqui →
                </a>
              </div>
            ))}
            {videos.length === 0 && (
              <p className="text-gray-400 text-sm">Nenhum vídeo no momento.</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Content Block (Quadrinhos) */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="border-t-[3px] border-[#ff7a00] pt-8 mb-12 flex justify-between items-start">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 pr-8">
             {regularPosts.slice(3, 6).map((post) => (
               <Link key={post.id} to={`/post/${post.id}`} className="group flex flex-col gap-4">
                 <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
                    {post.coverImage && (
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                 </div>
                 <h4 className="text-xl font-bold leading-tight group-hover:text-blue-700">{post.title}</h4>
                 <p className="text-gray-500 text-sm line-clamp-3">{post.excerpt}</p>
               </Link>
             ))}
           </div>
           <div className="bg-[#ff7a00] text-black font-bold uppercase text-xl px-4 py-1">
             Quadrinhos →
           </div>
        </div>
      </div>

      {/* Newsletter Block */}
      <div className="bg-[#f0f4ff] py-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between">
           <div className="flex items-center gap-6 mb-6 md:mb-0">
             <div className="w-16 h-16 bg-[#0000ff] text-white flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
             </div>
             <div>
               <h4 className="font-bold text-lg">ASSINE A NEWSLETTER</h4>
               <p className="text-black">Aproveite para ter acesso ao conteúdo da revista e muito mais.</p>
             </div>
           </div>
           <button className="border border-[#0000ff] text-[#0000ff] hover:bg-[#0000ff] hover:text-white transition-colors text-xs font-bold px-8 py-3 uppercase tracking-wider">
             Assinar Agora
           </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#05001d] text-white py-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            <div className="col-span-1">
               <div className="bg-[#0000ff] inline-flex items-center px-4 py-2 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="flex bg-white p-0.5 rounded-sm gap-0.5">
                       <div className="w-1 h-1 bg-black rounded-full"></div>
                       <div className="w-1 h-1 bg-black rounded-full"></div>
                    </div>
                    <span className="font-bold text-xl tracking-tighter text-white font-serif italic">ei<span className="uppercase font-sans not-italic font-black">NERD!</span></span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 text-xs font-bold tracking-wider">
                  <a href="#" className="hover:text-gray-400 uppercase">Políticas de Privacidade</a>
                  <a href="#" className="hover:text-gray-400 uppercase">Políticas de Cookies</a>
                  <a href="#" className="hover:text-gray-400 uppercase">Termos de Uso</a>
                  <a href="#" className="hover:text-gray-400 uppercase">Fale Conosco</a>
                  <a href="#" className="hover:text-gray-400 uppercase">Imprensa</a>
                  <a href="#" className="hover:text-gray-400 uppercase">Contato Comercial</a>
                </div>
            </div>

            <div className="col-span-1">
              <h4 className="text-[#ffc107] font-medium text-lg mb-8">Veja Mais</h4>
              <div className="flex flex-col gap-4 text-xs font-bold tracking-wider">
                <a href="#" className="hover:text-gray-400 uppercase">Cyberclass - Conheça</a>
                <a href="#" className="hover:text-gray-400 uppercase">Whey Nerd</a>
                <a href="#" className="hover:text-gray-400 uppercase">Mundo da Música</a>
                <a href="#" className="hover:text-gray-400 uppercase">Feed Club</a>
                <a href="#" className="hover:text-gray-400 uppercase">Cifras</a>
                <a href="#" className="hover:text-gray-400 uppercase">Letras</a>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col items-end justify-start">
               <div className="flex items-center gap-6 text-[#ffc107] font-medium">
                  Siga-nos
                  <div className="flex gap-4 text-white">
                    <a href="#" className="hover:text-gray-400"><Facebook size={24} /></a>
                    <a href="#" className="hover:text-gray-400"><Twitter size={24} /></a>
                    <a href="#" className="hover:text-gray-400"><Youtube size={24} /></a>
                    <a href="#" className="hover:text-gray-400"><Instagram size={24} /></a>
                  </div>
               </div>
            </div>

          </div>
          
          <div className="mt-16 pt-8 border-t border-[#ffffff1a] flex justify-end">
            <p className="text-gray-400 text-xs">Ei Nerd! © 2026. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
