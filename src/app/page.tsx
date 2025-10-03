import Gallery from "@/app/components/Gallery";

export default function HomePage() {
  return (
    <section className="min-h-screen bg-black py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec style street */}
        <div className="mb-8 md:mb-12 lg:mb-16">
          {/* Ligne décorative supérieure */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-10">
            <div className="h-px w-12 md:w-20 lg:w-24 bg-white opacity-20"></div>
            <div className="w-2 h-2 md:w-3 md:h-3 border border-white opacity-40"></div>
            <div className="h-px w-12 md:w-20 lg:w-24 bg-white opacity-20"></div>
          </div>

          {/* Titre principal avec effet street */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-center text-white mb-4 md:mb-6">
            <span className="relative inline-block">
              <span className="relative z-10">Vath</span>
              <span className="absolute top-1 left-1 md:top-2 md:left-2 text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-800 -z-10">
                Vath
              </span>
            </span>
          </h1>

          {/* Sous-titre */}
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <p className="text-zinc-500 text-sm md:text-base lg:text-lg uppercase tracking-wider text-center">
              Photographer / Director / Videographer
            </p>
            
            {/* Ligne décorative centrale */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-px w-8 md:w-12 bg-zinc-800"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-700"></div>
              <div className="h-px w-8 md:w-12 bg-zinc-800"></div>
            </div>
          </div>

          {/* Ligne décorative inférieure avec gradient */}
          <div className="mt-8 md:mt-10 lg:mt-12">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
          </div>
        </div>

        {/* Composant Gallery */}
        <Gallery />
      </div>
    </section>
  );
}