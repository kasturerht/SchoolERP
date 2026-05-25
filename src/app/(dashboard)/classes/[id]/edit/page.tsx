"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "@/components/ui/snackbar";
import { ClassForm } from "@/components/classes/class-form";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { FormSkeleton } from "@/components/ui/skeleton";

interface ClassData {
  id: string;
  name: string;
  numericGrade: number;
  branchId: string;
  academicYearId: string;
  classTeacherId?: string | null;
  classTeacher?: { id: string; name: string } | null;
  subjectTeachers?: Array<{ staff: { id: string; name: string } }>;
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

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Edit Class
      </h1>

      <ClassForm mode="edit" initialData={classData} />
    </div>
  );
}
