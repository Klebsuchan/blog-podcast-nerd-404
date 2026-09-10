import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Post, Video } from '../types';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight, Facebook, Youtube, Instagram, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../components/Modal';
import { fetchYouTubeVideos } from '../lib/youtube';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let unsubscribe: () => void;

    async function fetchData() {
      try {
        const postsQ = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));
        
        unsubscribe = onSnapshot(postsQ, (postsSnapshot) => {
          setPosts(postsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'posts');
          setLoading(false);
        });

        const fetchedVideos = await fetchYouTubeVideos();
        if (fetchedVideos.length > 0) {
          setVideos(fetchedVideos);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'posts/videos');
        setLoading(false);
      }
    }
    
    fetchData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const featuredPosts = posts.slice(0, 4);
  const regularPosts = posts.slice(4);
  
  const regularVideos = videos.filter(v => !v.isShort);
  const paposDeNerdVideo = regularVideos.find(v => v.title.toLowerCase().includes('papos do nerd') || v.title.toLowerCase().includes('papos de nerd')) || regularVideos[0];
  const zueiraNerdVideo = regularVideos.find(v => v.title.toLowerCase().includes('zueira nerd show') || v.title.toLowerCase().includes('zueira nerd')) || regularVideos[1];
  const nerdsInvestemVideo = regularVideos.find(v => v.title.toLowerCase().includes('nerds investem')) || regularVideos[2];
  
  // Show all regular videos in the carousel to maximize content
  let bottomVideos = [...regularVideos];

  let filteredPosts = posts;

  if (searchQuery.trim() !== '') {
    const queryLower = searchQuery.toLowerCase();
    bottomVideos = videos.filter(v => v.title.toLowerCase().includes(queryLower));
    filteredPosts = posts.filter(p => p.title.toLowerCase().includes(queryLower) || p.excerpt.toLowerCase().includes(queryLower));
  } else {
    bottomVideos = bottomVideos.slice(0, 15);
  }

  // Shorts / Cortes
  let cortesVideos = videos.filter(v => v.isShort);
  if (cortesVideos.length < 3) {
      const moreCortes = regularVideos.filter(v => 
          v.id !== paposDeNerdVideo?.id && 
          v.id !== zueiraNerdVideo?.id && 
          v.id !== nerdsInvestemVideo?.id &&
          !bottomVideos.find(bv => bv.id === v.id)
      );
      cortesVideos = [...cortesVideos, ...moreCortes].slice(0, 3);
  } else {
      cortesVideos = cortesVideos.slice(0, 3);
  }

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-xl font-bold">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#030614] font-sans text-white">
      
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden bg-[#030614] text-white pt-8 pb-16 lg:py-24 border-b border-gray-800">
         {/* Background glows */}
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] bg-[#ff00ff]/10 rounded-full blur-[100px] pointer-events-none"></div>
       
         {/* Grid overlay */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
         
         <div className="max-w-[1500px] mx-auto px-4 lg:px-8 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
             
             {/* Left Section: Dynamic Content (Panels) */}
             <div className="lg:col-span-4 relative min-h-[400px] lg:min-h-[500px] flex flex-col justify-center order-2 lg:order-1">
                <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full max-h-[600px] w-full">
                   {/* Main Panel */}
                   <a href={paposDeNerdVideo?.youtubeUrl || "#"} target="_blank" rel="noopener noreferrer" className="col-span-2 row-span-1 relative bg-gray-900 border border-purple-500/30 hover:border-purple-400/80 rounded-[2rem] p-5 shadow-[0_0_30px_rgba(255,0,255,0.1)] overflow-hidden group hover:-translate-y-1 transition-all duration-300 block">
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${paposDeNerdVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600'})` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      <div className="relative h-full flex flex-col justify-end">
                        <h3 className="text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff] mb-1 drop-shadow-lg">PAPOS DE NERD</h3>
                        <p className="text-xs text-gray-200 font-medium line-clamp-2 drop-shadow-md">{paposDeNerdVideo?.title}</p>
                      </div>
                   </a>
       
                   {/* Bottom-Left Panel */}
                   <a href={zueiraNerdVideo?.youtubeUrl || "#"} target="_blank" rel="noopener noreferrer" className="col-span-1 row-span-1 relative bg-gray-900 border border-cyan-500/30 hover:border-cyan-400/80 rounded-[2rem] p-4 shadow-[0_0_30px_rgba(0,255,255,0.1)] overflow-hidden group hover:-translate-y-1 transition-all duration-300 block">
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${zueiraNerdVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400'})` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      <div className="relative h-full flex flex-col justify-end">
                        <h3 className="text-xs font-bold text-cyan-400 mb-1 leading-tight uppercase tracking-wider drop-shadow-md">ZUEIRA NERD</h3>
                        <p className="text-[10px] text-gray-200 line-clamp-2 drop-shadow-md">{zueiraNerdVideo?.title}</p>
                      </div>
                   </a>
       
                   {/* Bottom-Right Panel */}
                   <a href={nerdsInvestemVideo?.youtubeUrl || "#"} target="_blank" rel="noopener noreferrer" className="col-span-1 row-span-1 relative bg-gray-900 border border-green-500/30 hover:border-green-400/80 rounded-[2rem] p-4 shadow-[0_0_30px_rgba(0,255,0,0.1)] overflow-hidden group hover:-translate-y-1 transition-all duration-300 block">
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${nerdsInvestemVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400'})` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      <div className="relative h-full flex flex-col justify-end">
                        <h3 className="text-xs font-bold text-green-400 mb-1 leading-tight uppercase tracking-wider drop-shadow-md">NERDS INVESTEM</h3>
                        <p className="text-[10px] text-gray-200 line-clamp-2 drop-shadow-md">{nerdsInvestemVideo?.title}</p>
                      </div>
                   </a>
                </div>
             </div>
       
             {/* Center Section: Titles & Actions */}
             <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left z-20 relative lg:py-8 order-1 lg:order-2">
               <div className="absolute inset-0 bg-[#0a0d1a]/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl -z-10"></div>
               <div className="p-8 lg:p-10 w-full">
                 {/* Badge */}
                 {videos.length > 0 && (
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-4 py-2 rounded-full mb-8">
                       <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                       🎙️ NO AR: {videos[0].title.slice(0, 35)}...
                    </div>
                 )}
                 
                 <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-[1.1] tracking-tight">
                   <span className="text-white block">BEM-VINDO AO HUB</span>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">DO PODCAST NERD 404.</span>
                 </h1>
                 <h2 className="text-xl md:text-2xl font-mono font-bold text-cyan-400/80 mb-6 relative inline-block group">
                    ERROR 404: TÉDIO NÃO ENCONTRADO.
                 </h2>
                 
                 <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                    Cultura Pop, Nostalgia, Tecnologia e Empreendedorismo. Tudo com a essência do nosso cast. Mergulhe nos nossos bate-papos e artigos exclusivos.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <a href={videos[0]?.youtubeUrl || "#"} target="_blank" rel="noopener noreferrer" className="bg-[#0000ff] hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full transition-all shadow-[0_0_20px_rgba(0,0,255,0.3)] hover:shadow-[0_0_30px_rgba(0,0,255,0.5)] flex items-center justify-center gap-2 uppercase tracking-wide">
                      Assista Agora <PlayCircle size={20} />
                    </a>
                    <button className="bg-transparent border border-gray-600 hover:border-gray-400 hover:bg-white/5 text-gray-300 hover:text-white font-bold py-4 px-8 rounded-full transition-all uppercase tracking-wide flex items-center justify-center">
                      Explorar Categorias
                    </button>
                 </div>
               </div>
             </div>
       
             {/* Right Section: Cortes & Parceiros */}
             <div className="lg:col-span-3 flex flex-col justify-between gap-6 z-20 lg:py-8 order-3">
                {/* Cortes Recentes */}
                <div className="bg-[#0a0d1a]/60 backdrop-blur-md border border-white/5 rounded-[2rem] p-6">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <span className="w-1 h-4 bg-cyan-400 rounded-full"></span>
                     Cortes Recentes
                   </h4>
                   <div className="flex flex-col gap-5">
                     {cortesVideos.map((corte, i) => (
                        <a key={i} href={corte.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                          <div className="relative w-20 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-800">
                             <img src={corte.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                             <div className="absolute inset-0 flex items-center justify-center">
                               <PlayCircle size={20} className="text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                             </div>
                          </div>
                          <h5 className="text-[10px] font-bold text-gray-400 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-relaxed uppercase tracking-wider">
                            {corte.title}
                          </h5>
                        </a>
                     ))}
                   </div>
                </div>
       
                {/* Redes Sociais */}
                <div className="bg-[#0a0d1a]/60 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 flex-1 flex flex-col items-center justify-center gap-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center w-full">Nossas Redes</h4>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <a href="https://www.youtube.com/@podcastnerd404" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center aspect-square bg-white/5 hover:bg-[#ff0000] rounded-2xl transition-all group border border-white/5 hover:border-transparent shadow-lg">
                        <Youtube size={36} className="text-gray-400 group-hover:text-white transition-colors mb-3 group-hover:scale-110 duration-300" />
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">YouTube</span>
                      </a>
                      <a href="https://www.instagram.com/podcastnerd404/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center aspect-square bg-white/5 hover:bg-[#E1306C] rounded-2xl transition-all group border border-white/5 hover:border-transparent shadow-lg">
                        <Instagram size={36} className="text-gray-400 group-hover:text-white transition-colors mb-3 group-hover:scale-110 duration-300" />
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">Instagram</span>
                      </a>
                      <a href="https://www.facebook.com/profile.php?id=61569124091867" target="_blank" rel="noopener noreferrer" className="col-span-2 flex flex-col items-center justify-center py-6 bg-white/5 hover:bg-[#0000ff] rounded-2xl transition-all group border border-white/5 hover:border-transparent shadow-lg">
                        <Facebook size={36} className="text-gray-400 group-hover:text-white transition-colors mb-3 group-hover:scale-110 duration-300" />
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">Facebook</span>
                      </a>
                    </div>
                </div>
             </div>
       
           </div>
         </div>
      </div>

      {/* Search Bar Section */}
      <div className="bg-[#050814] w-full pt-10 pb-4">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="relative w-full max-w-2xl mx-auto">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por artigos ou vídeos..."
              className="w-full px-6 py-4 pl-12 bg-[#0b1f38] text-white border border-[#1fd2c9]/30 focus:border-[#1fd2c9] focus:ring-1 focus:ring-[#1fd2c9] outline-none transition-all rounded-full placeholder-gray-500 font-mono text-sm shadow-[0_0_15px_rgba(31,210,201,0.1)]"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1fd2c9]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Section (Gradient matched to logo) */}
      <div className="bg-gradient-to-r from-[#050814] via-[#0b1f38] to-[#1fd2c9] w-full py-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 mb-12 border-b border-[#ffffff1a] pb-4">
             <h2 className="text-black bg-[#ffc107] text-3xl md:text-5xl font-bold uppercase inline-block px-4 py-2 self-start">
               Assista no Canal
             </h2>
             <Link to="/videos" className="text-white hover:text-gray-300 flex items-center gap-1 font-bold tracking-widest text-sm uppercase self-start md:self-auto">
                Podcast Nerd 404 no Youtube <ArrowRight size={16} className="-rotate-45 shrink-0" />
             </Link>
          </div>

          <div className="relative group/carousel px-4 md:px-0">
            <button 
              onClick={scrollLeft}
              className="flex absolute left-0 md:-left-4 top-[40%] -translate-y-1/2 z-20 bg-[#0b1f38] hover:bg-[#1fd2c9] text-[#1fd2c9] hover:text-black border border-[#1fd2c9]/50 p-1 md:p-2 rounded-full transition-colors shadow-[0_0_10px_rgba(31,210,201,0.2)] opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft size={24} />
            </button>

            <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {bottomVideos.map((video) => (
                <div key={video.id} className="flex-none w-[85%] md:w-[45%] xl:w-[23%] flex flex-col group snap-start">
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="aspect-video w-full bg-gray-900 mb-4 overflow-hidden relative block group-hover:scale-105 transition-transform duration-300">
                     <img 
                      className="w-full h-full object-cover z-0"
                      src={video.thumbnailUrl} 
                      alt={video.title}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <PlayCircle size={48} className="text-white drop-shadow-lg" />
                    </div>
                    {/* Mock Nerd 404 watermark */}
                    <div className="absolute top-2 left-2 bg-[#0000ff] text-white text-[10px] font-bold italic px-1 z-10 pointer-events-none">NERD 404</div>
                  </a>
                  <h4 className="text-white text-lg font-light leading-snug group-hover:text-blue-400 transition-colors uppercase mb-4 line-clamp-2 min-h-[3.5rem]">
                    {video.title}
                  </h4>
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2 mt-auto pb-2 border-b-2 border-blue-600 self-start hover:text-blue-400 hover:border-blue-400 transition-colors">
                    Assista Aqui →
                  </a>
                </div>
              ))}
              {bottomVideos.length === 0 && (
                <p className="text-gray-400 text-sm">Nenhum vídeo no momento.</p>
              )}
            </div>

            <button 
              onClick={scrollRight}
              className="flex absolute right-0 md:-right-4 top-[40%] -translate-y-1/2 z-20 bg-[#0b1f38] hover:bg-[#1fd2c9] text-[#1fd2c9] hover:text-black border border-[#1fd2c9]/50 p-1 md:p-2 rounded-full transition-colors shadow-[0_0_10px_rgba(31,210,201,0.2)] opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100"
              aria-label="Rolar para direita"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Additional Content Block (Matérias) */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="border-t-[3px] border-[#ff7a00] pt-8 mb-12 flex flex-col-reverse md:flex-row justify-between items-start gap-8 md:gap-0">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 pr-0 md:pr-8 w-full">
             {filteredPosts.slice(0, 3).map((post) => (
               <Link key={post.id} to={`/post/${post.id}`} className="group flex flex-col gap-4">
                 <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
                    {post.coverImage && (
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                 </div>
                 <h4 className="text-xl font-bold leading-tight group-hover:text-blue-700 text-white">{post.title}</h4>
                 <p className="text-gray-500 text-sm line-clamp-3">{post.excerpt}</p>
               </Link>
             ))}
             {filteredPosts.length === 0 && (
               <p className="text-gray-400 text-sm col-span-3">Nenhuma matéria encontrada com esse termo.</p>
             )}
           </div>
           <div className="bg-[#ff7a00] text-black font-bold uppercase text-xl px-4 py-1 self-start">
             Matérias →
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#02050f] text-white py-16 border-t border-gray-900">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-12 lg:col-span-5">
               <div className="mb-6">
                 <img src="/logonerd.png" alt="Logo" className="h-10 md:h-12 object-contain" />
               </div>
               <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-8">
                 O seu portal definitivo sobre tecnologia, cultura pop e o universo geek. Fique por dentro de todos os nossos episódios e novidades.
               </p>
               <div className="flex gap-4 text-gray-400">
                 <a href="https://www.facebook.com/profile.php?id=61569124091867" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors bg-white/5 hover:bg-[#0000ff] p-2.5 rounded-full"><Facebook size={20} /></a>
                 <a href="https://www.youtube.com/@podcastnerd404" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors bg-white/5 hover:bg-[#ff0000] p-2.5 rounded-full"><Youtube size={20} /></a>
                 <a href="https://www.instagram.com/podcastnerd404/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors bg-white/5 hover:bg-[#E1306C] p-2.5 rounded-full"><Instagram size={20} /></a>
               </div>
            </div>

            {/* Institucional */}
            <div className="col-span-1 md:col-span-6 lg:col-span-3 lg:col-start-7">
              <h4 className="text-white font-bold tracking-wider uppercase mb-6 text-sm">Institucional</h4>
              <div className="flex flex-col gap-4 text-sm text-gray-400">
                  <button onClick={() => setActiveModal('contact')} className="hover:text-[#0000ff] text-left transition-colors w-fit">Fale Conosco</button>
                  <button onClick={() => setActiveModal('commercial')} className="hover:text-[#0000ff] text-left transition-colors w-fit">Contato Comercial</button>
              </div>
            </div>

            {/* Legal */}
            <div className="col-span-1 md:col-span-6 lg:col-span-3">
              <h4 className="text-white font-bold tracking-wider uppercase mb-6 text-sm">Legal</h4>
              <div className="flex flex-col gap-4 text-sm text-gray-400">
                  <button onClick={() => setActiveModal('privacy')} className="hover:text-[#0000ff] text-left transition-colors w-fit">Políticas de Privacidade</button>
                  <button onClick={() => setActiveModal('cookies')} className="hover:text-[#0000ff] text-left transition-colors w-fit">Políticas de Cookies</button>
                  <button onClick={() => setActiveModal('terms')} className="hover:text-[#0000ff] text-left transition-colors w-fit">Termos de Uso</button>
              </div>
            </div>

          </div>
          
          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-gray-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs font-medium">Podcast Nerd 404 © {new Date().getFullYear()}. Todos os direitos reservados.</p>
            <p className="text-gray-500 text-xs font-medium flex items-center gap-1">Feito com <span className="text-red-500">♥</span> para os Nerds.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Políticas de Privacidade">
        <div className="space-y-4 text-gray-600">
          <p><strong>1. Coleta de Dados:</strong> Coletamos informações fornecidas por você durante a interação com nosso site, como nome e e-mail para contato.</p>
          <p><strong>2. Uso das Informações:</strong> As informações coletadas são utilizadas para personalizar sua experiência, melhorar nosso site e enviar atualizações relevantes sobre o Podcast Nerd 404.</p>
          <p><strong>3. Proteção de Dados:</strong> Empregamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado.</p>
          <p><strong>4. Compartilhamento:</strong> Não vendemos ou comercializamos suas informações pessoais para terceiros.</p>
          <p>Para dúvidas adicionais, entre em contato através da seção "Fale Conosco".</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'cookies'} onClose={() => setActiveModal(null)} title="Políticas de Cookies">
        <div className="space-y-4 text-gray-600">
          <p>Utilizamos cookies para otimizar sua experiência no site.</p>
          <p><strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico do site.</p>
          <p><strong>Cookies de Desempenho:</strong> Nos ajudam a entender como os visitantes interagem com o site, coletando e relatando informações anonimamente.</p>
          <p><strong>Gerenciamento:</strong> Você pode controlar ou excluir cookies conforme desejar em seu próprio navegador.</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'terms'} onClose={() => setActiveModal(null)} title="Termos de Uso">
        <div className="space-y-4 text-gray-600">
          <p>Ao acessar e usar este site, você concorda em cumprir e estar vinculado aos seguintes termos de uso.</p>
          <p><strong>Propriedade Intelectual:</strong> Todo o conteúdo, design e layout deste site são de propriedade do Podcast Nerd 404. É proibida a reprodução sem autorização.</p>
          <p><strong>Conduta do Usuário:</strong> Você concorda em usar o site apenas para fins legais e de maneira que não infrinja os direitos de terceiros.</p>
          <p><strong>Isenção de Responsabilidade:</strong> O conteúdo fornecido é apenas para fins informativos e de entretenimento.</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'contact'} onClose={() => setActiveModal(null)} title="Fale Conosco">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setActiveModal(null); alert('Mensagem enviada com sucesso!'); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
            <textarea required rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <button type="submit" className="bg-[#0000ff] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-bold uppercase tracking-wider text-sm w-full">
            Enviar Mensagem
          </button>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'commercial'} onClose={() => setActiveModal(null)} title="Contato Comercial">
        <div className="space-y-6 text-gray-600">
          <p>Tem interesse em anunciar no Podcast Nerd 404 ou propor uma parceria?</p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-sm">Oportunidades de Parceria</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Anúncios (Mid-roll e Pre-roll)</li>
              <li>Episódios Patrocinados</li>
              <li>Ações em Mídias Sociais</li>
              <li>Presença em Eventos</li>
            </ul>
          </div>
          <p className="font-medium text-gray-900">
            Envie sua proposta para: <a href="mailto:comercial@nerd404.com.br" className="text-blue-600 hover:underline">comercial@nerd404.com.br</a>
          </p>
        </div>
      </Modal>

    </div>
  );
}
