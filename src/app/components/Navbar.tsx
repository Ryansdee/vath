"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const linksLeft = [
    { href: "/diary", label: "Diary" },
    { href: "/video", label: "Video" },
    { href: "/photo", label: "Photos" },
  ];

  const linksRight = [
    { href: "/about", label: "About Me" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const mobileLinks = [
    { href: "/", label: "Home" },
    { href: "/diary", label: "Diary" },
    { href: "/video", label: "Video" },
    { href: "/photo", label: "Photos" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        {/* Burger menu - Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
          aria-expanded={isOpen}
          className="md:hidden w-8 h-8 flex items-center justify-center text-[#090860] text-2xl font-light transition-transform duration-200 hover:scale-110 z-[60]"
        >
          {isOpen ? "✕" : "☰"}
        </button>

        {/* Desktop navigation - Three columns layout */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-8 items-center w-full">
          {/* Left links */}
          <div className="flex items-center justify-end gap-6">
            {linksLeft.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-medium uppercase tracking-wider transition-all duration-200 pb-0.5 border-b-[3px] ${
                  isActive(link.href)
                    ? "text-[#090860] border-[#090860]"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:border-[#090860]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center logo */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="text-xl tracking-tighter text-[#090860] transition-opacity duration-200 whitespace-nowrap hover:opacity-80"
            >
              Vadim Thevelin
            </Link>
          </div>

          {/* Right links */}
          <div className="flex items-center justify-start gap-6">
            {linksRight.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-medium uppercase tracking-wider transition-all duration-200 pb-0.5 border-b-[3px] ${
                  isActive(link.href)
                    ? "text-[#090860] border-[#090860]"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:border-[#090860]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile logo - Centered */}
        <Link
          href="/"
          className="md:hidden absolute left-1/2 transform -translate-x-1/2 text-xl font-bold tracking-tighter text-[#090860] transition-opacity duration-200"
        >
          Vadmin Thevelin
        </Link>

        {/* Spacer for mobile to balance the layout */}
        <div className="md:hidden w-8"></div>
      </div>

      {/* Mobile menu fullscreen */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-[55] transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        style={{ height: "100dvh" }}
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile links - Centered vertically and horizontally */}
        <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
          {mobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-2xl font-black uppercase tracking-tight transition-colors duration-200 text-center ${
                isActive(link.href)
                  ? "text-[#090860]"
                  : "text-black hover:text-zinc-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}