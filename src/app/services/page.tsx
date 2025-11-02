"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Hero */}
      <header className="pt-32 pb-24 text-center px-6">
        <motion.h1
          className="text-5xl md:text-7xl font-light uppercase tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Services
        </motion.h1>
        <motion.p
          className="text-gray-500 text-sm mt-5 uppercase tracking-[0.3em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Photography • Videography • Direction
        </motion.p>
      </header>

      {/* Core Services */}
      <section className="max-w-6xl mx-auto px-6 pb-32 space-y-32">
        {/* Photography */}
        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-light mb-4">Photography</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              From intimate portraits to commercial campaigns, photography is where observation meets design.  
              Every frame aims to reveal truth and atmosphere — through light, form, and timing.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether in studio or on location, I approach each project with quiet intensity and an obsession for detail.
            </p>
            <Link
              href="/photo"
              className="mt-8 inline-block text-sm uppercase tracking-wide border-b border-black hover:opacity-60 transition-opacity"
            >
              Explore Gallery →
            </Link>
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                <Image
                    src="/work-2.jpg"
                    alt="Photography service"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
            </div>
        </motion.div>

        {/* Videography */}
        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="md:order-2">
            <h2 className="text-3xl md:text-4xl font-light mb-4">Videography</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Motion allows stories to breathe — a choreography of sound, rhythm, and emotion.  
              I produce cinematic visuals that merge technical precision with intuitive storytelling.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From directing to editing, each project is crafted with a coherent visual language and emotional pacing.
            </p>
            <Link
              href="/video"
              className="mt-8 inline-block text-sm uppercase tracking-wide border-b border-black hover:opacity-60 transition-opacity"
            >
              Watch Projects →
            </Link>
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                <Image
                    src="/work-1.jpg"
                    alt="Photography service"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
            </div>
        </motion.div>

        {/* Direction */}
        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-light mb-4">Direction</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Beyond the lens, I offer creative direction for brands, artists, and productions seeking coherence between concept and execution.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From visual strategy to on-set guidance, I translate abstract ideas into cohesive visual narratives.
            </p>
            <Link
              href="/diary"
              className="mt-8 inline-block text-sm uppercase tracking-wide border-b border-black hover:opacity-60 transition-opacity"
            >
              View Diary →
            </Link>
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                <Image
                    src="/work-4.jpg"
                    alt="Photography service"   
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
            </div>
        </motion.div>
      </section>

      {/* Process Section */}
      <section className="max-w-5xl mx-auto px-6 text-center pb-32">
        <motion.h3
          className="text-3xl md:text-4xl font-light mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          The Process
        </motion.h3>
        <div className="grid md:grid-cols-3 gap-12 text-left">
          {[
            {
              step: "01",
              title: "Discovery",
              desc: "Understanding your vision and story. Every collaboration starts with clarity and intent.",
            },
            {
              step: "02",
              title: "Creation",
              desc: "Production guided by light, timing, and composition — where the story begins to take form.",
            },
            {
              step: "03",
              title: "Delivery",
              desc: "Final refinement and post-production with precision, ensuring timeless visual consistency.",
            },
          ].map((s) => (
            <div key={s.step}>
              <p className="text-gray-400 text-sm mb-1">{s.step}</p>
              <h4 className="text-xl font-medium mb-2">{s.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-28 bg-gray-50">
        <h3 className="text-3xl md:text-4xl font-light mb-6 tracking-tight">
          Let’s Work Together
        </h3>
        <p className="text-gray-600 text-sm mb-10 max-w-md mx-auto leading-relaxed">
          Available for collaborations and projects worldwide.  
          Let’s build something meaningful, elegant, and lasting.
        </p>
        <Link
          href="/contact"
          className="inline-block text-sm font-medium tracking-wide px-8 py-3 border border-black hover:bg-black hover:text-white transition-all duration-300"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  );
}
