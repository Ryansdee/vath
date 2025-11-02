"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const pathname = usePathname();

  const linksLeft = [
    { href: "/diary", label: "Diary" },
    { href: "/video", label: "Video" },
    { href: "/photo", label: "Photos" },
  ];

  const linksRight = [
    { href: "/about", label: "About Me" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  const mobileLinks = [
    { href: "/", label: "Home" },
    { href: "/diary", label: "Diary" },
    { href: "/video", label: "Video" },
    { href: "/photo", label: "Photos" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Détection simplifiée basée sur la route
  useEffect(() => {
    // Routes avec fond clair (blanc)
    const lightRoutes = ['/about', '/contact', '/photo', '/diary', '/video', '/success', '/admin', '/portal','/admin/portal', '/services'];
    setIsLight(lightRoutes.some(route => pathname.startsWith(route)));
  }, [pathname]);

const textColor = isOpen
  ? "text-black" // quand le menu est ouvert
  : isLight
  ? "text-black" // mode clair
  : "text-white"; // mode sombre
  const inactiveColor = isLight ? "text-black" : "text-white";
  const hoverColor = isLight ? "hover:text-black" : "hover:text-white";

  return (
    <nav className="top-0 left-0 right-0 z-50 bg-transparent absolute">
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        {/* Burger menu - Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
          aria-expanded={isOpen}
          className={`md:hidden w-8 h-8 flex items-center justify-center ${textColor} text-xl font-light transition-colors duration-200 hover:scale-110 z-[60]`}
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
                className={`text-[10px] uppercase tracking-[0.15em] transition-colors duration-200 ${
                  isActive(link.href) ? textColor : `${inactiveColor} ${hoverColor}`
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
              className={`text-sm tracking-tight ${textColor} transition-colors duration-200 whitespace-nowrap hover:opacity-60 font-light`}
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
                className={`text-[10px] uppercase tracking-[0.15em] transition-colors duration-200 ${
                  isActive(link.href) ? textColor : `${inactiveColor} ${hoverColor}`
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
          className={`md:hidden absolute left-1/2 transform -translate-x-1/2 text-sm font-light tracking-tight ${textColor} transition-colors duration-200`}
        >
          Vadim Thevelin
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
              className={`text-xl font-light uppercase tracking-wide transition-colors duration-200 text-center ${
                isActive(link.href)
                  ? "text-black"
                  : "text-black/60 hover:text-black"
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