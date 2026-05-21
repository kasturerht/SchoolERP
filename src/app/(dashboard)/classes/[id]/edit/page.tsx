"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "@/components/ui/snackbar";
import { Button } from "@/components/ui/button";
import { ClassForm } from "@/components/classes/class-form";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { FormSkeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface ClassData {
  id: string;
  name: string;
  numericGrade: number;
  branchId: string;
  academicYearId: string;
  sections: Array<{ id: string; name: string }>;
  feeStructures: Array<{
    id: string;
    amount: number | string;
    frequency: string;
    feeCategory: { name: string };
  }>;
  branch: { id: string; name: string };
  academicYear: { id: string; name: string };
}

export default function EditClassPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const snackbar = useSnackbar();

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/classes/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClassData(data.data);
        } else {
          snackbar.show(data.error?.message ?? "Class not found");
          router.push("/classes");
        }
      })
      .catch(() => {
        snackbar.show("Failed to load class");
        router.push("/classes");
      })
      .finally(() => setLoading(false));
  }, [params.id, router, snackbar]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/classes/${params.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        snackbar.show("Class deleted");
        router.push("/classes");
        router.refresh();
      } else {
        snackbar.show(data.error?.message ?? "Failed to delete class");
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
          <BreadcrumbItem href="/classes">Classes</BreadcrumbItem>
          <BreadcrumbItem>Edit</BreadcrumbItem>
        </Breadcrumb>
        <h1 className="text-headline-md font-semibold text-on-surface mb-6">
          Edit Class
        </h1>
        <FormSkeleton />
      </div>
    );
  }

  if (!classData) return null;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/classes">Classes</BreadcrumbItem>
        <BreadcrumbItem>Edit</BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-md font-semibold text-on-surface">
          Edit Class
        </h1>
        <PermissionGate module="classes" action="delete">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="text" icon="delete" className="text-error">
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Delete class?</DialogTitle>
              <DialogDescription>
                This will permanently delete the class &ldquo;{classData.name}&rdquo;
                along with its sections and fee structures. If students are enrolled,
                deletion will be refused.
              </DialogDescription>
              <div className="mt-6 flex justify-end gap-3">
                <DialogClose asChild>
                  <Button variant="text">Cancel</Button>
                </DialogClose>
                <Button
                  variant="filled"
                  onClick={handleDelete}
                  loading={deleting}
                  className="bg-error text-on-error"
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </PermissionGate>
      </div>

      <ClassForm mode="edit" initialData={classData} />
    </div>
  );
}
