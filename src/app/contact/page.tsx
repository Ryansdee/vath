"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    setTimeout(() => {
      console.log("Form submitted:", form);
      alert("✓ Merci pour votre message ! Je vous répondrai rapidement.");
      setForm({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="min-h-screen bg-black py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="h-px w-12 md:w-20 bg-white opacity-20"></div>
            <div className="w-2 h-2 md:w-3 md:h-3 border border-white opacity-40"></div>
            <div className="h-px w-12 md:w-20 bg-white opacity-20"></div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-center text-white mb-4 md:mb-6">
            <span className="relative inline-block">
              <span className="relative z-10">Contact</span>
              <span className="absolute top-1 left-1 md:top-1.5 md:left-1.5 text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-800 -z-10">
                Contact
              </span>
            </span>
          </h1>

          <p className="text-center text-zinc-500 text-sm md:text-base uppercase tracking-wider">
            Discutons de votre projet
          </p>

          <div className="flex items-center justify-center gap-3 md:gap-4 mt-6 md:mt-8">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="relative bg-zinc-900 border-2 border-zinc-800 p-6 md:p-8 lg:p-10">
            {/* Numéro décoratif */}
            <div className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-black flex items-center justify-center">
              <span className="text-black font-black text-lg md:text-xl">01</span>
            </div>

            <div className="space-y-6 md:space-y-8">
              {/* Nom */}
              <div>
                <label className="block text-white font-bold uppercase tracking-wider text-sm md:text-base mb-3">
                  Votre nom
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-black border-2 border-zinc-800 p-3 md:p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors text-sm md:text-base"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-bold uppercase tracking-wider text-sm md:text-base mb-3">
                  Votre email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="john.doe@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-black border-2 border-zinc-800 p-3 md:p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors text-sm md:text-base"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-white font-bold uppercase tracking-wider text-sm md:text-base mb-3">
                  Votre message
                </label>
                <textarea
                  name="message"
                  placeholder="Parlez-moi de votre projet..."
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-black border-2 border-zinc-800 p-3 md:p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors resize-none text-sm md:text-base"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Coin décoratif */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-white opacity-20"></div>
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative w-full bg-white text-black py-4 md:py-5 text-sm md:text-base font-black uppercase tracking-wider transition-all duration-300 hover:bg-zinc-200 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full"></span>
                Envoi en cours...
              </span>
            ) : (
              "Envoyer le message"
            )}
            {!isSubmitting && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-black"></span>
            )}
          </button>
        </form>

        {/* Informations alternatives */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-10">
            <div className="h-px w-12 md:w-16 bg-zinc-800"></div>
            <span className="text-zinc-600 text-xs uppercase tracking-wider">ou</span>
            <div className="h-px w-12 md:w-16 bg-zinc-800"></div>
          </div>

          <div className="relative bg-black border-4 border-white p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-6 text-center">
              Contactez-moi directement
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.instagram.com/vadimthevelin/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 bg-white text-black px-6 py-3 font-black uppercase tracking-wider text-sm transition-all duration-300 hover:bg-zinc-200 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
              >
                <div className="w-7 h-7 border-2 border-black flex items-center justify-center">
                  <span className="text-base">IG</span>
                </div>
                <span>Instagram</span>
              </a>

              <a
                href="https://www.instagram.com/maindoeuvre.productions/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-6 py-3 font-black uppercase tracking-wider text-sm transition-all duration-300 hover:bg-white hover:text-black"
              >
                <span>Main d'Oeuvre</span>
                <span className="text-base">→</span>
              </a>
            </div>

            {/* Coins décoratifs */}
            <div className="absolute -top-2 -left-2 w-6 h-6 md:w-8 md:h-8 border-t-4 border-l-4 border-white"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 border-t-4 border-r-4 border-white"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 md:w-8 md:h-8 border-b-4 border-l-4 border-white"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 md:w-8 md:h-8 border-b-4 border-r-4 border-white"></div>
          </div>
        </div>

        {/* Footer décoratif */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mt-12 md:mt-16">
          <div className="h-px w-12 md:w-16 bg-zinc-800"></div>
          <div className="w-2 h-2 bg-zinc-800"></div>
          <div className="h-px w-12 md:w-16 bg-zinc-800"></div>
        </div>
      </div>
    </section>
  );
}