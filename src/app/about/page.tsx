"use client";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-32 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-3 tracking-tight">
            About
          </h1>
          <p className="text-gray-500 text-sm">
            Visual creator & storyteller
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Bio Section */}
          <section className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-8">
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto md:mx-0">
                  <Image
                    src="/logo.jpg"
                    alt="Vadim Thevelin"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
                    Vadim Thevelin
                  </h2>
                  <a
                    href="https://www.instagram.com/vadimthevelin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-[#090860] transition-colors"
                  >
                    @vadimthevelin
                  </a>
                </div>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg md:text-xl text-black font-medium">
                    Photographer • Director • Videographer
                  </p>

                  <p>
                    I&apos;m a visual creator passionate about capturing the essence of moments through 
                    photography, direction, and videography. Each project is an opportunity to tell 
                    a unique story and create images that resonate with authenticity and emotion.
                  </p>

                  <p>
                    My approach combines professional technique with artistic sensitivity to transform 
                    your visions into impactful and memorable visual content.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-black mb-2">91</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-black mb-2">1.4K</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-black mb-2">1K+</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-8 tracking-tight">
              Services
            </h2>

            <div className="space-y-8">
              <div className="group">
                <h3 className="text-xl font-bold text-black mb-2 group-hover:text-[#090860] transition-colors">
                  Photography
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Portraits, events, products and custom creative projects
                </p>
              </div>

              <div className="group">
                <h3 className="text-xl font-bold text-black mb-2 group-hover:text-[#090860] transition-colors">
                  Direction
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Artistic direction and visual design for audiovisual projects
                </p>
              </div>

              <div className="group">
                <h3 className="text-xl font-bold text-black mb-2 group-hover:text-[#090860] transition-colors">
                  Videography
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Video production, editing and professional post-production
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="animate-fade-in-up bg-gray-50 -mx-6 px-6 py-16 md:-mx-0 md:px-12" style={{ animationDelay: "200ms" }}>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6 tracking-tight">
                Let&apos;s work together
              </h2>

              <p className="text-gray-600 mb-10 leading-relaxed">
                For any collaboration request, feel free to contact me by email or check out{" "}
                <a
                  href="https://www.instagram.com/maindoeuvre.productions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#090860] font-semibold hover:underline"
                >
                  @maindoeuvre.productions
                </a>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="https://www.instagram.com/vadimthevelin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold transition-all duration-200 hover:bg-gray-800"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>

                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black text-black font-semibold transition-all duration-200 hover:bg-black hover:text-white"
                >
                  Contact
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}