import { AuthHeader, ForgotPasswordForm } from "@/components/auth";

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        icon="lock_reset"
        title="Reset password"
        subtitle="We'll send you a link to reset your password"
      />
      <ForgotPasswordForm />
    </>
  );
}
