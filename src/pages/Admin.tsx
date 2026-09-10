import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ShieldAlert, Plus, Loader2, FileText, Upload, Image as ImageIcon } from 'lucide-react';

export default function Admin() {
  // Post form
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize logic (max width 1200px)
        const MAX_WIDTH = 1200;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          if (dataUrl.length > 1000000) {
            setMessage('A imagem é muito grande, tente uma imagem mais leve.');
          } else {
            setCoverImage(dataUrl);
            setMessage('');
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      await addDoc(collection(db, 'posts'), {
        title,
        excerpt,
        content,
        coverImage,
        videoUrl: postVideoUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        authorId: 'anonymous_admin' // bypassed auth
      });
      setMessage('Post publicado com sucesso!');
      setTitle(''); setExcerpt(''); setContent(''); setCoverImage(''); setPostVideoUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'posts');
      } catch (wrappedErr: any) {
        setMessage('Erro: ' + wrappedErr.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="min-h-screen bg-[#050814] pb-24 font-sans text-white">
      <div className="bg-gradient-to-r from-[#050814] via-[#0b1f38] to-[#1fd2c9] text-white border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-2">
            <ShieldAlert size={24} className="text-[#1fd2c9]"/> Painel Nerd 404 (Aberto)
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 mt-12">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10 text-[#1fd2c9]">
          <FileText size={24} /> 
          <h2 className="text-xl font-bold uppercase tracking-widest text-white">Publicar Novo Artigo / Assunto</h2>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-[#0b1f38] text-[#1fd2c9] font-bold border-l-4 border-[#1fd2c9]">
            {message}
          </div>
        )}

        <div className="bg-[#0b1f38]/50 border border-white/10 p-6 md:p-10 shadow-lg rounded-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <form onSubmit={handlePostSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Título do Artigo</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={150}
                  className="w-full px-4 py-3 bg-[#050814] text-white border border-white/10 focus:bg-[#0b1f38] focus:ring-2 focus:ring-[#1fd2c9] focus:border-transparent outline-none transition-all rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Texto / Conteúdo</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} maxLength={20000} rows={12}
                  className="w-full px-4 py-3 bg-[#050814] text-white border border-white/10 focus:bg-[#0b1f38] focus:ring-2 focus:ring-[#1fd2c9] focus:border-transparent outline-none transition-all font-mono text-sm rounded-md" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Imagem de Capa (Opcional)</label>
                  <div className="flex bg-[#050814] rounded p-1 border border-white/10">
                    <button 
                      type="button" 
                      onClick={() => setImageType('url')}
                      className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-colors ${imageType === 'url' ? 'bg-[#1fd2c9] text-[#050814]' : 'text-gray-500 hover:text-white'}`}
                    >
                      <ImageIcon size={14} className="inline mr-1" /> URL
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setImageType('upload')}
                      className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-colors ${imageType === 'upload' ? 'bg-[#1fd2c9] text-[#050814]' : 'text-gray-500 hover:text-white'}`}
                    >
                      <Upload size={14} className="inline mr-1" /> Enviar
                    </button>
                  </div>
                </div>
                
                {imageType === 'url' ? (
                  <input key="image-url-input" type="url" value={coverImage.startsWith('data:') ? '' : coverImage} onChange={e => setCoverImage(e.target.value)} maxLength={1000} placeholder="https://exemplo.com/foto.jpg"
                    className="w-full px-4 py-3 bg-[#050814] text-white border border-white/10 focus:bg-[#0b1f38] focus:ring-2 focus:ring-[#1fd2c9] focus:border-transparent outline-none transition-all rounded-md" />
                ) : (
                  <input 
                    key="image-file-input"
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#050814] text-white border border-white/10 focus:bg-[#0b1f38] focus:ring-2 focus:ring-[#1fd2c9] focus:border-transparent outline-none transition-all rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#1fd2c9] file:text-[#050814] hover:file:bg-white" 
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">URL do Vídeo (Opcional - YouTube)</label>
                <input type="url" value={postVideoUrl} onChange={e => setPostVideoUrl(e.target.value)} maxLength={500} placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 bg-[#050814] text-white border border-white/10 focus:bg-[#0b1f38] focus:ring-2 focus:ring-[#1fd2c9] focus:border-transparent outline-none transition-all rounded-md" />
              </div>
              <button disabled={saving} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#1fd2c9] text-[#050814] font-bold uppercase tracking-wider py-4 hover:bg-white disabled:opacity-50 transition-colors rounded-md mt-4">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Publicar Artigo no Site</>}
              </button>
            </form>
            
            {/* Pré-visualização */}
            <div className="bg-[#050814] border border-white/10 p-6 flex flex-col gap-6 rounded-xl h-fit sticky top-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1fd2c9] border-b border-white/10 pb-3">Pré-visualização da Capa</h3>
              
              {title ? (
                <div>
                  <h2 className="text-2xl font-black text-white leading-tight mb-2">{title || 'Título do Artigo'}</h2>
                </div>
              ) : (
                <p className="text-gray-600 text-sm italic">Preencha o título para ver a prévia.</p>
              )}

              {coverImage && (
                <div className="w-full aspect-[16/9] bg-[#0b1f38] overflow-hidden rounded-md border border-white/10">
                  <img src={coverImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
              
              {postVideoUrl && getYouTubeId(postVideoUrl) && (
                <div className="w-full aspect-[16/9] bg-[#0b1f38] overflow-hidden rounded-md border border-white/10">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeId(postVideoUrl)}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
