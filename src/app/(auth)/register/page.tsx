import { AuthHeader, RegisterForm } from "@/components/auth";

export default function RegisterPage() {
  return (
    <>
      <AuthHeader
        icon="school"
        title="Register your school"
        subtitle="Get started with SchoolERP for free"
      />
      <RegisterForm />
    </>
  );
}
