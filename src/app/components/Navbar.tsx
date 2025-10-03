"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative flex justify-between items-center p-4 md:p-6 bg-black sticky top-0 z-50 border-b border-zinc-800">
      {/* Effet grunge overlay subtil */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
      
      {/* Logo avec effet street */}
      <Link 
        href="/" 
        className="relative text-xl md:text-2xl font-black tracking-tighter text-white uppercase group transition-all duration-300 z-50"
      >
        <span className="relative z-10">Vath</span>
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
        {/* Effet shadow street */}
        <span className="absolute top-0.5 left-0.5 text-xl md:text-2xl font-black tracking-tighter text-zinc-700 -z-10">Vath</span>
      </Link>
      
      {/* Burger menu pour mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5 z-50"
        aria-label="Menu"
      >
        <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
        <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>

      {/* Menu desktop */}
      <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
        <Link 
          href="/" 
          className="relative text-sm font-medium text-zinc-400 hover:text-white uppercase tracking-wider transition-colors duration-300 group"
        >
          Accueil
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link 
          href="/about" 
          className="relative text-sm font-medium text-zinc-400 hover:text-white uppercase tracking-wider transition-colors duration-300 group"
        >
          <span style={{textTransform : "uppercase"}}>&agrave;</span> propos
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link 
          href="/contact" 
          className="relative px-4 py-2 text-sm font-bold text-black bg-white uppercase tracking-wider transition-all duration-300 hover:bg-zinc-200 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
        >
          Contact
        </Link>
      </div>

      {/* Menu mobile fullscreen */}
      <div className={`md:hidden fixed inset-0 bg-black transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)}
            className="relative text-2xl font-black text-zinc-400 hover:text-white uppercase tracking-wider transition-colors duration-300 group"
          >
            <span className="relative z-10">Accueil</span>
            <span className="absolute top-0.5 left-0.5 text-2xl font-black text-zinc-800 -z-10">Accueil</span>
          </Link>
          <Link 
            href="/about" 
            onClick={() => setIsOpen(false)}
            className="relative text-2xl font-black text-zinc-400 hover:text-white uppercase tracking-wider transition-colors duration-300 group"
          >
            <span className="relative z-10">&agrave; propos</span>
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setIsOpen(false)}
            className="relative px-8 py-4 text-xl font-black text-black bg-white uppercase tracking-wider transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] mt-4"
          >
            Contact
          </Link>

          {/* Décoration mobile */}
          <div className="absolute bottom-10 flex items-center gap-4">
            <div className="h-px w-12 bg-white opacity-20"></div>
            <div className="w-2 h-2 border border-white opacity-40"></div>
            <div className="h-px w-12 bg-white opacity-20"></div>
          </div>
        </div>
      </div>
      
      {/* Ligne décorative street style */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
    </nav>
  );
}