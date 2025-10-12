"use client";
export default function Footer() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }
      `}</style>
      
      <footer className="relative backdrop-blur-md bg-gradient-to-b from-white to-white/80 border-t border-gray-200/50 py-12">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Copyright - Left */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-gray-700 text-xs uppercase tracking-widest font-semibold">
                © 2022 - {new Date().getFullYear()}
              </p>
              <p className="text-black text-sm tracking-tight font-light">
                Vadim Thevelin
              </p>
              <p className="text-gray-500 text-xs tracking-wide font-light">
                Tous droits réservés
              </p>
            </div>

            {/* Center - Main d'oeuvre */}
            <div className="flex flex-col items-center gap-2 py-6 md:py-0">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-2"></div>
              <p className="text-gray-600 text-xs uppercase tracking-[0.2em] font-light">
                Main d&apos;oeuvre
              </p>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mt-2"></div>
            </div>

            {/* Social Links - Right */}
            <div className="flex flex-col items-center md:items-end gap-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-light mx-auto text-center md:text-right">
                Follow
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/vadimthevelin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-9 h-9 flex items-center justify-center transition-all duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:opacity-70 transition-opacity">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="black"/>
                    </svg>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-light text-gray-600 group-hover:text-gray-900">
                    Vath
                  </span>
                </a>

                <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                <a
                  href="https://www.tiktok.com/@vadimthevelin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-9 h-9 flex items-center justify-center transition-all duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:opacity-70 transition-opacity">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="black"/>
                    </svg>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-light text-gray-600 group-hover:text-gray-900">
                    TikTok
                  </span>
                </a>

                <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                <a
                  href="https://www.instagram.com/maindoeuvre.productions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-9 h-9 flex items-center justify-center transition-all duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:opacity-70 transition-opacity">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="black"/>
                    </svg>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-light text-gray-600 group-hover:text-gray-900">
                    Main d&apos;Oeuvre
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-8 text-[10px] text-gray-500 italic font-light">
            made by <a target="_blank" href="https://ryansdee.netlify.app/" className="underline underline-offset-2 ml-1">Ryansdee</a> 
          </div>
        </div>
      </footer>
    </>
  );
}