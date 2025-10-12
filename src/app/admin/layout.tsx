"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User 
} from "firebase/auth";

// Récupérer les emails autorisés depuis .env
const ALLOWED_EMAILS = process.env.NEXT_PUBLIC_ALLOWED_EMAILS?.split(',').map(email => email.trim()) || [];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthorized(
        currentUser ? ALLOWED_EMAILS.includes(currentUser.email || "") : false
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Vérifier si l'email est dans la liste autorisée (pour auth sans mdp)
  useEffect(() => {
    const savedEmail = localStorage.getItem('admin_email');
    if (savedEmail && ALLOWED_EMAILS.includes(savedEmail)) {
      setIsAuthorized(true);
      setLoading(false);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (!ALLOWED_EMAILS.includes(result.user.email || "")) {
        await signOut(auth);
        alert("Access denied. Your email is not authorized.");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Error signing in. Please try again.");
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!emailInput.trim()) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!ALLOWED_EMAILS.includes(emailInput.trim())) {
      setEmailError("This email is not authorized");
      return;
    }

    // Sauvegarder l'email et autoriser l'accès
    localStorage.setItem('admin_email', emailInput.trim());
    setIsAuthorized(true);
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('admin_email');
      await signOut(auth);
      setIsAuthorized(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen z-50 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-black text-sm font-light uppercase tracking-wider">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized && !user) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
          
          * {
            font-family: 'Acid Grotesk', sans-serif;
          }
        `}</style>

        <div className="min-h-screen flex z-50 items-center justify-center bg-white px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] text-black mb-4">
                Admin Access
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
                Choose your sign-in method
              </p>
            </div>

            {!showEmailForm ? (
              <div className="space-y-4">
                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full px-6 py-4 bg-black text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="bg-white px-4 text-gray-400">Or</span>
                  </div>
                </div>

                {/* Email Button */}
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full px-6 py-4 border-2 border-black text-black text-xs uppercase tracking-[0.15em] font-light hover:bg-black hover:text-white transition-all"
                >
                  Sign in with Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setEmailError("");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:border-black focus:outline-none text-sm"
                  />
                  {emailError && (
                    <p className="mt-2 text-xs text-red-600 uppercase tracking-wider">
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-black text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-800 transition-all"
                  >
                    Access Admin
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailForm(false);
                      setEmailInput("");
                      setEmailError("");
                    }}
                    className="w-full px-6 py-3 text-xs uppercase tracking-[0.15em] font-light text-gray-600 hover:text-black transition-colors"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {user && !isAuthorized && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs uppercase tracking-wider">
                Access denied. Your email is not authorized.
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  const displayEmail = user?.email || localStorage.getItem('admin_email') || 'Admin';

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Admin Header */}
        <div className="bg-black z-80 text-white py-17 px-4 md:px-6" style={{ zIndex: "100", paddingBottom: "20px" }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.2em] font-light">
                Admin Mode
              </span>
              <span className="text-xs text-gray-400">
                {displayEmail}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs uppercase tracking-[0.15em] font-light hover:text-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {children}
      </div>
    </>
  );
}