"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoveRight, Loader2, MailCheck } from "lucide-react";
import { motion } from "framer-motion";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) {
      setError("Please enter a 4-digit code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (res.ok) {
        // Token is now set as httpOnly cookie by the server
        localStorage.setItem("menuqr_user", JSON.stringify(data.data.user));
        router.push("/dashboard");
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message || "An error occurred");
          } else {
            setError("An unknown error occurred");
          }
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
              <MailCheck className="text-primary w-8 h-8" />
            </div>

            <h1 className="text-4xl font-extrabold text-foreground mb-3 text-glow">
              Verify your email
            </h1>
            <p className="text-muted text-lg mb-8">
              We've sent a 4-digit code to <br/>
              <span className="text-primary font-bold">{email}</span>
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-4 justify-between max-w-xs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-16 h-18 text-center text-2xl font-extrabold rounded-xl input-obsidian focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-xs btn-primary py-4 mt-6 text-[15px] hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] shadow-[0_0_15px_rgba(255,107,53,0.15)] group"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Verify Code
                    <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center max-w-xs">
               <p className="text-sm font-medium text-muted">
                 Check your email inbox for the 4-digit verification code.
               </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel - Abstract Design */}
      <div className="hidden lg:flex w-1/2 relative bg-surface items-center justify-center overflow-hidden border-l border-[rgba(255,255,255,0.02)]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 p-12 text-center max-w-lg">
          <div className="w-32 h-32 rounded-3xl bg-surface-alt border border-[rgba(255,255,255,0.05)] flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl opacity-50" />
             <span className="text-5xl font-black bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent transform -skew-x-12">M</span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-4">
            Security First
          </h2>
          <p className="text-muted text-lg leading-relaxed">
            We use email verification to ensure your restaurant account remains completely secure from unauthorized access.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}
