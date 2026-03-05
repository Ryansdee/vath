"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const workImages = ["/work-1.jpg", "/logo.jpg", "/work-2.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % workImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [workImages.length]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body { overflow-x: hidden; }

        .font-acid { font-family: 'Acid Grotesk', sans-serif; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        .fade-up { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.15s; }
        .fade-up-3 { animation-delay: 0.28s; }
        .fade-up-4 { animation-delay: 0.42s; }
        .fade-up-5 { animation-delay: 0.56s; }

        .line-grow {
          animation: lineGrow 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both;
          transform-origin: left;
        }

        .img-hover { transition: transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.5s ease; }
        .img-hover:hover { transform: scale(1.03); filter: grayscale(0%) !important; }

        .link-underline {
          position: relative;
          text-decoration: none;
        }
        .link-underline::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 100%; height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }
        .link-underline:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .marquee-track {
          display: flex;
          gap: 60px;
          animation: marquee 18s linear infinite;
          white-space: nowrap;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .grain-overlay::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999;
          opacity: 0.4;
        }
      `}</style>

      <div className="font-acid grain-overlay min-h-screen bg-white text-black py-8">

        {/* ── HERO ── */}
        <section ref={heroRef} className="relative min-h-screen flex flex-col">

          {/* Parallax large number */}
          <div
            className="font-cormorant absolute right-[-2vw] top-[10vh] text-[28vw] font-light text-black/[0.03] leading-none select-none pointer-events-none z-0"
            style={{ transform: `translateY(${scrollY * 0.12}px)` }}
            aria-hidden
          >
            V
          </div>

          {/* Top label row */}
          <div className="fade-up fade-up-1 flex items-center justify-between px-6 sm:px-10 pt-10 relative z-10">
            <span className="text-[9px] uppercase tracking-[0.3em] text-black/40">About</span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-black/40">Brussels — Worldwide</span>
          </div>

          {/* Main layout */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-0 mt-8 md:mt-0 relative z-10">

            {/* ── Images column ── */}
            <div className="relative">

              {/* Mobile carousel */}
              <div className="md:hidden relative aspect-[3/4] overflow-hidden">
                {workImages.map((img, i) => (
                  <Image
                    key={i} src={img} alt={`Vadim Thevelin ${i + 1}`} fill
                    className={`object-cover transition-opacity duration-1000 ${i === currentImageIndex ? "opacity-100" : "opacity-0"}`}
                    sizes="100vw" quality={90} priority={i === 0}
                  />
                ))}
                {/* Dots */}
                <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
                  {workImages.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImageIndex(i)}
                      className={`h-px transition-all duration-500 bg-white ${i === currentImageIndex ? "w-8 opacity-100" : "w-3 opacity-40"}`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop stacked images */}
              <div className="hidden md:flex flex-col h-full">
                {/* Main large image */}
                <div className="fade-up fade-up-2 relative flex-1 overflow-hidden" style={{ minHeight: "55vh" }}>
                  <div className="img-hover w-full h-full">
                    <Image src={workImages[currentImageIndex]} alt="Vadim Thevelin at work"
                      fill className="object-cover grayscale" sizes="50vw" quality={90} priority />
                  </div>
                  {/* Image counter */}
                  <div className="absolute bottom-5 right-5 font-cormorant text-white/60 text-sm tracking-widest">
                    {String(currentImageIndex + 1).padStart(2, "0")} / {String(workImages.length).padStart(2, "0")}
                  </div>
                </div>

                {/* Thumbnail strip */}
                <div className="fade-up fade-up-3 flex gap-2 p-3 bg-white">
                  {workImages.map((img, i) => (
                    <button key={i} onClick={() => setCurrentImageIndex(i)}
                      className={`relative flex-1 aspect-[4/3] overflow-hidden transition-all duration-300 ${i === currentImageIndex ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="15vw" quality={60} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Text column ── */}
            <div className="flex flex-col justify-between px-8 sm:px-12 md:px-16 py-12 md:py-16">
              <div>
                {/* Name */}
                <div className="fade-up fade-up-2 mb-2">
                  <span className="text-[9px] uppercase tracking-[0.35em] text-black/35 block mb-4">Photographer · Videographer · Director</span>
                  <h1 className="font-cormorant text-[clamp(3rem,7vw,6rem)] font-light leading-[0.9] tracking-tight text-black">
                    Vadim<br />
                    <em className="not-italic">Thevelin</em>
                  </h1>
                </div>

                {/* Decorative line */}
                <div className="line-grow h-px bg-black/15 my-8 md:my-10" />

                {/* Bio */}
                <div className="fade-up fade-up-3 space-y-5 max-w-sm">
                  <p className="text-[13px] leading-[1.85] text-black/60 font-light">
                    Based in Brussels, available for projects worldwide. My work is driven by a passion for creating bold, meaningful visuals that connect people and ideas.
                  </p>
                  <p className="text-[13px] leading-[1.85] text-black/60 font-light">
                    Every project is a collaboration — a space where vision, trust, and creativity come together. Whether behind the camera or leading a team, my goal is always the same: craft images and films that inspire, empower, and leave a lasting impression.
                  </p>
                </div>
              </div>

              {/* Bottom section */}
              <div className="fade-up fade-up-4 mt-12 md:mt-0">
                {/* Social */}
                <div className="flex flex-col gap-3 mb-10">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-black/30 mb-1">Find me</span>
                  {[
                    { label: "Instagram", href: "https://www.instagram.com/vadimthevelin/" },
                    { label: "Main d'Oeuvre", href: "https://www.instagram.com/maindoeuvre.productions/" },
                  ].map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="link-underline flex items-center justify-between group w-full max-w-xs py-2 border-b border-black/10 hover:border-black/30 transition-colors">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-black/70 group-hover:text-black transition-colors">{s.label}</span>
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="opacity-30 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 -translate-y-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </a>
                  ))}
                </div>

                {/* CTA */}
                <Link href="/contact"
                  className="group inline-flex items-center gap-4 px-7 py-4 bg-black text-white text-[10px] uppercase tracking-[0.25em] hover:bg-black/85 transition-colors">
                  Get in Touch
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    className="transition-transform group-hover:translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Marquee band ── */}
        <div className="fade-up fade-up-5 border-y border-black/10 py-4 overflow-hidden bg-white">
          <div className="marquee-track">
            {[...Array(2)].map((_, gi) => (
              <div key={gi} className="flex gap-[60px] flex-shrink-0">
                {["Photography", "•", "Videography", "•", "Direction", "•", "Brussels", "•", "Worldwide", "•"].map((w, i) => (
                  <span key={i} className={`text-[10px] uppercase tracking-[0.3em] ${w === "•" ? "text-black/20" : "text-black/40"}`}>{w}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats / Info row ── */}
        <section className="fade-up fade-up-5 grid grid-cols-2 md:grid-cols-4 border-b border-black/10">
          {[
            { label: "Based in", value: "Brussels" },
            { label: "Available", value: "Worldwide" },
            { label: "Speciality", value: "Visual Arts" },
            { label: "Status", value: "Open for work" },
          ].map((item, i) => (
            <div key={i} className={`px-8 py-8 flex flex-col gap-2 ${i < 3 ? "border-r border-black/10" : ""}`}>
              <span className="text-[9px] uppercase tracking-[0.3em] text-black/30">{item.label}</span>
              <span className="font-cormorant text-[22px] font-light text-black">{item.value}</span>
            </div>
          ))}
        </section>

        {/* ── CTA section ── */}
        <section className="px-6 sm:px-10 py-24 md:py-32 flex flex-col md:flex-row items-start md:items-end justify-between gap-10 max-w-[1400px] mx-auto">
          <div className="fade-up fade-up-2">
            <span className="text-[9px] uppercase tracking-[0.35em] text-black/30 block mb-4">Next step</span>
            <h2 className="font-cormorant text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-tight text-black">
              Let&apos;s work<br /><em className="italic">together</em>
            </h2>
          </div>
          <div className="fade-up fade-up-3 flex flex-col gap-4 items-start md:items-end">
            <p className="text-[12px] text-black/45 max-w-[240px] leading-relaxed md:text-right">
              Available for commissions, collaborations, and long-term projects.
            </p>
            <Link href="/contact"
              className="group inline-flex items-center gap-4 border border-black px-7 py-3.5 text-[10px] uppercase tracking-[0.25em] text-black hover:bg-black hover:text-white transition-all duration-300">
              Contact
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                className="transition-transform group-hover:translate-x-1">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}