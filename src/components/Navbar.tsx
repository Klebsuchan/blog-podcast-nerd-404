import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, User, Bell } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full font-sans">
      {/* Top Header - Dark Blue */}
      <div className="bg-[#05001d] text-white">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            
            {/* Left Section: Logo & Nav Links */}
            <div className="flex items-center h-full">
              {/* Logo Area */}
              <Link to="/" className="flex items-center h-full mr-8">
                <div className="bg-[#0000ff] h-full flex items-center px-4">
                  <div className="flex items-center gap-2">
                     {/* Simplified logo placeholder resembling the die/text */}
                    <div className="flex bg-white p-1 rounded-sm gap-0.5">
                       <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                       <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                    </div>
                    <span className="font-bold text-2xl tracking-tighter text-white font-serif italic">ei<span className="uppercase font-sans not-italic font-black">NERD!</span></span>
                  </div>
                </div>
              </Link>
              
              {/* Desktop Nav Links */}
              <nav className="hidden xl:flex items-center h-full gap-6">
                <NavLink to="/" label="HOME" active={isActive('/')} />
                <NavLink to="/blog" label="CINEMA E TV" active={false} />
                <NavLink to="/blog" label="QUADRINHOS" active={false} />
                <NavLink to="/blog" label="OTAKU" active={false} />
                <NavLink to="/blog" label="GAMES" active={false} />
                <NavLink to="/blog" label="LISTAS" active={false} />
                <NavLink to="/blog" label="MÚSICA" active={false} />
                <NavLink to="/blog" label="CURIOSIDADES" active={false} />
                <NavLink to="/blog" label="ESPORTS" active={false} />
                <NavLink to="/blog" label="POP NEWS" active={false} />
              </nav>
            </div>

            {/* Right side icons / Actions */}
            <div className="hidden xl:flex items-center h-full gap-4">
              <button className="text-white hover:text-gray-300">
                <Search size={22} />
              </button>
              
              <Link to="/assine" className="bg-[#0000ff] hover:bg-blue-700 text-white text-xs font-bold px-6 py-2 ml-4 h-9 flex items-center transition-colors">
                ASSINE
              </Link>
              
              <Link to={user ? "/admin" : "/login"} className="flex items-center gap-2 text-white text-xs font-bold hover:text-gray-300 ml-2">
                <User size={18} />
                {user ? "ADMIN" : "ENTRAR"}
              </Link>
              
              <button className="text-gray-400 hover:text-white ml-2 bg-[#ffffff1a] p-2 rounded-full">
                <Bell size={18} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center">
              <button className="text-white">
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label, active }: { to: string, label: string, active: boolean }) {
  return (
    <Link
      to={to}
      className={`text-xs font-bold uppercase tracking-wide h-full flex items-center transition-colors border-b-2 ${
        active 
          ? 'text-white border-white' 
          : 'text-gray-300 border-transparent hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
