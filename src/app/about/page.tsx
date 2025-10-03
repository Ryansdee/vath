export default function AboutPage() {
  return (
    <section className="min-h-screen bg-white py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-center text-black mb-4 md:mb-6">
            About
          </h1>

          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-8 md:space-y-12">
          {/* Section VATH */}
          <div className="relative bg-white border-4 border-black p-6 md:p-8 lg:p-10">
            {/* Numéro décoratif */}
            <div className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 bg-black border-2 border-white flex items-center justify-center">
              <span className="text-white font-black text-lg md:text-xl">01</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black mb-2">
              VATH
            </h2>
            
            <p className="text-zinc-500 text-sm md:text-base uppercase tracking-wider mb-6 md:mb-8">
              @vadimthevelin
            </p>
            
            <div className="space-y-4 md:space-y-6 text-zinc-700 text-base md:text-lg leading-relaxed">
              <p>
                <span className="text-black font-bold">Photographer • Director • Videographer</span>
              </p>
              
              <p>
                Créateur visuel passionné, je capture l&apos;essence des moments à travers la photographie, 
                la réalisation et la vidéographie. Chaque projet est une opportunité de raconter une 
                histoire unique et de créer des images qui résonnent avec authenticité et émotion.
              </p>
              
              <p>
                Mon approche allie technique professionnelle et sensibilité artistique pour transformer 
                vos visions en contenus visuels percutants et mémorables.
              </p>
            </div>

            {/* Stats Instagram */}
            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t-2 border-zinc-200">
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-black mb-1">91</div>
                  <div className="text-xs md:text-sm text-zinc-500 uppercase tracking-wider">Publications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-black mb-1">1.4K</div>
                  <div className="text-xs md:text-sm text-zinc-500 uppercase tracking-wider">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-black mb-1">1K+</div>
                  <div className="text-xs md:text-sm text-zinc-500 uppercase tracking-wider">Following</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Services */}
          <div className="relative bg-white border-4 border-black p-6 md:p-8 lg:p-10">
            {/* Numéro décoratif */}
            <div className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 bg-black border-2 border-white flex items-center justify-center">
              <span className="text-white font-black text-lg md:text-xl">02</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-6 md:mb-8">
              Services
            </h2>
            
            <div className="space-y-4 md:space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-black mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-black font-bold text-base md:text-lg mb-1">Photographie</h3>
                  <p className="text-zinc-600 text-sm md:text-base">
                    Portraits, événements, produits et projets créatifs sur mesure
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-black mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-black font-bold text-base md:text-lg mb-1">Réalisation</h3>
                  <p className="text-zinc-600 text-sm md:text-base">
                    Direction artistique et conception visuelle de projets audiovisuels
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-black mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-black font-bold text-base md:text-lg mb-1">Vidéographie</h3>
                  <p className="text-zinc-600 text-sm md:text-base">
                    Production vidéo, montage et post-production professionnelle
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Contact CTA */}
          <div className="relative bg-black border-4 border-black p-6 md:p-8 lg:p-10">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6 md:mb-8 text-center">
              Travaillons ensemble
            </h2>
            
            <div className="flex flex-col items-center gap-6">
              <p className="text-zinc-400 text-base md:text-lg text-center max-w-2xl">
                Pour toute demande de collaboration, n&apos;hésitez pas à me contacter par email ou à consulter <span className="text-white font-bold">@maindoeuvre.productions</span>
              </p>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <a
                  href="https://www.instagram.com/vadimthevelin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-3 bg-white text-black px-6 md:px-8 py-4 font-black uppercase tracking-wider text-sm md:text-base transition-all duration-300 hover:bg-zinc-200"
                >
                  <div className="w-8 h-8 border-2 border-black flex items-center justify-center">
                    <span className="text-lg">IG</span>
                  </div>
                  <span>Instagram</span>
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
                  className="text-zinc-500 hover:text-white text-xs md:text-sm uppercase tracking-wider transition-colors duration-300"
                >
                  @maindoeuvre.productions
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer décoratif */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mt-12 md:mt-16 lg:mt-20">
          <div className="h-px w-12 md:w-16 bg-zinc-300"></div>
          <div className="w-2 h-2 bg-zinc-300"></div>
          <div className="h-px w-12 md:w-16 bg-zinc-300"></div>
        </div>
      </div>
    </section>
  );
}