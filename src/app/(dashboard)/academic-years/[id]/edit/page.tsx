"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "@/components/ui/snackbar";
import { Button } from "@/components/ui/button";
import { AcademicYearForm } from "@/components/academic-years/academic-year-form";
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

interface AcademicYearData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export default function EditAcademicYearPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const snackbar = useSnackbar();

  const [year, setYear] = useState<AcademicYearData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/academic-years/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setYear(data.data);
        } else {
          snackbar.show(data.error?.message ?? "Academic year not found");
          router.push("/academic-years");
        }
      })
      .catch(() => {
        snackbar.show("Failed to load academic year");
        router.push("/academic-years");
      })
      .finally(() => setLoading(false));
  }, [params.id, router, snackbar]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/academic-years/${params.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        snackbar.show("Academic year deleted");
        router.push("/academic-years");
        router.refresh();
      } else {
        snackbar.show(data.error?.message ?? "Failed to delete academic year");
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
          <BreadcrumbItem href="/academic-years">Academic Years</BreadcrumbItem>
          <BreadcrumbItem>Edit</BreadcrumbItem>
        </Breadcrumb>
        <h1 className="text-headline-md font-semibold text-on-surface mb-6">
          Edit Academic Year
        </h1>
        <FormSkeleton />
      </div>
    );
  }

  if (!year) return null;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/academic-years">Academic Years</BreadcrumbItem>
        <BreadcrumbItem>Edit</BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-md font-semibold text-on-surface">
          Edit Academic Year
        </h1>
        <PermissionGate module="academic_years" action="delete">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="text" icon="delete" className="text-error">
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Delete academic year?</DialogTitle>
              <DialogDescription>
                This will permanently delete the academic year &ldquo;{year.name}&rdquo;.
                This cannot be undone. If classes exist under this year, deletion will be refused.
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

      <AcademicYearForm mode="edit" initialData={year} />
    </div>
  );
}
