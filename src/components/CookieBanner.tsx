import React, { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Delay showing it slightly for a better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 animate-fade-in-up">
      <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-gray-600 text-sm md:text-base flex-1">
          <p>
            <strong>Nós usamos cookies!</strong> Este site utiliza cookies para melhorar sua experiência, analisar nosso tráfego e personalizar conteúdo. 
            Ao continuar navegando, você concorda com a nossa política de cookies.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button 
            onClick={handleReject}
            className="flex-1 md:flex-none border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs font-bold px-6 py-3 uppercase tracking-wider rounded-md whitespace-nowrap"
          >
            Recusar
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-[#0000ff] text-white hover:bg-blue-700 transition-colors text-xs font-bold px-6 py-3 uppercase tracking-wider rounded-md whitespace-nowrap"
          >
            Aceitar Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
