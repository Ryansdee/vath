"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Décompte
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  // Redirection séparée quand countdown atteint 0
  useEffect(() => {
    if (countdown === 0) {
      router.push("/");
    }
  }, [countdown, router]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes checkmark {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes circle {
          0% {
            stroke-dashoffset: 251;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .checkmark-circle {
          stroke-dasharray: 251;
          stroke-dashoffset: 251;
          animation: circle 0.6s ease-out forwards;
        }
        
        .checkmark-check {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkmark 0.4s 0.6s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-fadeIn">
          
          {/* Checkmark Animation */}
          <div className="mb-8 flex justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="40"
                fill="none"
                stroke="#000000"
                strokeWidth="2"
                className="checkmark-circle"
              />
              <path
                d="M40 60 L52 72 L80 44"
                fill="none"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="checkmark-check"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.2em] text-black mb-4">
            Message Sent
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-gray-600 font-light mb-8 leading-relaxed">
            Thank you for reaching out! I've received your request and will get back to you as soon as possible.
          </p>

          {/* Countdown */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
              Redirecting in
            </p>
            <div className="text-4xl font-light text-black">
              {countdown}
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">
              Follow my work
            </p>
            <div className="flex gap-4 justify-center">
              <span className="text-gray-300">|</span>
              <a
                href="https://www.instagram.com/maindoeuvre.productions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.15em] text-black hover:text-gray-500 transition-colors font-light"
              >
                @maindoeuvre.productions
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}