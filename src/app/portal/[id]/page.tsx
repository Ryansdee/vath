"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
      }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Une erreur inconnue est survenue.");
        }
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <CardElement className="p-4 border border-gray-300 rounded-md" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition"
      >
        {loading ? "Processing..." : `Pay ${amount.toFixed(2)} €`}
      </button>
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
    if (codeInput.trim().toUpperCase() === portal.portalCode.toUpperCase()) {
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
        // on ignore les erreurs de notif
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
      const apiUrl = `/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`;
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

    // passe le nom du zip en query
    const zipUrl = `/api/download-zip?files=${filesParam}&name=${encodeURIComponent(
      portal.projectName || "portal-files"
    )}`;

    const link = document.createElement("a");
    link.href = zipUrl;
    // facultatif: le header Content-Disposition gère déjà le nom du fichier
    link.setAttribute("download", `${portal.projectName}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p>Loading…</p>
      </div>
    );

  if (fatalError || !portal)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-light uppercase tracking-[0.2em] text-black mb-4">
            Portal Not Found
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
          <h1 className="text-3xl font-light uppercase tracking-[0.2em] mb-4">
            Payment Required
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Please complete the payment to unlock access.
          </p>
          <Elements stripe={stripePromise}>
            <PaymentForm portalId={portalId} amount={portal.price || 0} onPaid={handlePaid} />
          </Elements>
          <p className="mt-6 text-xs text-gray-500">
            After successful payment, your access code will be revealed here.
          </p>
        </div>
      </div>
    );
  }

  // 2) Écran code
  if (showCodeGate && !unlocked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-light text-black uppercase tracking-[0.2em] mb-4">
            Access Portal
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-900 mb-6">
            Enter your access code
          </p>

          {revealedCode && (
            <div className="mb-4 p-3 border border-green-400 bg-green-50 rounded">
              <p className="text-sm">
                Your access code: <strong>{revealedCode}</strong>
              </p>
              <button
                onClick={() => setCodeInput(revealedCode)}
                className="mt-2 px-3 py-1.5 text-[11px] border border-black uppercase tracking-widest"
              >
                Use this code
              </button>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full px-4 py-3 border text-gray-900 border-gray-300 text-center text-2xl tracking-[0.3em] uppercase font-light focus:outline-none focus:border-black"
              required
            />
            {codeError && <p className="text-xs text-red-600">{codeError}</p>}
            <button
              onClick={tryUnlock}
              className="w-full px-6 py-3 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3) Portail ouvert
  return (
    <div className="min-h-screen bg-white">
      <header className="pt-20 pb-8 text-center border-b border-gray-200">
        <h1 className="text-3xl uppercase text-black tracking-[0.2em] font-light">
          {portal.projectName}
        </h1>
        <p className="text-xs text-gray-500">Welcome, {portal.clientName}</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="text-xs uppercase tracking-[0.15em] text-gray-600 font-light">
            {portal.files.length} {portal.files.length === 1 ? "file" : "files"} available
          </div>
          <button
            onClick={handleDownloadAll}
            className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-800 transition-all"
          >
            Download All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portal.files.map((file) => (
            <div
              key={file.id}
              className="group cursor-pointer"
              onClick={() => setSelectedFile(file)}
            >
              <div className="relative aspect-square bg-gray-100 overflow-hidden mb-2">
                {file.type === "image" ? (
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : file.type === "video" ? (
                  <div className="flex items-center justify-center h-full bg-black text-white text-4xl">
                    🎬
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200 text-4xl">
                    📄
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 border border-white text-white text-[10px] uppercase tracking-wider font-light transition-opacity"
                  >
                    Download
                  </button>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-600 font-light truncate">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      </main>

      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
        >
          <button
            className="absolute top-8 right-8 text-white text-3xl font-light hover:text-gray-400 transition-colors z-10"
            onClick={() => setSelectedFile(null)}
          >
            ×
          </button>

          <div
            className="w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedFile.type === "image" ? (
              <div className="relative w-full aspect-video">
                <Image
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            ) : (
              <video
                src={selectedFile.url}
                controls
                className="w-full aspect-video bg-black"
              />
            )}

            <div className="mt-6 flex justify-between items-center">
              <p className="text-white text-xs uppercase tracking-wider font-light">
                {selectedFile.name}
              </p>
              <button
                onClick={() => handleDownload(selectedFile)}
                className="px-6 py-2 border border-white text-white text-xs uppercase tracking-wider font-light hover:bg-white hover:text-black transition-all"
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
