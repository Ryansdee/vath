"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const linksLeft = [
    { href: "/photo", label: "Photo" },
    { href: "/video", label: "Video" },
    { href: "/diary", label: "Diary" },
  ];

  const linksRight = [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const mobileLinks = [
    { href: "/", label: "Accueil" },
    { href: "/photo", label: "Photo" },
    { href: "/video", label: "Video" },
    { href: "/diary", label: "Diary" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/10">
      <div className="flex items-center justify-center h-16 px-4 relative">
        {/* Burger menu / X */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden absolute left-4 w-8 h-8 flex items-center justify-center z-[60] text-white text-2xl font-light transition-transform duration-200 hover:scale-110"
          aria-label="Menu"
        >
          {isOpen ? "" : "☰"}
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-12">
          <div className="flex items-center gap-6">
            {linksLeft.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-gray-200 hover:text-gray-800 uppercase tracking-wider transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Logo center */}
          <Link
            href="/"
            className="text-xl font-black tracking-tighter text-white uppercase px-8 hover:opacity-70 transition-opacity duration-200"
          >
            VATH
          </Link>

          <div className="flex items-center gap-6">
            {linksRight.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-gray-200 hover:text-gray-800 uppercase tracking-wider transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Logo mobile */}
        <Link
          href="/"
          className="md:hidden text-lg font-black tracking-tighter text-white uppercase"
        >
          VATH
        </Link>
      </div>

      {/* Mobile menu fullscreen */}
      <div 
        className={`md:hidden fixed inset-0 bg-white z-[55] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`} style={{height : '100dvh'}} >
        {/* Bouton X dans le menu blanc */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-black text-3xl font-light hover:rotate-90 transition-transform duration-300"
          aria-label="Fermer"
        >
          X
        </button>

        <div className="flex flex-col items-center justify-center h-full gap-6">
          {mobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-black text-black uppercase tracking-tight hover:text-zinc-500 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}