import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Image de background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-background.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Contenu */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 md:px-6">
        {/* Titre principal avec effet street */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-center text-white mb-6 md:mb-8">
          <span className="relative inline-block">
            <span className="relative">VATH</span>
            <span className="absolute top-1.5 left-1.5 md:top-2 md:left-2 text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-800 -z-10">
              VATH
            </span>
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="text-zinc-300 text-base md:text-lg lg:text-xl uppercase tracking-wider text-center mb-8 md:mb-12">
          Photographer • Director • Videographer
        </p>

        {/* Ligne décorative */}
        <div className="flex items-center gap-4 mb-12 md:mb-16">
          <div className="h-px w-12 md:w-16 bg-white opacity-30"></div>
          <div className="w-2 h-2 border border-white opacity-50"></div>
          <div className="h-px w-12 md:w-16 bg-white opacity-30"></div>
        </div>

        {/* Boutons CTA */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          <Link
            href="/contact"
            className="px-8 md:px-10 py-4 md:py-5 bg-transparent border-2 border-white text-white font-black uppercase tracking-wider text-sm md:text-base transition-all duration-200 hover:bg-white hover:text-black"
          >
            Me contacter
          </Link>
        </div>
      </div>
    </section>
  );
}