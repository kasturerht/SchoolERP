"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "@/components/ui/snackbar";
import { Button } from "@/components/ui/button";
import { StaffForm } from "@/components/staff/staff-form";
import { StaffDocuments } from "@/components/staff/staff-documents";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { FormSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface StaffData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  qualification: string | null;
  joinDate: string;
  status: string;
  branch: { id: string; name: string };
}

export default function EditStaffPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const snackbar = useSnackbar();

  const [staff, setStaff] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/staff/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStaff(data.data);
        } else {
          snackbar.show(data.error?.message ?? "Staff member not found");
          router.push("/staff");
        }
      })
      .catch(() => {
        snackbar.show("Failed to load staff member");
        router.push("/staff");
      })
      .finally(() => setLoading(false));
  }, [params.id, router, snackbar]);

  async function handleTerminate() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/staff/${params.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        snackbar.show("Staff member terminated");
        router.push("/staff");
        router.refresh();
      } else {
        snackbar.show(data.error?.message ?? "Failed to terminate staff member");
      }
    } catch {
      snackbar.show("An error occurred");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <Breadcrumb>
          <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
          <BreadcrumbItem href="/staff">Staff</BreadcrumbItem>
          <BreadcrumbItem>Edit</BreadcrumbItem>
        </Breadcrumb>
        <h1 className="text-headline-md font-semibold text-on-surface mb-6">
          Edit Staff Member
        </h1>
        <FormSkeleton />
      </div>
    );
  }

  if (!staff) return null;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/staff">Staff</BreadcrumbItem>
        <BreadcrumbItem>{staff.name}</BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-md font-semibold text-on-surface">
          Edit Staff Member
        </h1>
        <PermissionGate module="staff" action="delete">
          {staff.status !== "TERMINATED" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="text"
                  icon="person_off"
                  className="text-error"
                >
                  Terminate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Terminate staff member?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to terminate this staff member? This
                  will mark them as terminated.
                </DialogDescription>
                <div className="mt-6 flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="text">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="filled"
                    onClick={handleTerminate}
                    loading={deleting}
                    className="bg-error text-on-error"
                  >
                    Terminate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </PermissionGate>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <StaffForm mode="edit" initialData={staff} />
        </TabsContent>
        <TabsContent value="documents">
          <StaffDocuments staffId={staff.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
