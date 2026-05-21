import { Suspense } from "react";
import { AuthHeader, LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <div>
      <AuthHeader
        icon="school"
        title="Welcome back"
        subtitle="Sign in to your SchoolERP account"
      />
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
