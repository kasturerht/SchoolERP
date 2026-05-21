import { Icon } from "@/components/ui/icon";

interface AuthErrorAlertProps {
  message: string;
}

export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 p-3 mb-4 rounded-[8px] bg-error-container">
      <Icon
        name="error"
        size={20}
        className="text-on-error-container mt-0.5 shrink-0"
      />
      <p className="text-[14px] leading-5 text-on-error-container">{message}</p>
    </div>
  );
}
