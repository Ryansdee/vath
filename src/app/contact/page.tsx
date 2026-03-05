"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

type ServiceType = "photography" | "videography" | "direction" | "general" | "portal";

interface FormData {
  name: string;
  email: string;
  service: ServiceType | null;
  additionalInfo: string;
}

const fadeUp: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] } },
};

const modalVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.25 } },
};

const services: { id: ServiceType; label: string; sub: string }[] = [
  { id: "photography",  label: "Photography",       sub: "Portraits, campaigns, visual documentation" },
  { id: "videography",  label: "Videography",        sub: "Commercials, short films, motion narratives" },
  { id: "direction",    label: "Creative Direction", sub: "Visual strategy, concept & execution" },
  { id: "general",      label: "General Inquiry",    sub: "Press, collaborations, other requests" },
  { id: "portal",       label: "Portal Access",      sub: "Request or recover client portal credentials" },
];

export default function ContactPage() {
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState<FormData>({ name: "", email: "", service: null, additionalInfo: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus]       = useState<"idle" | "success" | "error">("idle");

  const isPortal    = form.service === "portal";
  const emailValid  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const step2Valid  = form.name.length > 0 && emailValid;
  const selectedSvc = services.find((s) => s.id === form.service);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const selectService = (id: ServiceType) => {
    setForm({ ...form, service: id });
    setStep(id === "portal" ? 3 : 2);
  };

  const reset = () => {
    setStatus("idle");
    setForm({ name: "", email: "", service: null, additionalInfo: "" });
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service || !form.name || !emailValid || (isPortal && !form.additionalInfo)) {
      setStatus("error"); return;
    }
    setIsSubmitting(true); setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "success" : "error");
    } catch { setStatus("error"); }
    finally { setIsSubmitting(false); }
  };

  const inputCls = (valid: boolean) =>
    `w-full bg-transparent pb-3 text-black text-[15px] font-light border-b outline-none transition-colors placeholder:text-black/20 ${valid ? "border-black" : "border-black/15 focus:border-black/50"}`;

  const labelCls = "text-[8px] uppercase tracking-[0.42em] text-black/30 block mb-3";

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .f-acid      { font-family: 'Acid Grotesk', sans-serif; }
        .f-cormorant { font-family: 'Cormorant Garamond', serif; }
        ::selection  { background: black; color: white; }

        @keyframes expandLine {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .line-anim { animation: expandLine 1.1s cubic-bezier(0.16,1,0.3,1) 0.4s both; transform-origin: left; }

        .step-pill {
          display: flex; align-items: center; gap: 8px;
          font-size: 8px; letter-spacing: 0.38em; text-transform: uppercase;
          transition: color 0.3s ease;
        }
        .step-pill .dot {
          width: 6px; height: 6px; border-radius: 50%;
          border: 1px solid currentColor;
          transition: background 0.3s ease;
          flex-shrink: 0;
        }
        .step-pill.active { color: black; }
        .step-pill.active .dot { background: black; }
        .step-pill.done   { color: black; }
        .step-pill.done   .dot { background: black; }
        .step-pill.future { color: rgba(0,0,0,0.22); }

        .svc-card {
          position: relative; text-align: left; width: 100%;
          padding: 20px 22px; background: white;
          border: 1px solid rgba(0,0,0,0.08);
          transition: border-color 0.25s ease, background 0.25s ease;
          cursor: pointer;
        }
        .svc-card:hover { border-color: black; background: rgba(0,0,0,0.015); }
        .svc-card.selected { border-color: black; background: rgba(0,0,0,0.025); }

        .svc-card .arrow {
          position: absolute; top: 20px; right: 20px;
          opacity: 0; transform: translateX(-4px) translateY(4px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .svc-card:hover .arrow { opacity: 1; transform: translateX(0) translateY(0); }
      `}</style>

      <div className="f-acid bg-white text-black min-h-screen">

        {/* ── Success Modal ── */}
        <AnimatePresence>
          {status === "success" && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={reset}
            >
              <div className="absolute inset-0 bg-black/55" />
              <motion.div
                variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                className="relative bg-white max-w-md w-full px-10 py-12 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* close */}
                <button onClick={reset}
                  className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center text-black/30 hover:text-black transition-colors text-lg leading-none bg-transparent border-none cursor-pointer">
                  ×
                </button>

                <p className="text-[8px] uppercase tracking-[0.42em] text-black/30 mb-6">Confirmed</p>
                <h3 className="f-cormorant font-light leading-[0.9] text-black mb-6" style={{ fontSize: "clamp(2.2rem,5vw,3.2rem)" }}>
                  Request<br /><span style={{ fontStyle: "italic" }}>Sent.</span>
                </h3>
                <div className="h-px bg-black/10 mb-6 line-anim" />
                <p className="text-[12.5px] leading-[1.85] text-black/50 font-light mb-2">
                  Your <span className="text-black">{selectedSvc?.label}</span> request has been submitted.
                </p>
                <p className="text-[12.5px] leading-[1.85] text-black/50 font-light mb-8">
                  I&apos;ll respond to <span className="text-black">{form.email}</span> within 48 hours.
                </p>
                <button onClick={reset}
                  className="group inline-flex items-center gap-3 border border-black/15 hover:border-black px-7 py-3 text-[9px] uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white transition-all duration-300 bg-transparent cursor-pointer">
                  Close
                  <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    className="transition-transform group-hover:translate-x-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <header className="relative pt-36 pb-20 px-8 sm:px-12 max-w-[860px] mx-auto">
          <span className="f-cormorant absolute right-4 top-20 text-[22vw] font-light text-black/[0.032] leading-none select-none pointer-events-none hidden md:block">C</span>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <p className="text-[8px] uppercase tracking-[0.45em] text-black/80 mb-7">Let&apos;s connect</p>
            <h1 className="f-cormorant font-light leading-[0.87] text-black mb-8" style={{ fontSize: "clamp(4rem,9vw,8.5rem)" }}>
              Contact
            </h1>
            <div className="flex items-center gap-5">
              <div className="line-anim h-px bg-black/15 w-16" />
              <p className="text-[8px] uppercase tracking-[0.38em] text-black/80">Brussels — Worldwide</p>
            </div>
          </motion.div>
        </header>

        {/* ── Step progress ── */}
        <div className="max-w-[860px] mx-auto px-8 sm:px-12 mb-14">
          <div className="flex items-center gap-5">
            {[
              { n: 1, label: "Type" },
              { n: 2, label: "Details" },
              { n: 3, label: "Submit" },
            ].map((s, i, arr) => {
              const state = step > s.n ? "done" : step === s.n ? "active" : "future";
              return (
                <div key={s.n} className="flex items-center gap-5">
                  <div className={`step-pill ${state}`}>
                    <span className="dot" />
                    <span>0{s.n}. {s.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-px transition-colors duration-500 ${step > s.n ? "bg-black/30" : "bg-black/8"}`} style={{ width: 32 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main ── */}
        <main className="px-8 sm:px-12 pb-28 max-w-[860px] mx-auto">
          <AnimatePresence mode="wait">

            {/* ─ Step 1: Service ─ */}
            {step === 1 && (
              <motion.div key="s1" variants={fadeUp} initial="initial" animate="animate" exit="exit">
                <p className="text-[8px] uppercase tracking-[0.42em] text-black/80 mb-8">Select a service</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {services.map((svc) => (
                    <button key={svc.id} onClick={() => selectService(svc.id)}
                      className={`svc-card ${form.service === svc.id ? "selected" : ""}`}>
                      <svg className="arrow" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                      <p className="text-[8px] uppercase tracking-[0.38em] text-black/80 mb-2.5">0{services.indexOf(svc) + 1}</p>
                      <p className="text-[13px] uppercase tracking-[0.12em] text-black mb-1.5">{svc.label}</p>
                      <p className="text-[11.5px] text-black/80 font-light leading-relaxed">{svc.sub}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─ Step 2: Contact info ─ */}
            {step === 2 && !isPortal && (
              <motion.div key="s2" variants={fadeUp} initial="initial" animate="animate" exit="exit">
                <div className="flex items-baseline justify-between mb-10">
                  <p className="text-[8px] uppercase tracking-[0.42em] text-black/80">Your details</p>
                  {selectedSvc && (
                    <span className="text-[9px] uppercase tracking-[0.2em] text-black/80 border border-black/80 px-3 py-1">
                      {selectedSvc.label}
                    </span>
                  )}
                </div>

                <div className="space-y-8">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input type="text" name="name" value={form.name} onChange={handleInput}
                      placeholder="Your name" required
                      className={inputCls(form.name.length > 0)} />
                  </div>
                  <div>
                    <label className={labelCls}>Email address</label>
                    <input type="email" name="email" value={form.email} onChange={handleInput}
                      placeholder="your@email.com" required
                      className={inputCls(emailValid)} />
                    {form.email.length > 0 && !emailValid && (
                      <p className="text-[10px] text-black/80 mt-2 tracking-[0.04em]">Please enter a valid email address.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-12">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-none px-7 py-[13px] border border-black/12 hover:border-black text-[9px] uppercase tracking-[0.28em] text-black/50 hover:text-black bg-transparent transition-all duration-250 cursor-pointer">
                    ← Back
                  </button>
                  <button type="button" onClick={() => step2Valid && setStep(3)} disabled={!step2Valid}
                    className="flex-1 py-[13px] bg-black text-white text-[9px] uppercase tracking-[0.28em] hover:bg-black/82 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer border-none">
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─ Step 3: Message & submit ─ */}
            {step === 3 && (
              <motion.form key="s3" variants={fadeUp} initial="initial" animate="animate" exit="exit"
                onSubmit={handleSubmit} className="space-y-8">

                <div className="flex items-baseline justify-between mb-10">
                  <p className="text-[8px] uppercase tracking-[0.42em] text-black/80">
                    {isPortal ? "Access request" : "Project details"}
                  </p>
                  {selectedSvc && (
                    <span className="text-[9px] uppercase tracking-[0.2em] text-black/80 border border-black/80 px-3 py-1">
                      {selectedSvc.label}
                    </span>
                  )}
                </div>

                {/* Name + email fields (portal skips step 2) */}
                {(isPortal || !form.name || !form.email) && (
                  <>
                    <div>
                      <label className={labelCls}>{isPortal ? "Registered name" : "Full name"}</label>
                      <input type="text" name="name" value={form.name} onChange={handleInput}
                        placeholder={isPortal ? "Registered name" : "Your name"} required
                        className={inputCls(form.name.length > 0)} />
                    </div>
                    <div>
                      <label className={labelCls}>{isPortal ? "Associated email" : "Email address"}</label>
                      <input type="email" name="email" value={form.email} onChange={handleInput}
                        placeholder={isPortal ? "client@email.com" : "your@email.com"} required
                        className={inputCls(emailValid)} />
                      {form.email.length > 0 && !emailValid && (
                        <p className="text-[10px] text-black/40 mt-2 tracking-[0.04em]">Please enter a valid email address.</p>
                      )}
                    </div>
                  </>
                )}

                {/* Recap name/email if filled in step 2 */}
                {!isPortal && form.name && form.email && (
                  <div className="flex gap-6 py-4 border-y border-black/8">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.35em] text-black/25 mb-1">Name</p>
                      <p className="text-[12.5px] text-black/65">{form.name}</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.35em] text-black/25 mb-1">Email</p>
                      <p className="text-[12.5px] text-black/65">{form.email}</p>
                    </div>
                    <button type="button" onClick={() => setStep(2)}
                      className="ml-auto text-[8px] uppercase tracking-[0.28em] text-black/28 hover:text-black transition-colors bg-transparent border-none cursor-pointer self-center">
                      Edit
                    </button>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className={labelCls}>
                    {isPortal ? "Describe your access issue" : "Project description"}
                    {!isPortal && <span className="text-black/80 ml-2">· optional</span>}
                  </label>
                  <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleInput}
                    rows={6} required={isPortal}
                    placeholder={isPortal
                      ? "Describe your access issue or which portal you need credentials for..."
                      : "Timeline, budget, aesthetic direction, references..."}
                    className="w-full bg-transparent pb-3 text-black text-[13.5px] font-light border-b border-black/15 focus:border-black/50 outline-none transition-colors resize-none placeholder:text-black/18 leading-relaxed"
                  />
                </div>

                {/* Error */}
                {status === "error" && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[10px] uppercase tracking-[0.25em] text-black/45 border-l-2 border-black/30 pl-4 py-2">
                    Please fill all required fields correctly.
                  </motion.p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(isPortal ? 1 : 2)}
                    className="flex-none px-7 py-[13px] border border-black/12 hover:border-black text-[9px] uppercase tracking-[0.28em] text-black/50 hover:text-black bg-transparent transition-all duration-250 cursor-pointer">
                    ← Back
                  </button>
                  <button type="submit"
                    disabled={isSubmitting || !form.name || !emailValid || (isPortal && !form.additionalInfo)}
                    className="flex-1 py-[13px] bg-black text-white text-[9px] uppercase tracking-[0.28em] hover:bg-black/82 disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-none cursor-pointer flex items-center justify-center gap-2.5">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      isPortal ? "Request Access" : "Send Request"
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* ── Alt contact ── */}
          <div className="mt-20 pt-14 border-t border-black/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <p className="text-[8px] uppercase tracking-[0.42em] text-black/50">Or reach out directly</p>
            <a href="https://www.instagram.com/maindoeuvre.productions/" target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.28em] text-black hover:text-black/55 transition-colors">
              @maindoeuvre.productions
              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>
        </main>
      </div>
    </>
  );
}