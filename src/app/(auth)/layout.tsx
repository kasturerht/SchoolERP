export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-screen flex items-center justify-center bg-surface-container-lowest p-6 overflow-y-auto">
      {/* Decorative gradient circles */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-container/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-tertiary-container/20 blur-3xl" />
      <div className="relative z-10 w-full max-w-[420px]">{children}</div>
    </div>
  );
}
