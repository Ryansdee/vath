"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type ServiceType = "photography" | "videography" | "direction" | "general" | "portal";

interface FormData {
  name: string;
  email: string;
  service: ServiceType | null;
  additionalInfo: string;
}

// Variants pour l'apparition des étapes (transition douce)
const stepVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

// Variants pour la modale de succès
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};


const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

export default function ContactPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    service: null,
    additionalInfo: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const services = [
    { id: "photography" as ServiceType, label: "Photography", icon: "📸", desc: "For portraits, campaigns, and visual documentation." },
    { id: "videography" as ServiceType, label: "Videography", icon: "🎬", desc: "Commercials, short films, and motion narratives." },
    { id: "direction" as ServiceType, label: "Creative Direction", icon: "🎨", desc: "Visual strategy, concept development, and execution." },
    { id: "general" as ServiceType, label: "General Inquiry", icon: "💬", desc: "Press, collaborations, or other general requests." },
    { id: "portal" as ServiceType, label: "Portal Access", icon: "🔐", desc: "Request access or login credentials for a client portal." },
  ];

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleServiceSelect = (serviceId: ServiceType) => {
    setForm({ ...form, service: serviceId });
    if (serviceId === "portal") {
      setStep(3); // Saut direct à l'étape finale (avec demande d'identifiants)
    } else {
      setStep(2);
    }
  };
  
  const handleSuccessClose = () => {
    // Réinitialisation complète et retour à l'étape 1
    setStatus("idle");
    setForm({ name: "", email: "", service: null, additionalInfo: "" });
    setStep(1);
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- Validation Frontend Avant l'API ---
    if (!form.service || !form.name || !validateEmail(form.email) || (isPortalRequest && !form.additionalInfo)) {
        setStatus("error");
        return;
    }

    setIsSubmitting(true);
    setStatus("idle"); // Réinitialise l'état d'erreur

    try {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        if (response.ok) {
            setStatus("success"); // Affiche la Modale
            // REMARQUE : `router.push("/success")` a été retiré pour permettre à la modale de s'afficher.
        } else {
            // Traitement d'erreurs plus spécifique si l'API retourne un JSON d'erreur
            console.error("API error:", await response.json());
            setStatus("error");
        }
    } catch (error) {
        console.error("Network error or failed fetch:", error);
        setStatus("error");
    } finally {
        setIsSubmitting(false);
    }
};

  const selectedServiceLabel = services.find(s => s.id === form.service)?.label || "N/A";
  const isPortalRequest = form.service === "portal";
  const isStep2Valid = form.name.length > 0 && validateEmail(form.email);

  // --- Composant Modale de Succès (Nouveau système UX) ---
  const SuccessOverlay = () => (
    <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={handleSuccessClose} // Permet de cliquer en dehors pour fermer
    >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        <motion.div 
            className="bg-white p-12 shadow-2xl max-w-lg w-full text-center relative"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Empêche la fermeture lors du clic sur la modale
        >
            <h3 className="text-4xl font-serif font-light mb-4 text-black uppercase tracking-tighter">
                Request Sent
            </h3>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-8">
                Thank you for reaching out.
            </p>
            <p className="text-gray-700 leading-relaxed mb-8">
                Your request regarding **{selectedServiceLabel}** has been successfully submitted. I will review your details and respond directly to your email (**{form.email}**) within 48 hours.
            </p>
            
            <button
                onClick={handleSuccessClose}
                className="inline-block px-8 py-3 border border-black text-black text-xs uppercase tracking-[0.15em] font-medium hover:bg-black hover:text-white transition-all duration-300"
            >
                Close & Start New
            </button>
        </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Overlay de Succès */}
      <AnimatePresence>
        {status === "success" && <SuccessOverlay />}
      </AnimatePresence>

      {/* Header */}
      <header className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-serif font-light uppercase tracking-tighter text-black mb-4">
            Contact
          </h1>
          <p className="text-xs uppercase tracking-[0.4em] text-gray-500">
            Let&apos;s discuss your project
          </p>
        </div>
      </header>

      {/* Progress Indicator (Minimalist) */}
      <div className="max-w-3xl mx-auto px-6 mb-20">
        <div className="flex items-center justify-center gap-6">
          <div className={`text-xs font-light uppercase tracking-widest ${step >= 1 ? 'text-black border-b border-black' : 'text-gray-400'}`}>
            01. Type
          </div>
          <div className={`h-0.5 w-16 transition-colors ${step >= 2 && !isPortalRequest || step === 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`text-xs font-light uppercase tracking-widest ${step >= 2 && !isPortalRequest || step === 3 ? 'text-black border-b border-black' : 'text-gray-400'}`}>
            02. Details
          </div>
          <div className={`h-0.5 w-16 transition-colors ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`text-xs font-light uppercase tracking-widest ${step >= 3 ? 'text-black border-b border-black' : 'text-gray-400'}`}>
            03. Submit
          </div>
        </div>
        <p className={`text-center text-xs text-gray-400 mt-2 ${isPortalRequest && step === 3 ? 'block' : 'hidden'}`}>
            (Portal Access skips Step 02)
        </p>
      </div>

      {/* Content using AnimatePresence */}
      <main className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <motion.div 
                key="step1" 
                variants={stepVariants} 
                initial="initial" 
                animate="animate" 
                exit="exit"
                className="space-y-10"
              >
                <h2 className="text-xl font-light uppercase tracking-[0.2em] text-black text-center mb-10">
                  What kind of endeavor?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Changé à 3 colonnes pour le style */}
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className="p-6 border border-gray-200 text-black hover:border-black hover:bg-gray-50 transition-all duration-300 text-left group flex flex-col justify-between"
                      style={{ minHeight: '150px' }}
                    >
                      <div className="text-3xl mb-3 transition-transform duration-300 group-hover:translate-x-1">
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="text-base uppercase tracking-[0.15em] font-medium mb-1">
                          {service.label}
                        </h3>
                        <p className="text-xs text-gray-500 group-hover:text-black transition-colors">
                          {service.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Info (Normal path only) */}
            {step === 2 && !isPortalRequest && (
              <motion.div 
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <div className="text-center mb-10">
                  <h2 className="text-xl font-light uppercase tracking-[0.2em] text-black mb-2">
                    Project Contact Details
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    You selected: **{selectedServiceLabel}**
                  </p>
                </div>

                {/* Input Name avec validation live */}
                <div>
                  <label className="block text-black text-xs uppercase tracking-[0.15em] font-light text-gray-700 mb-4">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className={`w-full text-black pb-2 border-b ${form.name.length > 0 ? 'border-black' : 'border-gray-300'} focus:border-black outline-none transition-colors text-lg bg-transparent placeholder-gray-400`}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Input Email avec validation live */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] font-light text-gray-700 mb-4">
                    Your Best Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`w-full pb-2 text-black border-b ${validateEmail(form.email) ? 'border-black' : 'border-gray-300'} focus:border-black outline-none transition-colors text-lg bg-transparent placeholder-gray-400`}
                    placeholder="john.doe@example.com"
                    required
                  />
                  {!validateEmail(form.email) && form.email.length > 0 && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid email address.</p>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 text-xs uppercase tracking-[0.15em] font-light hover:border-black hover:text-black transition-all duration-300"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => isStep2Valid && setStep(3)}
                    disabled={!isStep2Valid}
                    className="flex-1 px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Additional Info & Submit (Final Step) */}
            {step === 3 && (
              <motion.form 
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onSubmit={handleSubmit} 
                className="space-y-8"
              >
                <div className="text-center mb-10">
                  <h2 className="text-xl font-light uppercase tracking-[0.2em] text-black mb-2">
                    {isPortalRequest ? "Access Credentials Request" : "Project Description"}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    {isPortalRequest 
                      ? "Provide your registered details and the specific access issue."
                      : "Refine your needs (timeline, budget, scope)."}
                  </p>
                </div>

                {/* Champs Name et Email (visibles pour le portail ou si l'utilisateur a sauté l'étape 2) */}
                {(isPortalRequest || !form.name || !form.email) && (
                  <>
                    <div className="pt-4">
                      <label className="block text-black text-xs uppercase tracking-[0.15em] font-light text-gray-700 mb-4">
                        {isPortalRequest ? "Your Registered Name" : "Your Full Name"}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        className={`w-full text-black pb-2 border-b ${form.name.length > 0 ? 'border-black' : 'border-gray-300'} focus:border-black outline-none transition-colors text-lg bg-transparent placeholder-gray-400`}
                        placeholder={isPortalRequest ? "Registered Name" : "Your Name"}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] font-light text-gray-700 mb-4">
                        {isPortalRequest ? "Associated Client Email" : "Your Best Email"}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        className={`w-full pb-2 text-black border-b ${validateEmail(form.email) ? 'border-black' : 'border-gray-300'} focus:border-black outline-none transition-colors text-lg bg-transparent placeholder-gray-400`}
                        placeholder={isPortalRequest ? "client@profile.com" : "john.doe@example.com"}
                        required
                      />
                       {!validateEmail(form.email) && form.email.length > 0 && (
                          <p className="text-xs text-red-500 mt-1">Please enter a valid email address.</p>
                      )}
                    </div>
                  </>
                )}
                
                {/* Champ d'info supplémentaire */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] font-light text-gray-700 mb-4">
                    {isPortalRequest 
                      ? "Specific portal or access issue (Required)"
                      : "Details, budget, and timeline (Optional)"}
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={form.additionalInfo}
                    onChange={handleInputChange}
                    rows={isPortalRequest ? 4 : 8}
                    className="w-full px-0 text-black py-2 border-b border-gray-300 focus:border-black outline-none transition-colors resize-none text-sm bg-transparent placeholder-gray-400"
                    placeholder={isPortalRequest ? "Describe your issue or need for new credentials." : "Describe your project, desired aesthetic, budget range, and timeline..."}
                    required={isPortalRequest}
                  />
                </div>

                {/* Status messages pour les erreurs directes */}
                {status === "error" && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="p-4 border border-red-500 bg-red-50 text-red-800 text-xs uppercase tracking-wider text-center"
                  >
                    Please ensure all required fields are filled correctly (Name, Email, and the description field).
                  </motion.div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(isPortalRequest ? 1 : 2)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 text-xs uppercase tracking-[0.15em] font-light hover:border-black hover:text-black transition-all duration-300"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !form.name || !validateEmail(form.email) || (isPortalRequest && !form.additionalInfo)} // Validation stricte
                    className="flex-1 px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                        SUBMITTING
                      </span>
                    ) : (
                      isPortalRequest ? "Request Access" : "Send Request"
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Alternative contact */}
          <div className="mt-20 pt-16 border-t border-gray-100 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
              Or reach out directly via Instagram
            </p>
            <a
              href="https://www.instagram.com/maindoeuvre.productions/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 border border-black text-black text-xs uppercase tracking-[0.2em] font-medium hover:bg-black hover:text-white transition-all duration-300"
            >
              @maindoeuvre.productions
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}