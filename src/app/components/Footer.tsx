export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-zinc-800 py-12 mt-20">
      {/* Texture overlay subtile */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
      
      <div className="container mx-auto px-8 relative">
        {/* Ligne décorative supérieure */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
          {/* Copyright avec style street */}
          <div className="flex flex-col items-center sm:items-start">
            <p className="text-white font-black text-xl uppercase tracking-tighter mb-2">
              <span className="relative">
                Vath
                <span className="absolute top-0.5 left-0.5 text-zinc-800 -z-10">Vath</span>
              </span>
            </p>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">
              &copy; {new Date().getFullYear()} Tous droits r&eacute;serv&eacute;s
            </p>
          </div>
          
          {/* Liens Instagram avec style minimaliste */}
          <div className="flex gap-6 items-center">
            <a
              href="https://www.instagram.com/vadimthevelin/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              <div className="flex items-center gap-3">
                {/* Icône Instagram stylisée */}
                <div className="w-10 h-10 border-2 border-zinc-700 group-hover:border-white transition-all duration-300 flex items-center justify-center">
                  <span className="text-zinc-500 group-hover:text-white text-lg font-bold transition-colors duration-300">IG</span>
                </div>
                <span className="text-zinc-500 group-hover:text-white uppercase text-sm font-medium tracking-wider transition-colors duration-300">
                  Instagram 1
                </span>
              </div>
              {/* Ligne de soulignement */}
              <div className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300"></div>
            </a>

            {/* Séparateur vertical */}
            <div className="h-8 w-px bg-zinc-800"></div>

            <a
              href="https://www.instagram.com/maindoeuvre.productions/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              <div className="flex items-center gap-3">
                {/* Icône Instagram stylisée */}
                <div className="w-10 h-10 border-2 border-zinc-700 group-hover:border-white transition-all duration-300 flex items-center justify-center">
                  <span className="text-zinc-500 group-hover:text-white text-lg font-bold transition-colors duration-300">IG</span>
                </div>
                <span className="text-zinc-500 group-hover:text-white uppercase text-sm font-medium tracking-wider transition-colors duration-300">
                  Instagram 2
                </span>
              </div>
              {/* Ligne de soulignement */}
              <div className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300"></div>
            </a>
          </div>
        </div>

        {/* Ligne décorative inférieure avec effet street */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-white opacity-20"></div>
          <div className="w-2 h-2 border border-white opacity-40"></div>
          <div className="h-px w-16 bg-white opacity-20"></div>
        </div>
      </div>
    </footer>
  );
}