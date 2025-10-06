export default function Footer() {
  return (
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
            <p className="text-[#090860] text-sm font-bold tracking-tight">
              Vadim Thevelin
            </p>
            <p className="text-gray-500 text-xs tracking-wide">
              Tous droits réservés
            </p>
          </div>

          {/* Center - Tagline */}
          <div className="flex flex-col items-center gap-2 py-6 md:py-0">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-2"></div>
            <p className="text-gray-600 text-xs uppercase tracking-[0.2em] font-medium">
              PHOTOGRAPHER • DIRECTOR • VIDEOGRAPHER
            </p>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mt-2"></div>
          </div>

          {/* Social Links - Right */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Follow
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/vadimthevelin/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105"
              >
                <div className="w-9 h-9 border-2 border-gray-300 group-hover:border-blue-900 group-hover:bg-blue-50/50 flex items-center justify-center transition-all duration-300 rounded-sm">
                  <span className="text-xs font-black text-gray-700 group-hover:text-blue-900">IG</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-medium text-gray-600 group-hover:text-gray-900">
                  Vath
                </span>
              </a>

              <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

              <a
                href="https://www.instagram.com/maindoeuvre.productions/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105"
              >
                <div className="w-9 h-9 border-2 border-gray-300 group-hover:border-purple-900 group-hover:bg-purple-50/50 flex items-center justify-center transition-all duration-300 rounded-sm">
                  <span className="text-xs font-black text-gray-700 group-hover:text-purple-900">IG</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-medium text-gray-600 group-hover:text-gray-900">
                  Main d&apos;Oeuvre
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}