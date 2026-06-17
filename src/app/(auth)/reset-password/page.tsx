import { AuthHeader, ResetPasswordForm } from "@/components/auth";

export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeader
        icon="lock_reset"
        title="Create new password"
        subtitle="Enter your new secure password below"
      />
      <ResetPasswordForm />
    </>
  );
}
