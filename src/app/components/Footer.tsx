export default function Footer() {
  return (
    <footer className="backdrop-blur-md bg-black/80 border-t border-white/10 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="flex items-center gap-6">
            <p className="text-white text-xs uppercase tracking-wider">
              © {new Date().getFullYear()} Vath
            </p>
            <div className="hidden md:block h-4 w-px bg-zinc-800"></div>
            <p className="text-white text-xs">
              Tous droits réservés
            </p>
          </div>

          {/* Links sociaux */}
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/vadimthevelin/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors duration-200"
            >
              <div className="w-7 h-7 border border-zinc-700 hover:border-white flex items-center justify-center transition-colors duration-200">
                <span className="text-[10px] font-bold">IG</span>
              </div>
              <span className="text-xs uppercase tracking-wider">Vath</span>
            </a>

            <div className="h-4 w-px bg-zinc-800"></div>

            <a
              href="https://www.instagram.com/maindoeuvre.productions/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors duration-200"
            >
              <div className="w-7 h-7 border border-zinc-700 hover:border-white flex items-center justify-center transition-colors duration-200">
                <span className="text-[10px] font-bold">IG</span>
              </div>
              <span className="text-xs uppercase tracking-wider">Main d&apos;Oeuvre</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}