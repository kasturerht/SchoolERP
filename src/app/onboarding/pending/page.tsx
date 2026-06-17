"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export default function OnboardingPendingPage() {
  const { data: session, update } = useSession();

  async function handleCheckStatus() {
    // Triggers session update which will query the server for fresh details
    await update();
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center p-4 bg-surface-container-lowest/30 dark:bg-zinc-950/20">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-container text-on-primary-container animate-pulse duration-1000 mb-2 shadow-elevation-1">
          <Icon name="construction" size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-headline-sm font-black text-on-surface">School Portal Setup in Progress</h1>
          <p className="text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Your school administrator is currently setting up the <strong>{session?.user?.organizationName || "School"}</strong> portal.
          </p>
          <p className="text-body-sm text-on-surface-variant/85 max-w-xs mx-auto">
            Once configuration is complete, you will automatically receive access to your dashboard.
          </p>
        </div>

        <Card variant="outlined" className="bg-white dark:bg-surface-container border border-outline-variant shadow-elevation-1">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col gap-3">
              <Button
                variant="filled"
                fullWidth
                icon="refresh"
                onClick={handleCheckStatus}
              >
                Check Setup Status
              </Button>
              
              <Button
                variant="text"
                fullWidth
                icon="logout"
                className="text-error hover:bg-error/5"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
