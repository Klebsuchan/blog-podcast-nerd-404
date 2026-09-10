import React, { useEffect, useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ShieldAlert, Plus, LogOut, Loader2, Video, FileText } from 'lucide-react';

export default function Admin() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Form states
  const [activeTab, setActiveTab] = useState<'post' | 'video'>('post');
  
  // Post form
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  
  // Video form
  const [videoTitle, setVideoTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoDesc, setVideoDesc] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setCheckingAdmin(true);
      const adminRef = doc(db, 'admins', user.uid);
      getDoc(adminRef).then((docSnap) => {
        setIsAdmin(docSnap.exists());
        setCheckingAdmin(false);
      }).catch((err) => {
        console.error(err);
        setCheckingAdmin(false);
      });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    setSaving(true);
    setMessage('');
    
    try {
      await addDoc(collection(db, 'posts'), {
        title,
        excerpt,
        content,
        coverImage,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        authorId: user.uid
      });
      setMessage('Post publicado com sucesso!');
      setTitle(''); setExcerpt(''); setContent(''); setCoverImage('');
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

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    setSaving(true);
    setMessage('');
    
    try {
      await addDoc(collection(db, 'videos'), {
        title: videoTitle,
        youtubeUrl,
        description: videoDesc,
        createdAt: serverTimestamp(),
        authorId: user.uid
      });
      setMessage('Vídeo adicionado com sucesso!');
      setVideoTitle(''); setYoutubeUrl(''); setVideoDesc('');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'videos');
      } catch (wrappedErr: any) {
        setMessage('Erro: ' + wrappedErr.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#0000ff]" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff] px-4">
        <div className="bg-white p-8 border-t-4 border-[#0000ff] max-w-md w-full text-center shadow-lg">
          <ShieldAlert size={48} className="mx-auto text-[#0000ff] mb-6" />
          <h1 className="text-2xl font-black text-black mb-2 uppercase">Acesso Restrito</h1>
          <p className="text-gray-600 mb-8 font-medium">Faça login para acessar o painel administrativo.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-[#05001d] text-[#ffc107] font-bold py-3 px-4 hover:bg-black transition-colors flex justify-center items-center gap-2 uppercase tracking-wider text-sm"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff] px-4">
        <div className="bg-white p-8 border-t-4 border-red-600 max-w-lg w-full text-center shadow-lg">
          <ShieldAlert size={48} className="mx-auto text-red-600 mb-6" />
          <h1 className="text-2xl font-black text-black mb-2 uppercase">Acesso Negado</h1>
          <p className="text-gray-600 mb-6 font-medium">
            Sua conta não tem privilégios de administrador. Para acessar este painel, adicione seu UID no Firestore na coleção `admins`.
          </p>
          <div className="bg-gray-100 p-4 rounded-md text-left mb-6 font-mono text-sm break-all">
            <strong>Seu UID:</strong> <br/> {user.uid}
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-black font-bold uppercase tracking-wider transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-black">
      <div className="bg-[#05001d] text-white">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-widest text-[#ffc107]">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-bold tracking-wider">{user.email}</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white p-2 hover:bg-[#ffffff1a] transition-colors rounded-full">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 lg:px-8 mt-12">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('post')}
            className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider transition-all border-b-2 text-sm ${activeTab === 'post' ? 'text-[#0000ff] border-[#0000ff]' : 'text-gray-500 border-transparent hover:text-black'}`}
          >
            <FileText size={18} /> Novo Artigo
          </button>
          <button 
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider transition-all border-b-2 text-sm ${activeTab === 'video' ? 'text-[#0000ff] border-[#0000ff]' : 'text-gray-500 border-transparent hover:text-black'}`}
          >
            <Video size={18} /> Novo Vídeo
          </button>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-green-50 text-green-800 font-bold border-l-4 border-green-500">
            {message}
          </div>
        )}

        <div className="bg-white border border-gray-200 p-6 md:p-10 shadow-sm">
          {activeTab === 'post' ? (
            <form onSubmit={handlePostSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Título do Artigo</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={150}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0000ff] focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Resumo (Excerpt)</label>
                <textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)} maxLength={300} rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0000ff] focus:border-transparent outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">URL da Imagem de Capa (Opcional)</label>
                <input type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)} maxLength={1000}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0000ff] focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Conteúdo (Markdown)</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} maxLength={20000} rows={12}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0000ff] focus:border-transparent outline-none transition-all font-mono text-sm" />
              </div>
              <button disabled={saving} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#0000ff] text-white font-bold uppercase tracking-wider py-4 hover:bg-blue-800 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Publicar Artigo</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVideoSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Título do Vídeo</label>
                <input required type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} maxLength={150}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0000ff] focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">URL do YouTube</label>
                <input required type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} maxLength={500} placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0000ff] focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Descrição / Detalhes (Opcional)</label>
                <textarea value={videoDesc} onChange={e => setVideoDesc(e.target.value)} maxLength={1000} rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#0000ff] focus:border-transparent outline-none transition-all resize-none" />
              </div>
              <button disabled={saving} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#0000ff] text-white font-bold uppercase tracking-wider py-4 hover:bg-blue-800 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Adicionar Vídeo</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
