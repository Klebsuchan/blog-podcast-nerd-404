import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Post } from '../types';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    async function fetchPosts() {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'posts');
          setLoading(false);
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'posts');
        setLoading(false);
      }
    }
    
    fetchPosts();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white pt-12 pb-24 font-sans text-black">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="border-t-[3px] border-[#ffc107] pt-8 mb-12 flex justify-between items-start">
           <div className="bg-[#ffc107] text-black font-bold uppercase text-xl px-4 py-1">
             Notícias
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-gray-50 border border-gray-200">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">Nenhuma notícia publicada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="group flex flex-col gap-4">
                 <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
                    {post.coverImage && (
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                 </div>
                 <div>
                   <span className="text-[10px] font-bold uppercase tracking-wider block mb-2 text-gray-500">
                     {format(post.createdAt.toDate(), "dd MMM, yyyy", { locale: ptBR })}
                   </span>
                   <h4 className="text-2xl font-bold leading-tight group-hover:text-blue-700 mb-2">{post.title}</h4>
                   <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
                 </div>
               </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
