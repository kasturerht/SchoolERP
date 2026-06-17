"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { AuthErrorAlert } from "./auth-error-alert";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setSent(true);
    } catch (err: any) {
      console.error("Firebase sendPasswordResetEmail error:", err);
      let errMsg = "Failed to send reset email. Please try again.";
      if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      } else if (err.code === "auth/user-not-found") {
        errMsg = "No account found with this email address.";
      } else if (err.code === "auth/too-many-requests") {
        errMsg = "Too many requests. Please try again later.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="border border-slate-200/40 dark:border-slate-800/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl shadow-slate-100/30 dark:shadow-none rounded-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-primary mb-2 shadow-inner">
                <Icon
                  name="check_circle"
                  size={24}
                  className="text-primary animate-pulse"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Check your email</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                  We sent a secure password reset link to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>
                </p>
              </div>
              <div className="pt-2">
                <Button 
                  variant="text" 
                  onClick={() => setSent(false)}
                  className="text-xs font-bold text-primary hover:bg-slate-50 dark:hover:bg-slate-800/40 border-none bg-transparent"
                >
                  Send again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {error && <AuthErrorAlert message={error} />}

              <form onSubmit={handleSubmit} className="space-y-5">
                <TextField
                  label="Email Address"
                  type="email"
                  variant="compact"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leadingIcon="mail"
                  required
                  fullWidth
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  variant="filled"
                  fullWidth
                  loading={loading}
                  icon="send"
                  className="h-10 text-xs font-bold uppercase tracking-wider bg-primary text-white rounded-lg transition-transform active:scale-98 shadow-sm cursor-pointer border-none"
                >
                  Send Reset Link
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-primary font-bold hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
