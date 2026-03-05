"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const services = [
  {
    index: "01",
    title: "Photography",
    subtitle: "Still · Portrait · Campaign",
    quote: "Observing truth in the silence of a frame.",
    body: [
      "From intimate portraits to commercial campaigns, photography is where observation meets design.",
      "Every frame aims to reveal truth and atmosphere — through light, form, and precise timing.",
    ],
    cta: { label: "Explore Gallery", href: "/photo" },
    image: "/work-2.jpg",
    alt: "Photography service",
  },
  {
    index: "02",
    title: "Videography",
    subtitle: "Motion · Film · Narrative",
    quote: "The art of composition across time.",
    body: [
      "Motion allows stories to breathe — a choreography of sound, rhythm, and emotion.",
      "I produce cinematic visuals that merge technical precision with intuitive storytelling.",
    ],
    cta: { label: "Watch Projects", href: "/video" },
    image: "/work-1.jpg",
    alt: "Videography service",
    reverse: true,
  },
  {
    index: "03",
    title: "Direction",
    subtitle: "Creative · Brand · Concept",
    quote: "Translating the abstract into a cohesive visual narrative.",
    body: [
      "Beyond the lens, I offer creative direction for brands, artists, and productions seeking coherence between concept and execution.",
    ],
    cta: { label: "View Diary", href: "/diary" },
    image: "/work-4.jpg",
    alt: "Direction service",
  },
];

const process = [
  { step: "01", title: "Discovery & Intent", desc: "Understanding your vision and the soul of your story. Every collaboration begins with clarity and aligned intent." },
  { step: "02", title: "Creation & Execution", desc: "Production guided by light, rhythm, and composition — the moment the story takes its visual form." },
  { step: "03", title: "Refinement & Delivery", desc: "Precise post-production and color grading, ensuring timeless visual consistency and careful delivery." },
];

export default function ServicesPage() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .f-acid { font-family: 'Acid Grotesk', sans-serif; }
        .f-cormorant { font-family: 'Cormorant Garamond', serif; }

        ::selection { background: black; color: white; }

        .img-zoom { overflow: hidden; }
        .img-zoom img {
          transition: transform 0.9s cubic-bezier(0.16,1,0.3,1);
        }
        .img-zoom:hover img { transform: scale(1.04); }

        @keyframes expandLine {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .line-anim {
          animation: expandLine 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s both;
          transform-origin: left;
        }

        /* underline hover */
        .ul-link {
          position: relative;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .ul-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 100%; height: 1px;
          background: black;
          transform: scaleX(1);
          transform-origin: left;
          transition: transform 0.32s cubic-bezier(0.76,0,0.24,1);
        }
        .ul-link:hover::after {
          transform: scaleX(0);
          transform-origin: right;
        }

        .mq-inner {
          display: flex;
          width: max-content;
          animation: marquee 60s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <div className="f-acid bg-white text-black min-h-screen">

        {/* ═══════════════════════
            HERO
        ═══════════════════════ */}
        <header className="relative pt-36 pb-24 px-8 sm:px-12 max-w-[1300px] mx-auto">
          {/* Large decorative number */}
          <span className="f-cormorant absolute right-8 top-24 text-[22vw] font-light text-black/[0.035] leading-none select-none pointer-events-none hidden md:block">S</span>

          <motion.div
            initial="hidden" animate="visible" variants={stagger}
            className="relative z-10"
          >
            <motion.p variants={fadeUp} className="text-[8px] uppercase tracking-[0.45em] text-black/60 mb-8">
              Services — Brussels, Worldwide
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="f-cormorant font-light leading-[0.87] tracking-[-0.01em] text-black mb-10"
              style={{ fontSize: "clamp(4rem, 9vw, 9rem)" }}
            >
              The Work &<br />
              <span style={{ fontStyle: "italic" }}>The Service</span>
            </motion.h1>

            <motion.div variants={fadeUp} className="flex items-center gap-6">
              <div className="line-anim h-px bg-black/65 w-16" />
              <p className="text-[9px] uppercase tracking-[0.38em] text-black/75">
                Photography · Videography · Creative Direction
              </p>
            </motion.div>
          </motion.div>
        </header>

        {/* Marquee */}
        <div className="border-y border-black py-3.5 overflow-hidden bg-white mb-24">
          <div className="mq-inner">
            {[...Array(2)].map((_, gi) => (
              <div key={gi} className="flex items-center text-gray-700">
                {["Photography", "Videography", "Direction", "Brussels", "Worldwide", "Editorial", "Commercial", "Portrait"].map((w, i) => (
                  <span key={`${gi}-${i}`} className="flex items-center">
                    <span className="text-[8px] uppercase tracking-[0.38em] text-black px-8">{w}</span>
                    <span className="text-black/12">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════
            SERVICES
        ═══════════════════════ */}
        <section className="max-w-[1300px] mx-auto px-8 sm:px-12 space-y-0">
          {services.map((s, si) => (
            <motion.div
              key={s.index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className={`grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-black/8 py-20 md:py-24 ${si === services.length - 1 ? "border-b" : ""}`}
            >
              {/* Image — conditionally reordered */}
              <motion.div
                variants={fadeUp}
                className={`img-zoom relative ${s.reverse ? "md:order-2" : "md:order-1"}`}
                style={{ aspectRatio: "4/3" }}
              >
                <Image
                  src={s.image} alt={s.alt} fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={90}
                />
                {/* Index overlay */}
                <span
                  className="f-cormorant absolute bottom-6 right-7 text-white/0 font-light leading-none"
                  style={{ fontSize: "clamp(3rem, 5vw, 5rem)" }}
                >
                  {s.index}
                </span>
              </motion.div>

              {/* Text */}
              <div className={`flex flex-col justify-between px-0 md:px-14 lg:px-20 pt-10 md:pt-0 ${s.reverse ? "md:order-1" : "md:order-2"}`}>
                <div>
                  {/* Header */}
                  <motion.div variants={fadeUp} className="mb-8">
                    <p className="text-[8px] uppercase tracking-[0.42em] text-black/70 mb-5">{s.subtitle}</p>
                    <h2
                      className="f-cormorant font-light leading-[0.9] text-black"
                      style={{ fontSize: "clamp(2.8rem, 5vw, 4.8rem)" }}
                    >
                      {s.title}
                    </h2>
                  </motion.div>

                  {/* Body */}
                  <motion.div variants={fadeUp} className="space-y-4 mb-8">
                    {s.body.map((p, i) => (
                      <p key={i} className="text-[12.5px] leading-[1.9] text-black/50 font-light">{p}</p>
                    ))}
                  </motion.div>

                  {/* Quote */}
                  <motion.div variants={fadeUp} className="pl-4 border-l border-black/15 mb-10">
                    <p className="text-[12px] leading-relaxed text-black/60 italic f-cormorant" style={{ fontSize: "15px" }}>
                      &ldquo;{s.quote}&rdquo;
                    </p>
                  </motion.div>
                </div>

                {/* CTA */}
                <motion.div variants={fadeUp}>
                  <Link href={s.cta.href}
                    className="ul-link text-[10px] uppercase tracking-[0.28em] text-black group">
                    {s.cta.label}
                    <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      className="transition-transform group-hover:translate-x-1 duration-200">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ═══════════════════════
            PROCESS
        ═══════════════════════ */}
        <section className="py-24 md:py-32 px-8 sm:px-12 bg-white border-t border-black/8">
          <div className="max-w-[1300px] mx-auto">

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
            >
              <motion.p variants={fadeUp} className="text-[8px] uppercase tracking-[0.45em] text-black/70 mb-5">
                How it works
              </motion.p>
              <motion.h3
                variants={fadeUp}
                className="f-cormorant font-light leading-[0.9] text-black mb-20"
                style={{ fontSize: "clamp(2.6rem, 4.5vw, 4.5rem)" }}
              >
                The Process
              </motion.h3>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
            >
              {process.map((p, i) => (
                <motion.div key={p.step} variants={fadeUp}
                  className={`py-10 md:py-0 md:pr-16 border-t border-black/80 md:border-t-0 md:border-l first:border-l-0 first:border-t-0 md:first:pl-0 md:pl-16`}
                >
                  <span
                    className="f-cormorant font-light text-black/70 block mb-6 leading-none"
                    style={{ fontSize: "clamp(3rem, 4vw, 4rem)" }}
                  >
                    {p.step}
                  </span>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-black mb-4 font-medium">{p.title}</h4>
                  <p className="text-[12.5px] leading-[1.85] text-black/45 font-light">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════
            CTA
        ═══════════════════════ */}
        <section className="px-8 sm:px-12 py-28 md:py-36">
          <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={stagger}
            >
              <motion.p variants={fadeUp} className="text-[8px] uppercase tracking-[0.45em] text-black/70 mb-6">
                Start a project
              </motion.p>
              <motion.h3
                variants={fadeUp}
                className="f-cormorant font-light leading-[0.88] text-black"
                style={{ fontSize: "clamp(3rem, 5.5vw, 5.2rem)" }}
              >
                Let&apos;s<br />
                <span style={{ fontStyle: "italic" }}>Collaborate.</span>
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col items-start md:items-end gap-5"
            >
              <p className="text-[11.5px] text-black/38 max-w-[210px] leading-relaxed md:text-right font-light">
                Available for collaborations and projects worldwide — let&apos;s build something meaningful and lasting.
              </p>
              <Link href="/contact"
                className="group inline-flex items-center gap-4 border border-black/18 hover:border-black px-8 py-[14px] text-[9px] uppercase tracking-[0.32em] text-black hover:bg-black hover:text-white transition-all duration-300">
                Get in Touch
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  className="transition-transform group-hover:translate-x-1 duration-200">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}