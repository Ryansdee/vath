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
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist:wght@300;400;500&display=swap');

    .admin-global * {
      font-family: 'Geist', sans-serif;
      box-sizing: border-box;
    }

    .admin-global h1,
    .admin-global h2,
    .admin-global h3,
    .admin-global p {
      margin: 0;
      padding: 0;
    }

    /* ── Loading ── */
    .admin-loading {
      min-height: 100vh;
      background: #F9F7F4;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
    }

    .spinner-ring {
      width: 32px;
      height: 32px;
      border: 1.5px solid #E2DDD8;
      border-top-color: #1A1816;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    .loading-text {
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #9E9890;
      font-weight: 300;
    }

    /* ── Login page ── */
    .login-page {
      min-height: 100vh;
      background: #F9F7F4;
      display: flex;
    }

    /* Left decorative column */
    .login-aside {
      width: 420px;
      flex-shrink: 0;
      background: #1A1816;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px 52px;
    }

    @media (max-width: 800px) {
      .login-aside { display: none; }
      .login-main { padding: 40px 28px; }
    }

    .aside-logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 300;
      color: #F9F7F4;
      letter-spacing: 0.06em;
    }

    .aside-logo span {
      font-style: italic;
      opacity: 0.55;
    }

    .aside-quote {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 300;
      font-style: italic;
      color: #F9F7F4;
      line-height: 1.45;
      opacity: 0.85;
    }

    .aside-quote-attr {
      margin-top: 14px;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #5C5752;
      font-weight: 400;
    }

    .aside-decoration {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 360px;
      height: 360px;
      border-radius: 50%;
      border: 1px solid rgba(249,247,244,0.05);
      pointer-events: none;
    }

    .aside-decoration::before {
      content: '';
      position: absolute;
      inset: 30px;
      border-radius: 50%;
      border: 1px solid rgba(249,247,244,0.04);
    }

    .aside-decoration::after {
      content: '';
      position: absolute;
      inset: 80px;
      border-radius: 50%;
      border: 1px solid rgba(249,247,244,0.035);
    }

    /* Right main column */
    .login-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 48px;
    }

    .login-card {
      width: 100%;
      max-width: 380px;
    }

    .login-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border: 1px solid #E2DDD8;
      border-radius: 100px;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #9E9890;
      font-weight: 400;
      margin-bottom: 32px;
    }

    .badge-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #C8B89A;
      flex-shrink: 0;
    }

    .login-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px;
      font-weight: 300;
      color: #1A1816;
      line-height: 1.1;
      letter-spacing: -0.01em;
      margin-bottom: 12px;
    }

    .login-title em {
      font-style: italic;
      color: #8A7D6E;
    }

    .login-sub {
      font-size: 13px;
      color: #9E9890;
      font-weight: 300;
      letter-spacing: 0.01em;
      margin-bottom: 48px;
    }

    /* Form elements */
    .login-form-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .login-btn {
      width: 100%;
      padding: 14px 20px;
      font-size: 12px;
      font-family: 'Geist', sans-serif;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.18s ease;
      border-radius: 8px;
      font-weight: 400;
    }

    .login-btn-primary {
      background: #1A1816;
      color: #F9F7F4;
      border: 1.5px solid #1A1816;
    }

    .login-btn-primary:hover {
      background: #2D2A26;
      border-color: #2D2A26;
    }

    .login-btn-outline {
      background: #fff;
      color: #3D3830;
      border: 1.5px solid #E2DDD8;
    }

    .login-btn-outline:hover {
      border-color: #C8BFB5;
      background: #F4F1ED;
    }

    .login-btn-ghost {
      background: transparent;
      color: #9E9890;
      border: none;
      font-size: 11px;
      padding: 8px;
      letter-spacing: 0.06em;
    }

    .login-btn-ghost:hover { color: #5C5752; }

    .login-divider {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 6px 0;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background: #EAE6E1;
    }

    .divider-text {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #C8BFB5;
    }

    .login-input {
      width: 100%;
      background: #fff;
      border: 1.5px solid #E2DDD8;
      border-radius: 8px;
      padding: 13px 16px;
      color: #1A1816;
      font-size: 13px;
      font-family: 'Geist', sans-serif;
      font-weight: 300;
      outline: none;
      transition: border-color 0.15s;
    }

    .login-input::placeholder { color: #C8BFB5; }

    .login-input:focus {
      border-color: #9E9890;
      box-shadow: 0 0 0 3px rgba(158,152,144,0.08);
    }

    .login-error {
      font-size: 11px;
      letter-spacing: 0.06em;
      color: #B85050;
      margin-top: 6px;
      font-weight: 400;
    }

    .access-denied {
      margin-top: 20px;
      padding: 12px 16px;
      background: #FDF5F5;
      border: 1px solid #F0D8D8;
      border-radius: 8px;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #B85050;
      text-align: center;
    }

    .login-footer-note {
      margin-top: 40px;
      padding-top: 28px;
      border-top: 1px solid #EAE6E1;
      font-size: 11px;
      color: #C8BFB5;
      letter-spacing: 0.04em;
      text-align: center;
    }

    /* ── Authenticated layout ── */
    .admin-wrapper {
      min-height: 100vh;
      background: #F9F7F4;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .footer { display: none !important; }
    .navbar { display: none !important; }
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

            {/* Left artistic column */}
            <aside className="login-aside">
              <div className="aside-decoration" />
              <div className="aside-logo">
                Vadim <span>Thevelin</span>
              </div>
              <div>
                <p className="aside-quote">
                  "La lumière révèle ce que l'ombre ne peut cacher."
                </p>
                <p className="aside-quote-attr">Studio · Bruxelles</p>
              </div>
            </aside>

            {/* Right form column */}
            <main className="login-main">
              <div className="login-card">

                <div className="login-badge">
                  <span className="badge-dot" />
                  Accès restreint
                </div>

                <h1 className="login-title">
                  Tableau de<br /><em>bord</em>
                </h1>
                <p className="login-sub">Réservé aux collaborateurs autorisés.</p>

                {!showEmailForm ? (
                  <div className="login-form-stack">
                    <button onClick={handleGoogleSignIn} className="login-btn login-btn-primary">
                      <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continuer avec Google
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

                <p className="login-footer-note">
                  vadimthevelin.com · {new Date().getFullYear()}
                </p>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  /* ── Authenticated ── */
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