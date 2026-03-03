"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type FileKind = "image" | "video" | "file";

interface PortalFile {
  id: string;
  url: string;
  name: string;
  type: FileKind;
  size?: number;
}

interface PortalDoc {
  clientName: string;
  clientEmail: string;
  projectName: string;
  files: PortalFile[];
  portalCode: string;
  price?: number;
  paymentRequired?: boolean;
  paid?: boolean;
  expiresAt?: Date;
  createdAt?: Date;
}

function withDownloadParams(url: string): string {
  return url.includes("?") ? `${url}&alt=media&dl=1` : `${url}?alt=media&dl=1`;
}

function formatEUR(amount: number) {
  try {
    return new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} €`;
  }
}

function fileMeta(file: PortalFile) {
  const ext =
    file.name?.includes(".") ? file.name.split(".").pop()?.toUpperCase() : "";
  const kind =
    file.type === "image" ? "IMAGE" : file.type === "video" ? "VIDEO" : "FILE";
  return ext ? `${kind} · ${ext}` : kind;
}

function readableSize(bytes?: number) {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n = n / 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/** -------- Stripe inline payment form -------- */
function PaymentForm({
  portalId,
  amount,
  onPaid,
}: {
  portalId: string;
  amount: number;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalId }),
      });

      const data = await res.json();
      if (!data.clientSecret) throw new Error("No client secret");

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
      } else if (result.paymentIntent?.status === "succeeded") {
        onPaid();
      } else {
        setError("Payment not completed. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message);
      else setError("Une erreur inconnue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="border border-black bg-white">
        <div className="px-4 py-3 border-b border-black">
          <p className="text-[11px] uppercase tracking-[0.25em] text-black">
            Card details
          </p>
        </div>
        <div className="p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
                  fontSize: "14px",
                  color: "#000",
                  "::placeholder": { color: "#666" },
                },
                invalid: { color: "#b91c1c" },
              },
            }}
            className="py-2"
          />
        </div>
      </div>

      {error && (
        <div className="border border-black bg-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-black">
            Error
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className={classNames(
          "w-full py-3 border border-black text-xs uppercase tracking-[0.25em] transition",
          loading || !stripe
            ? "bg-white text-black opacity-60 cursor-not-allowed"
            : "bg-black text-white hover:bg-white hover:text-black"
        )}
      >
        {loading ? "Processing…" : `Pay ${formatEUR(amount)}`}
      </button>

      <p className="text-[11px] text-gray-600">
        Secure payment powered by Stripe.
      </p>
    </form>
  );
}

/** -------- Page principale -------- */
export default function ClientPortalPage() {
  const params = useParams();
  const portalId = params.id as string;

  const [portal, setPortal] = useState<PortalDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const [showCodeGate, setShowCodeGate] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [justPaid, setJustPaid] = useState(false);
  const [revealedCode, setRevealedCode] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<PortalFile | null>(null);

  // UX: focus input when code gate shows
  const codeInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (showCodeGate && !unlocked) {
      const t = setTimeout(() => codeInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [showCodeGate, unlocked]);

  // UX: esc to close modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedFile(null);
    };
    if (selectedFile) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedFile]);

  const portalTitle = useMemo(() => {
    const name = portal?.projectName?.trim();
    return name && name.length ? name : "Project Portal";
  }, [portal?.projectName]);

  useEffect(() => {
    const fetchPortal = async () => {
      try {
        const snap = await getDoc(doc(db, "portals", portalId));
        if (!snap.exists()) {
          setFatalError("Portal not found");
          return;
        }

        const data = snap.data() as PortalDoc;

        // vérifier expiration
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          setFatalError("This portal has expired");
          return;
        }

        const files = (data.files || []).map((f) => ({
          ...f,
          url: withDownloadParams(f.url),
        }));

        setPortal({ ...data, files });

        // UX: logique simple
        if (data.paymentRequired && !data.paid) {
          setShowCodeGate(false);
        } else {
          setShowCodeGate(true);
        }
      } catch {
        setFatalError("Error loading portal");
      } finally {
        setLoading(false);
      }
    };

    if (portalId) fetchPortal();
  }, [portalId]);

  // Vérification du code
  const tryUnlock = async () => {
    if (!portal) return;

    const expected = portal.portalCode?.trim();
    if (!expected) {
      setCodeError("No access code configured for this portal.");
      return;
    }

    if (codeInput.trim().toUpperCase() === expected.toUpperCase()) {
      setUnlocked(true);
      setCodeError("");

      try {
        await fetch("/api/portal/notify-open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portalId,
            projectName: portal.projectName,
            clientName: portal.clientName,
            clientEmail: portal.clientEmail,
          }),
        });
      } catch {
        // ignore notif errors
      }
    } else {
      setCodeError("Invalid access code. Please try again.");
    }
  };

  const handlePaid = async () => {
    setJustPaid(true);
    if (portal?.portalCode) {
      setRevealedCode(portal.portalCode);
      setShowCodeGate(true);
    }
  };

  // Téléchargement
  const handleDownload = async (file: PortalFile) => {
    try {
      const apiUrl = `/api/download?url=${encodeURIComponent(
        file.url
      )}&name=${encodeURIComponent(file.name)}`;
      const link = document.createElement("a");
      link.href = apiUrl;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleDownloadAll = async () => {
    if (!portal) return;

    const filesParam = encodeURIComponent(
      JSON.stringify(portal.files.map((f) => ({ url: f.url, name: f.name })))
    );

    const zipUrl = `/api/download-zip?files=${filesParam}&name=${encodeURIComponent(
      portal.projectName || "portal-files"
    )}`;

    const link = document.createElement("a");
    link.href = zipUrl;
    link.setAttribute("download", `${portal.projectName}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filesCountLabel = useMemo(() => {
    const n = portal?.files?.length ?? 0;
    return `${n} ${n === 1 ? "file" : "files"} available`;
  }, [portal?.files?.length]);

  if (loading)
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-700">
              Loading
            </p>
            <div className="mt-4 h-[2px] w-full bg-gray-200 overflow-hidden">
              <div className="h-full w-1/3 bg-black animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );

  if (fatalError || !portal)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-light uppercase tracking-[0.2em] text-black mb-3">
            Portal Unavailable
          </h1>
          <p className="text-sm text-gray-600 font-light mb-8">
            {fatalError || "This portal doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 border border-black text-black text-xs uppercase tracking-[0.15em] font-light hover:bg-black hover:text-white transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );

  // 1) Paiement requis
  if (portal.paymentRequired && !portal.paid && !justPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center">

          <h1 className="text-3xl font-light uppercase tracking-[0.2em] mb-3">
            Payment Required
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Complete payment to unlock your portal access.
          </p>

          <div className="border border-black bg-white p-5 text-left mb-6">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-700">
              Project
            </p>
            <p className="mt-1 text-base text-black font-light">{portalTitle}</p>

            <div className="mt-4 flex items-center justify-between border-t border-black pt-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-700">
                Amount
              </p>
              <p className="text-sm text-black">{formatEUR(portal.price || 0)}</p>
            </div>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentForm
              portalId={portalId}
              amount={portal.price || 0}
              onPaid={handlePaid}
            />
          </Elements>

          <p className="mt-6 text-[11px] text-gray-500">
            After successful payment, your access code will be revealed here.
          </p>
        </div>
      </div>
    );
  }

  // 2) Écran code
  if (showCodeGate && !unlocked) {
    const normalized = codeInput.trim().toUpperCase();
    const isComplete = normalized.length === 6;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">

          <h1 className="text-3xl font-light text-black uppercase tracking-[0.2em] mb-2">
            Access Portal
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-gray-700 mb-6">
            Enter your access code
          </p>

          {revealedCode && (
            <div className="mb-4 border border-black bg-white p-4 text-left">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-700">
                Your code
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="font-mono text-base tracking-[0.3em] text-black">
                  {revealedCode}
                </p>
                <button
                  onClick={async () => {
                    setCodeInput(revealedCode.toUpperCase());
                    try {
                      await navigator.clipboard.writeText(revealedCode);
                    } catch {
                      // clipboard may be blocked; ignore
                    }
                  }}
                  className="px-3 py-1.5 text-[10px] border border-black uppercase tracking-[0.25em] hover:bg-black hover:text-white transition"
                >
                  Use
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Tip: click “Use” to fill the input (and try copying).
              </p>
            </div>
          )}

          <div className="border border-black bg-white">
            <div className="px-4 py-3 border-b border-black">
              <p className="text-[11px] uppercase tracking-[0.25em] text-black">
                Access code
              </p>
            </div>

            <div className="p-4 space-y-3">
              <input
                ref={codeInputRef}
                type="text"
                value={codeInput}
                onChange={(e) =>
                  setCodeInput(e.target.value.replace(/\s/g, "").toUpperCase())
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") tryUnlock();
                }}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 text-center text-2xl tracking-[0.3em] uppercase font-light focus:outline-none focus:border-black"
                required
                aria-label="Access code"
              />

              <div className="flex items-center justify-between">
                <p
                  className={classNames(
                    "text-[11px] uppercase tracking-[0.25em]",
                    isComplete ? "text-black" : "text-gray-500"
                  )}
                >
                  {isComplete ? "Ready" : "6 characters"}
                </p>
                {codeError && <p className="text-xs text-red-600">{codeError}</p>}
              </div>

              <button
                onClick={tryUnlock}
                className="w-full px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.25em] hover:bg-white hover:text-black border border-black transition"
              >
                Unlock
              </button>

              <p className="text-[11px] text-gray-600">
                Keep this code private. It grants access to your files.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3) Portail ouvert
  return (
    <div className="min-h-screen bg-white">
      <header className="pt-16 pb-8 text-center border-b border-gray-200">

        <h1 className="text-3xl uppercase text-black tracking-[0.2em] font-light px-4">
          {portalTitle}
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-gray-600">
          Welcome, <span className="text-black">{portal.clientName}</span>
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="text-[11px] uppercase tracking-[0.25em] text-gray-600 font-light">
            {filesCountLabel}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadAll}
              className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-[0.25em] font-light hover:bg-white hover:text-black border border-black transition-all"
            >
              Download All
            </button>
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portal.files.map((file) => {
            const sizeLabel = readableSize(file.size);
            return (
              <button
                key={file.id}
                className="group text-left"
                onClick={() => setSelectedFile(file)}
                aria-label={`Open ${file.name}`}
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden border border-transparent group-hover:border-black transition-colors">
                  {file.type === "image" ? (
                    <Image
                      src={file.url}
                      alt={file.name}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : file.type === "video" ? (
                    <div className="flex flex-col items-center justify-center h-full bg-black text-white">
                      <div className="text-4xl">🎬</div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.25em] opacity-80">
                        Video
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-200 text-black">
                      <div className="text-4xl">📄</div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.25em] opacity-80">
                        File
                      </div>
                    </div>
                  )}

                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all duration-300 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="opacity-0 group-hover:opacity-100 px-4 py-2 border border-white text-white text-[10px] uppercase tracking-[0.25em] font-light transition-opacity">
                        Open
                      </span>

                      <span className="opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-[0.25em] text-white/80 transition-opacity">
                        {fileMeta(file)}
                      </span>
                    </div>
                  </div>

                  {/* quick download */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/0 group-hover:text-white/80 transition">
                      {sizeLabel ?? ""}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="opacity-0 group-hover:opacity-100 px-3 py-1.5 border border-white text-white text-[10px] uppercase tracking-[0.25em] font-light transition-opacity"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-700 font-light truncate">
                    {file.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 border border-white text-white text-2xl font-light hover:bg-white hover:text-black transition z-10"
            onClick={() => setSelectedFile(null)}
            aria-label="Close"
          >
            ×
          </button>

          <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="border border-white/30 bg-black">
              {selectedFile.type === "image" ? (
                <div className="relative w-full aspect-video">
                  <Image
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </div>
              ) : selectedFile.type === "video" ? (
                <video
                  src={selectedFile.url}
                  controls
                  className="w-full aspect-video bg-black"
                />
              ) : (
                <div className="w-full aspect-video bg-black flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="text-white text-5xl">📄</div>
                    <p className="mt-4 text-white text-sm">
                      Preview not available for this file type.
                    </p>
                    <p className="mt-2 text-white/70 text-[11px] uppercase tracking-[0.25em]">
                      Download to open
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-white text-xs uppercase tracking-[0.25em] font-light">
                  {selectedFile.name}
                </p>
                <p className="mt-2 text-white/70 text-[11px] uppercase tracking-[0.25em]">
                  {fileMeta(selectedFile)}
                  {readableSize(selectedFile.size)
                    ? ` · ${readableSize(selectedFile.size)}`
                    : ""}
                </p>
              </div>

              <button
                onClick={() => handleDownload(selectedFile)}
                className="px-6 py-2.5 border border-white text-white text-xs uppercase tracking-[0.25em] font-light hover:bg-white hover:text-black transition-all"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}