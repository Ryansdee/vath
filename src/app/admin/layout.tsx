"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

const getAllowedEmails = () => {
  const emailsString = process.env.NEXT_PUBLIC_ALLOWED_EMAILS;
  if (emailsString) {
    const emails = emailsString.split(",").map((e) => e.trim()).filter((e) => e.length > 0);
    return emails;
  }
  const fallbackEmails = ["ryan.deschuyteneer@gmail.com", "contact@vadimthevelin.com"];
  console.warn("NEXT_PUBLIC_ALLOWED_EMAILS not found, using fallback:", fallbackEmails);
  return fallbackEmails;
};

const ALLOWED_EMAILS = getAllowedEmails();

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_email");
    if (savedEmail && ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(savedEmail.toLowerCase())) {
      setIsAuthorized(true);
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const authorized = currentUser ? ALLOWED_EMAILS.includes(currentUser.email || "") : false;
      setIsAuthorized(authorized);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (!ALLOWED_EMAILS.includes(result.user.email || "")) {
        await signOut(auth);
        alert("Accès refusé. Votre email n'est pas autorisé.");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Erreur lors de la connexion. Veuillez réessayer.");
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail) { setEmailError("Veuillez entrer une adresse e-mail"); return; }
    const normalizedAllowedEmails = ALLOWED_EMAILS.map((email) => email.toLowerCase());
    if (!normalizedAllowedEmails.includes(trimmedEmail)) {
      setEmailError("Cet e-mail n'est pas autorisé");
      return;
    }
    localStorage.setItem("admin_email", trimmedEmail);
    setIsAuthorized(true);
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("admin_email");
      await signOut(auth);
      setIsAuthorized(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

    .admin-global * {
      font-family: 'DM Sans', sans-serif;
      box-sizing: border-box;
    }

    /* ── Loading ── */
    .admin-loading {
      min-height: 100vh;
      background: #0a0a0a;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .spinner-ring {
      width: 40px;
      height: 40px;
      border: 1px solid #2a2a2a;
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #444;
    }

    /* ── Login page ── */
    .login-page {
      min-height: 100vh;
      background: #0a0a0a;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      margin-bottom: 48px;
      text-align: center;
    }

    .login-eyebrow {
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #444;
      margin-bottom: 16px;
    }

    .login-title {
      font-family: 'DM Serif Display', serif;
      font-size: 36px;
      color: #fff;
      letter-spacing: 0.01em;
      margin: 0 0 8px;
      line-height: 1.1;
    }

    .login-sub {
      font-size: 12px;
      color: #444;
      letter-spacing: 0.05em;
    }

    .login-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 16px 0;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background: #1e1e1e;
    }

    .divider-text {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #333;
    }

    .login-btn {
      width: 100%;
      padding: 14px 20px;
      font-size: 12px;
      font-family: 'DM Sans', sans-serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.15s;
      border-radius: 6px;
    }

    .login-btn-primary {
      background: #fff;
      color: #000;
      border: none;
    }

    .login-btn-primary:hover { background: #e8e4dc; }

    .login-btn-outline {
      background: transparent;
      color: #888;
      border: 1px solid #1e1e1e;
    }

    .login-btn-outline:hover {
      border-color: #444;
      color: #ccc;
    }

    .login-btn-ghost {
      background: transparent;
      color: #444;
      border: none;
      font-size: 11px;
      padding: 10px;
    }

    .login-btn-ghost:hover { color: #888; }

    .login-input {
      width: 100%;
      background: #111;
      border: 1px solid #1e1e1e;
      border-radius: 6px;
      padding: 13px 16px;
      color: #e8e4dc;
      font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      outline: none;
      transition: border-color 0.15s;
    }

    .login-input::placeholder { color: #333; }
    .login-input:focus { border-color: #444; }

    .login-error {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #e05c5c;
      margin-top: 8px;
    }

    .access-denied {
      margin-top: 20px;
      padding: 12px 16px;
      background: #1a0f0f;
      border: 1px solid #3a1a1a;
      border-radius: 6px;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #e05c5c;
      text-align: center;
    }

    .login-form-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Authenticated layout ── */
    .admin-global .admin-wrapper {
      min-height: 100vh;
      background: #0a0a0a;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .footer {
      display: none !important;
    }

    .navbar {
      display: none !important;
      }
  `;

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="admin-global">
          <div className="admin-loading">
            <div className="loading-inner">
              <div className="spinner-ring" />
              <span className="loading-text">Chargement</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Login ── */
  if (!isAuthorized && !user) {
    return (
      <>
        <style>{styles}</style>
        <div className="admin-global">
          <div className="login-page">
            <div className="login-card">
              <div className="login-header">
                <p className="login-eyebrow">Vadim Thevelin · Studio</p>
                <h1 className="login-title">Administration</h1>
                <p className="login-sub">Accès restreint aux collaborateurs autorisés</p>
              </div>

              {!showEmailForm ? (
                <div className="login-form-stack">
                  <button onClick={handleGoogleSignIn} className="login-btn login-btn-primary">
                    <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Connexion avec Google
                  </button>

                  <div className="login-divider">
                    <div className="divider-line" />
                    <span className="divider-text">ou</span>
                    <div className="divider-line" />
                  </div>

                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="login-btn login-btn-outline"
                  >
                    Connexion par e-mail
                  </button>
                </div>
              ) : (
                <div className="login-form-stack">
                  <div>
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      value={emailInput}
                      onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                      className="login-input"
                      autoFocus
                    />
                    {emailError && <p className="login-error">{emailError}</p>}
                  </div>

                  <button
                    onClick={handleEmailSubmit as unknown as React.MouseEventHandler}
                    className="login-btn login-btn-primary"
                  >
                    Accéder au tableau de bord
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowEmailForm(false); setEmailInput(""); setEmailError(""); }}
                    className="login-btn login-btn-ghost"
                  >
                    ← Retour
                  </button>
                </div>
              )}

              {user && !isAuthorized && (
                <div className="access-denied">Accès refusé — e-mail non autorisé</div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Authenticated ── */
  const displayEmail = user?.email || (typeof window !== "undefined" ? localStorage.getItem("admin_email") : null) || "Admin";

  return (
    <>
      <style>{styles}</style>
      <div className="admin-global">
        <div className="admin-wrapper">
          {children}
        </div>
      </div>
    </>
  );
}