export default function AboutPage() {
  return (
    <section className="min-h-screen bg-black py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="h-px w-12 md:w-20 bg-white opacity-20"></div>
            <div className="w-2 h-2 md:w-3 md:h-3 border border-white opacity-40"></div>
            <div className="h-px w-12 md:w-20 bg-white opacity-20"></div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-center text-white mb-4 md:mb-6">
            <span className="relative inline-block">
              <span className="relative z-10">&agrave; propos</span>
              <span className="absolute top-1 left-1 md:top-1.5 md:left-1.5 text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-800 -z-10">
                &agrave; propos
              </span>
            </span>
          </h1>

          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-8 md:space-y-12">
          {/* Section VATH */}
          <div className="relative bg-zinc-900 border-2 border-zinc-800 p-6 md:p-8 lg:p-10">
            {/* Numéro décoratif */}
            <div className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-black flex items-center justify-center">
              <span className="text-black font-black text-lg md:text-xl">01</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-2">
              VATH
            </h2>
            
            <p className="text-zinc-500 text-sm md:text-base uppercase tracking-wider mb-6 md:mb-8">
              @vadimthevelin
            </p>
            
            <div className="space-y-4 md:space-y-6 text-zinc-400 text-base md:text-lg leading-relaxed">
              <p>
                <span className="text-white font-bold">Photographer • Director • Videographer</span>
              </p>
              
              <p>
                Cr&eacute;ateur visuel passionn&eacute;, je capture l&apos;essence des moments &agrave; travers la photographie, 
                la r&eacute;alisation et la vid&eacute;ographie. Chaque projet est une opportunit&eacute; de raconter une 
                histoire unique et de cr&eacute;er des images qui r&eacute;sonnent avec authenticit&eacute; et &eacute;motion.
              </p>
              
              <p>
                Mon approche allie technique professionnelle et sensibilit&eacute; artistique pour transformer 
                vos visions en contenus visuels percutants et m&eacute;morables.
              </p>
            </div>

            {/* Coin décoratif */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-white opacity-20"></div>
          </div>

          {/* Section Services */}
          <div className="relative bg-zinc-900 border-2 border-zinc-800 p-6 md:p-8 lg:p-10">
            {/* Numéro décoratif */}
            <div className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-black flex items-center justify-center">
              <span className="text-black font-black text-lg md:text-xl">02</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6 md:mb-8">
              Services
            </h2>
            
            <div className="space-y-4 md:space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-white mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-bold text-base md:text-lg mb-1">Photographie</h3>
                  <p className="text-zinc-500 text-sm md:text-base">
                    Portraits, &eacute;v&eacute;nements, produits et projets cr&eacute;atifs sur mesure
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-white mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-bold text-base md:text-lg mb-1">R&eacute;alisation</h3>
                  <p className="text-zinc-500 text-sm md:text-base">
                    Direction artistique et conception visuelle de projets audiovisuels
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-white mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-bold text-base md:text-lg mb-1">Vid&eacute;ographie</h3>
                  <p className="text-zinc-500 text-sm md:text-base">
                    Production vid&eacute;o, montage et post-production professionnelle
                  </p>
                </div>
              </div>
            </div>

            {/* Coin décoratif */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-white opacity-20"></div>
          </div>

          {/* Section Contact CTA */}
          <div className="relative bg-black border-4 border-white p-6 md:p-8 lg:p-10">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6 md:mb-8 text-center">
              Travaillons ensemble
            </h2>
            
            <div className="flex flex-col items-center gap-6">
              <p className="text-zinc-400 text-base md:text-lg text-center max-w-2xl">
                Pour toute demande de collaboration, n&apos;h&eacute;sitez pas &agrave; me contacter par email ou &agrave; consulter <span className="text-white font-bold">@maindoeuvre.productions</span>
              </p>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <a
                  href="https://www.instagram.com/vadimthevelin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-3 bg-white text-black px-6 md:px-8 py-4 font-black uppercase tracking-wider text-sm md:text-base transition-all duration-300 hover:bg-zinc-200 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]"
                >
                  <div className="w-8 h-8 border-2 border-black flex items-center justify-center">
                    <span className="text-lg">IG</span>
                  </div>
                  <span>Instagram</span>
                  <span className="absolute top-0 right-0 w-3 h-3 bg-black"></span>
                </a>

                <a
                  href="/contact"
                  className="group relative inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-6 md:px-8 py-4 font-black uppercase tracking-wider text-sm md:text-base transition-all duration-300 hover:bg-white hover:text-black"
                >
                  <span>Contact</span>
                  <span className="text-lg">→</span>
                </a>
              </div>

              {/* Link maindoeuvre */}
              <div className="mt-4">
                <a
                  href="https://www.instagram.com/maindoeuvre.productions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-white text-xs md:text-sm uppercase tracking-wider transition-colors duration-300"
                >
                  @maindoeuvre.productions
                </a>
              </div>
            </div>

            {/* Coins décoratifs */}
            <div className="absolute -top-2 -left-2 w-6 h-6 md:w-8 md:h-8 border-t-4 border-l-4 border-white"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 border-t-4 border-r-4 border-white"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 md:w-8 md:h-8 border-b-4 border-l-4 border-white"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 md:w-8 md:h-8 border-b-4 border-r-4 border-white"></div>
          </div>
        </div>

        {/* Footer décoratif */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mt-12 md:mt-16 lg:mt-20">
          <div className="h-px w-12 md:w-16 bg-zinc-800"></div>
          <div className="w-2 h-2 bg-zinc-800"></div>
          <div className="h-px w-12 md:w-16 bg-zinc-800"></div>
        </div>
      </div>
    </section>
  );
}