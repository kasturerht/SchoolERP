import { Icon } from "@/components/ui/icon";

interface AuthHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
}

export function AuthHeader({ icon, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary mb-4">
        <Icon name={icon} size={32} className="text-on-primary" />
      </div>
      <h1 className="text-headline-md font-semibold text-on-surface">
        {title}
      </h1>
      <p className="text-body-lg text-on-surface-variant mt-1">{subtitle}</p>
    </div>
  );
}
