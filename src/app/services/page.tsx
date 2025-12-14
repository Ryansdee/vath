"use client";
import Link from "next/link";
import { motion, Variants } from "framer-motion"; // <-- IMPORT DU TYPE 'Variants'
import Image from "next/image";

// Variants for subtle entry animations
const containerVariants: Variants = { // <-- TYPAGE EXPLICITE
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// CORRECTION APPLIQUÉE ICI : Utilisation d'un tableau de Bézier cubique pour l'easing
// [0, 0, 0.58, 1] est proche d'un 'ease-out' classique.
const itemVariants: Variants = { // <-- TYPAGE EXPLICITE
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
        duration: 0.7, 
        ease: [0, 0, 0.58, 1] // Easing custom reconnu par TypeScript
    },
  },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Hero */}
      <header className="pt-32 pb-24 text-center px-6">
        <motion.h1
          className="text-5xl md:text-8xl font-serif font-light uppercase tracking-tighter"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0, 0, 0.58, 1] }} 
        >
          The Work & The Service
        </motion.h1>
        <motion.p
          className="text-gray-500 text-sm mt-8 uppercase tracking-[0.4em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.0 }}
        >
          Photography • Videography • Creative Direction
        </motion.p>
      </header>

      {/* Core Services */}
      <section className="max-w-7xl mx-auto px-6 pb-40 space-y-40">
        {/* Photography */}
        <motion.div
          className="grid md:grid-cols-5 gap-16 items-start group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0, 0, 0.58, 1] }}
        >
          <div className="md:col-span-2 pt-8">
            <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">Photography</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              From intimate portraits to commercial campaigns, photography is where observation meets design. 
              Every frame aims to reveal truth and atmosphere — through light, form, and precise timing.
            </p>
            <p className="text-gray-600 leading-relaxed italic border-l pl-4 border-gray-200">
              “Observing truth in the silence of a frame.”
            </p>
            <Link
              href="/photo"
              className="mt-10 inline-block text-sm uppercase tracking-wide border-b border-black pb-0.5 hover:tracking-wider transition-all duration-300"
            >
              Explore Gallery →
            </Link>
          </div>
          <div className="md:col-span-3 aspect-[3/4] md:aspect-[5/4] overflow-hidden relative shadow-xl">
            <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-[1.03]">
              <Image
                src="/work-2.jpg"
                alt="Photography service"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Videography */}
        <motion.div
          className="grid md:grid-cols-5 gap-16 items-start md:flex-row-reverse group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0, 0, 0.58, 1] }}
        >
          <div className="md:col-span-3 aspect-[3/4] md:aspect-[5/4] overflow-hidden relative md:order-1 shadow-xl">
             <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-[1.03]">
              <Image
                src="/work-1.jpg"
                alt="Videography service"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </div>
          </div>
          <div className="md:col-span-2 pt-8 md:order-2">
            <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">Videography</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Motion allows stories to breathe — a choreography of sound, rhythm, and emotion. 
              I produce cinematic visuals that merge technical precision with intuitive storytelling.
            </p>
            <p className="text-gray-600 leading-relaxed italic border-l pl-4 border-gray-200">
              “The art of composition across time.”
            </p>
            <Link
              href="/video"
              className="mt-10 inline-block text-sm uppercase tracking-wide border-b border-black pb-0.5 hover:tracking-wider transition-all duration-300"
            >
              Watch Projects →
            </Link>
          </div>
        </motion.div>

        {/* Direction */}
        <motion.div
          className="grid md:grid-cols-5 gap-16 items-start group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0, 0, 0.58, 1] }}
        >
          <div className="md:col-span-2 pt-8">
            <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">Direction</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Beyond the lens, I offer creative direction for brands, artists, and productions seeking coherence between concept and execution.
            </p>
            <p className="text-gray-600 leading-relaxed italic border-l pl-4 border-gray-200">
              “Translating the abstract into a cohesive visual narrative.”
            </p>
            <Link
              href="/diary"
              className="mt-10 inline-block text-sm uppercase tracking-wide border-b border-black pb-0.5 hover:tracking-wider transition-all duration-300"
            >
              View Diary →
            </Link>
          </div>
          <div className="md:col-span-3 aspect-[3/4] md:aspect-[5/4] overflow-hidden relative shadow-xl">
            <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-[1.03]">
              <Image
                src="/work-4.jpg"
                alt="Direction service"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Process Section - Using Framer Motion for sequential animation */}
      <section className="max-w-6xl mx-auto px-6 text-center pb-40">
        <motion.h3
          className="text-4xl md:text-5xl font-light mb-16 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0, 0, 0.58, 1] }}
        >
          The Process
        </motion.h3>
        <motion.div 
          className="grid md:grid-cols-3 gap-y-12 md:gap-x-20 text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {[
            {
              step: "01",
              title: "Discovery & Intent",
              desc: "Understanding your vision and the soul of your story. Every collaboration begins with clarity and aligned intent.",
            },
            {
              step: "02",
              title: "Creation & Execution",
              desc: "Production guided by light, rhythm, and composition — the moment the story takes its visual form.",
            },
            {
              step: "03",
              title: "Refinement & Delivery",
              desc: "Precise post-production and color grading, ensuring timeless visual consistency and careful delivery.",
            },
          ].map((s) => (
            <motion.div key={s.step} variants={itemVariants}>
              <p className="text-black text-2xl font-light mb-4">{s.step}</p>
              <h4 className="text-xl font-medium mb-3 tracking-wide">{s.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="text-center py-32 bg-gray-50/50">
        <h3 className="text-4xl md:text-5xl font-light mb-8 tracking-tight">
          Let’s Collaborate
        </h3>
        <p className="text-gray-600 text-sm mb-12 max-w-lg mx-auto leading-relaxed">
          Available for collaborations and projects worldwide. 
          Let's build something meaningful, elegant, and lasting.
        </p>
        <Link
          href="/contact"
          className="inline-block text-sm font-medium tracking-wide px-10 py-3 border border-black text-black hover:bg-black hover:text-white transition-all duration-500 ease-in-out"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  );
}