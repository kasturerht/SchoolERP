"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SnackbarMessage {
  id: string;
  text: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface SnackbarContextType {
  show: (text: string, options?: { action?: SnackbarMessage["action"]; duration?: number }) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
  return ctx;
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  const show = useCallback(
    (text: string, options?: { action?: SnackbarMessage["action"]; duration?: number }) => {
      const id = crypto.randomUUID();
      setMessages((prev) => [...prev, { id, text, ...options }]);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto z-50 flex flex-col gap-2">
        {messages.map((msg) => (
          <SnackbarItem key={msg.id} message={msg} onDismiss={dismiss} />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

function SnackbarItem({
  message,
  onDismiss,
}: {
  message: SnackbarMessage;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(message.id), 200);
    }, message.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 min-w-[288px] max-w-[560px]",
        "bg-inverse-surface text-inverse-on-surface",
        "rounded-xs shadow-elevation-3",
        "text-body-md transition-all duration-200",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
    >
      <span className="flex-1">{message.text}</span>
      {message.action && (
        <button
          onClick={message.action.onClick}
          className="text-inverse-primary text-label-lg font-medium px-2 py-1 rounded-xs hover:bg-inverse-primary/8 cursor-pointer"
        >
          {message.action.label}
        </button>
      )}
    </div>
  );
}
