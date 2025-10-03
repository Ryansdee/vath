import Lightbox from "../../components/Lightbox";

interface GalleryPageProps {
  params: { slug: string };
}

const collections: Record<string, { src: string; alt: string }[]> = {
  mariages: [
    { src: "/uploads/mariage1.jpg", alt: "Mariage 1" },
    { src: "/uploads/mariage2.jpg", alt: "Mariage 2" },
  ],
  paysages: [
    { src: "/uploads/paysage1.jpg", alt: "Paysage 1" },
    { src: "/uploads/paysage2.jpg", alt: "Paysage 2" },
  ],
};

export default function GalleryPage({ params }: GalleryPageProps) {
  const photos = collections[params.slug] || [];

  return (
    <section className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8 min-h-screen bg-black">
      {/* Header avec style street */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-12 lg:mb-16">
        {/* Ligne décorative supérieure */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="h-px w-8 md:w-16 bg-white opacity-20"></div>
          <div className="w-2 h-2 border border-white opacity-40"></div>
          <div className="h-px w-8 md:w-16 bg-white opacity-20"></div>
        </div>

        {/* Titre avec effet street */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-center text-white mb-3 md:mb-4">
          <span className="relative inline-block">
            <span className="relative z-10">{params.slug}</span>
            <span className="absolute top-1 left-1 md:top-1.5 md:left-1.5 text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-800 -z-10">
              {params.slug}
            </span>
          </span>
        </h1>

        {/* Compteur de photos */}
        {photos.length > 0 && (
          <p className="text-center text-zinc-500 text-xs md:text-sm uppercase tracking-wider">
            {photos.length} {photos.length > 1 ? 'Photos' : 'Photo'}
          </p>
        )}

        {/* Ligne décorative inférieure */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mt-6 md:mt-8">
          <div className="h-px w-16 md:w-24 lg:w-32 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto">
        {photos.length > 0 ? (
          <Lightbox images={photos} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 lg:py-32">
            {/* Message vide avec style */}
            <div className="relative mb-6 md:mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-zinc-800 flex items-center justify-center">
                <span className="text-2xl md:text-3xl text-zinc-700 font-black">∅</span>
              </div>
            </div>
            
            <p className="text-zinc-600 text-sm md:text-base lg:text-lg uppercase tracking-wider text-center px-4">
              Aucune photo trouvée
            </p>
            
            <p className="text-zinc-700 text-xs md:text-sm mt-2 text-center px-4">
              Cette collection est vide pour le moment
            </p>

            {/* Décoration */}
            <div className="flex items-center gap-3 md:gap-4 mt-8 md:mt-12">
              <div className="h-px w-8 md:w-12 bg-zinc-800"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-800"></div>
              <div className="h-px w-8 md:w-12 bg-zinc-800"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}