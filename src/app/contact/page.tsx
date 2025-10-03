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
    <section className="min-h-screen bg-white py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-center text-black mb-4 md:mb-6">
            Contact
          </h1>

          <p className="text-center text-zinc-500 text-sm md:text-base uppercase tracking-wider">
            Discutons de votre projet
          </p>

          <div className="flex items-center justify-center gap-3 md:gap-4 mt-6 md:mt-8">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="relative bg-white border-4 border-black p-6 md:p-8 lg:p-10">
            {/* Numéro décoratif */}
            <div className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 bg-black border-2 border-white flex items-center justify-center">
              <span className="text-white font-black text-lg md:text-xl">01</span>
            </div>

            <div className="space-y-6 md:space-y-8">
              {/* Nom */}
              <div>
                <label className="block text-black font-bold uppercase tracking-wider text-sm md:text-base mb-3">
                  Votre nom
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-zinc-300 p-3 md:p-4 text-black placeholder-zinc-400 focus:border-black focus:outline-none transition-colors text-sm md:text-base"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-black font-bold uppercase tracking-wider text-sm md:text-base mb-3">
                  Votre email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="john.doe@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-zinc-300 p-3 md:p-4 text-black placeholder-zinc-400 focus:border-black focus:outline-none transition-colors text-sm md:text-base"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-black font-bold uppercase tracking-wider text-sm md:text-base mb-3">
                  Votre message
                </label>
                <textarea
                  name="message"
                  placeholder="Parlez-moi de votre projet..."
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-white border-2 border-zinc-300 p-3 md:p-4 text-black placeholder-zinc-400 focus:border-black focus:outline-none transition-colors resize-none text-sm md:text-base"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative w-full bg-black text-white py-4 md:py-5 text-sm md:text-base font-black uppercase tracking-wider transition-all duration-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                Envoi en cours...
              </span>
            ) : (
              "Envoyer le message"
            )}
          </button>
        </form>

        {/* Informations alternatives */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-10">
            <div className="h-px w-12 md:w-16 bg-zinc-300"></div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider">ou</span>
            <div className="h-px w-12 md:w-16 bg-zinc-300"></div>
          </div>

          <div className="relative bg-black border-4 border-black p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-6 text-center">
              Contactez-moi directement
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.instagram.com/vadimthevelin/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 bg-white text-black px-6 py-3 font-black uppercase tracking-wider text-sm transition-all duration-300 hover:bg-zinc-200"
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
                <span>Main d&apos;Oeuvre</span>
                <span className="text-base">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer décoratif */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mt-12 md:mt-16">
          <div className="h-px w-12 md:w-16 bg-zinc-300"></div>
          <div className="w-2 h-2 bg-zinc-300"></div>
          <div className="h-px w-12 md:w-16 bg-zinc-300"></div>
        </div>
      </div>
    </section>
  );
}