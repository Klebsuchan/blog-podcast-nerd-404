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
      {/* Top Header - Gradient matched to logo background */}
      <div className="bg-gradient-to-r from-[#050814] via-[#0b1f38] to-[#1fd2c9] text-white">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            
            {/* Left Section: Logo & Nav Links */}
            <div className="flex items-center h-full">
              {/* Logo Area (Hidden Admin Access) */}
              <Link to="/admin" className="flex items-center h-full mr-8" title="Área Restrita">
                <img src="/logonerd.png" alt="Logo" className="h-10 md:h-12 object-contain" />
              </Link>
              
              {/* Desktop Nav Links */}
              <nav className="hidden xl:flex items-center h-full gap-6">
                <NavLink to="/" label="HOME" active={isActive('/')} />
                <NavLink to="/blog" label="NERDS DAS ANTIGAS" active={false} />
                <NavLink to="/blog" label="NERDS INVESTEM" active={false} />
                <NavLink to="/blog" label="PAPOS DO NERD" active={false} />
                <NavLink to="/blog" label="ZOEIRA NERD SHOW" active={false} />
              </nav>
            </div>

            {/* Right side icons / Actions */}
            <div className="hidden xl:flex items-center h-full gap-4">
              <button className="text-white hover:text-gray-300">
                <Search size={22} />
              </button>
              
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
