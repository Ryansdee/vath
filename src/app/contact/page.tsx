"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ServiceType = "photography" | "videography" | "direction" | "general";

interface FormData {
  name: string;
  email: string;
  service: ServiceType | null;
  additionalInfo: string;
}

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
    { id: "photography" as ServiceType, label: "Photography", icon: "📸" },
    { id: "videography" as ServiceType, label: "Videography", icon: "🎬" },
    { id: "direction" as ServiceType, label: "Direction", icon: "🎨" },
    { id: "general" as ServiceType, label: "General Inquiry", icon: "💬" },
    { id: "portal" as ServiceType, label: "Portal Access", icon: "🔐" }
  ];

  const handleServiceSelect = (serviceId: ServiceType) => {
    setForm({ ...form, service: serviceId });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setStatus("success");
        // Redirection vers la page de succès
        router.push("/success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="pt-32 pb-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light uppercase tracking-[0.2em] text-black mb-4">
              Contact
            </h1>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Let&apos;s discuss your project
            </p>
          </div>
        </header>

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto px-6 mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-light ${step >= 1 ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-300'}`}>
              1
            </div>
            <div className={`h-0.5 w-12 ${step >= 2 ? 'bg-black' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-light ${step >= 2 ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-300'}`}>
              2
            </div>
            <div className={`h-0.5 w-12 ${step >= 3 ? 'bg-black' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-light ${step >= 3 ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-300'}`}>
              3
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="px-6 pb-20">
          <div className="max-w-3xl mx-auto">
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-8">
                <h2 className="text-xl font-light uppercase tracking-[0.15em] text-black text-center mb-8">
                  What can I help you with?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className="p-8 border text-black border-gray-300 hover:border-black hover:bg-gray-50 transition-all duration-300 text-center group"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="text-4xl mb-4">{service.icon}</div>
                      <h3 className="text-sm uppercase tracking-[0.15em] font-light group-hover:text-black transition-colors">
                        {service.label}
                      </h3>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-light uppercase tracking-[0.15em] text-black mb-2">
                    Your Information
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    Selected: {services.find(s => s.id === form.service)?.label}
                  </p>
                </div>

                <div>
                  <label className="block text-black text-xs uppercase tracking-[0.15em] font-light text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 text-black py-3 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] font-light text-gray-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 text-black border border-gray-300 focus:border-black outline-none transition-colors text-sm"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 text-xs uppercase tracking-[0.15em] font-light hover:border-black hover:text-black transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => form.name && form.email && setStep(3)}
                    disabled={!form.name || !form.email}
                    className="flex-1 px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Additional Info & Submit */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-light uppercase tracking-[0.15em] text-black mb-2">
                    Additional Information
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    Optional details about your project
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] font-light text-gray-700 mb-2">
                    Tell me about your project (Optional)
                  </label>
                  <textarea
                    value={form.additionalInfo}
                    onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
                    rows={6}
                    className="w-full px-4 text-black py-3 border border-gray-300 focus:border-black outline-none transition-colors resize-none text-sm"
                    placeholder="Budget, timeline, specific needs..."
                  />
                </div>

                {/* Status messages */}
                {status === "success" && (
                  <div className="p-4 border border-black bg-gray-50 text-black text-xs uppercase tracking-wider text-center">
                    Message sent successfully! Check your email.
                  </div>
                )}

                {status === "error" && (
                  <div className="p-4 border border-red-500 bg-red-50 text-red-800 text-xs uppercase tracking-wider text-center">
                    Error sending message. Please try again.
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 text-xs uppercase tracking-[0.15em] font-light hover:border-black hover:text-black transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                        Sending...
                      </span>
                    ) : (
                      "Send Request"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Alternative contact */}
            <div className="mt-16 pt-16 border-t border-gray-200 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
                Or reach out directly
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://www.instagram.com/maindoeuvre.productions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-black text-black text-xs uppercase tracking-[0.15em] font-light hover:bg-black hover:text-white transition-all"
                >
                  @maindoeuvre.productions
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}