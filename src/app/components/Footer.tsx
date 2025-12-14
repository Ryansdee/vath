"use client";
export default function Footer() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
      
      <footer className="relative bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 items-start md:items-center animate-fadeInUp">
            
            {/* Copyright - Left */}
            <div className="flex flex-col items-center md:items-start gap-2.5">
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.25em] font-light">
                © 2022 — {new Date().getFullYear()}
              </p>
              <p className="text-black text-lg md:text-xl tracking-wide font-light uppercase">
                Vadim Thevelin
              </p>
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-light">
                Tous droits réservés
              </p>
            </div>

            {/* Center - Main d'oeuvre */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <p className="text-gray-500 text-xs uppercase tracking-[0.25em] font-light">
                Main d&apos;Œuvre
              </p>
              <p className="text-gray-400 text-[9px] tracking-[0.2em] font-light">
                Productions
              </p>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Social Links - Right */}
            <div className="flex flex-col items-center md:items-end gap-5">
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.25em] font-light">
                Follow
              </p>

              <div className="flex items-center gap-8">
                {/* Instagram perso */}
                <a
                  href="https://www.instagram.com/vadimthevelin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2 transition-all duration-300"
                  aria-label="Instagram Vadim Thevelin"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-all duration-300 group-hover:scale-110"
                    >
                      <path
                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                        className="fill-black group-hover:fill-gray-500 transition-colors duration-300"
                      />
                    </svg>
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-light text-gray-500 group-hover:text-black transition-colors duration-300">
                    Personal
                  </span>
                </a>

                <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@vadimthevelin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2 transition-all duration-300"
                  aria-label="TikTok Vadim Thevelin"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-all duration-300 group-hover:scale-110"
                    >
                      <path
                        d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                        className="fill-black group-hover:fill-gray-500 transition-colors duration-300"
                      />
                    </svg>
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-light text-gray-500 group-hover:text-black transition-colors duration-300">
                    TikTok
                  </span>
                </a>

                <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>

                {/* Main d'Oeuvre */}
                <a
                  href="https://www.instagram.com/maindoeuvre.productions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2 transition-all duration-300"
                  aria-label="Instagram Main d'Oeuvre Productions"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-all duration-300 group-hover:scale-110"
                    >
                      <path
                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                        className="fill-black group-hover:fill-gray-500 transition-colors duration-300"
                      />
                    </svg>
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-light text-gray-500 group-hover:text-black transition-colors duration-300">
                    Studio
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Credit */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[9px] text-gray-400 uppercase tracking-[0.2em] font-light">
                <span>Brussels</span>
                <span className="text-gray-300">•</span>
                <span>Worldwide</span>
              </div>
              
              <p className="text-[9px] text-gray-400 font-light tracking-wide">
                Website by{" "}
                <a 
                  target="_blank" 
                  href="https://ryansdee.netlify.app/" 
                  className="text-black hover:text-gray-500 transition-colors duration-300 uppercase tracking-[0.15em]"
                >
                  Ryansdee
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}