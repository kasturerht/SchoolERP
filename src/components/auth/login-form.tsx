"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { AuthErrorAlert } from "./auth-error-alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFirebaseSignIn(idToken: string) {
    const result = await signIn("firebase", {
      idToken,
      redirect: false,
    });

    if (result?.error) {
      setError("Account not found or inactive. Contact your administrator.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const idToken = await credential.user.getIdToken();
      await handleFirebaseSignIn(idToken);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/user-disabled":
          setError(
            "This account has been disabled. Contact your administrator."
          );
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card variant="outlined">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <AuthErrorAlert message={error} />

          <div className="flex flex-col gap-5">
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

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leadingIcon="lock"
              trailingIcon={showPassword ? "visibility_off" : "visibility"}
              onTrailingIconClick={() => setShowPassword(!showPassword)}
              required
              fullWidth
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-end mt-2 mb-6">
            <Link
              href="/forgot-password"
              className="text-[14px] leading-5 font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="filled"
            fullWidth
            loading={loading}
            icon="login"
          >
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
