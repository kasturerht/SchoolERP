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
    } catch {
      setError("Failed to send reset email. Check the email address.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card variant="outlined">
        <CardContent className="p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-container mb-4">
                <Icon
                  name="mark_email_read"
                  size={24}
                  className="text-on-primary-container"
                />
              </div>
              <p className="text-body-lg text-on-surface mb-2">
                Check your email
              </p>
              <p className="text-body-md text-on-surface-variant mb-6">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Button variant="text" onClick={() => setSent(false)}>
                Send again
              </Button>
            </div>
          ) : (
            <>
              <AuthErrorAlert message={error} />

              <form onSubmit={handleSubmit} className="space-y-5">
                <TextField
                  label="Email"
                  type="email"
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
                >
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <p className="text-center mt-6 text-body-md text-on-surface-variant">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
