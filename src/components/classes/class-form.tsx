"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Icon } from "@/components/ui/icon";
import { useSnackbar } from "@/components/ui/snackbar";
import { MultiSelect } from "@/components/ui/multi-select";
import { useBranches } from "@/hooks/use-branches";
import { useTeachers } from "@/hooks/use-teachers";
import {
  createClassSchema,
  updateClassSchema,
} from "@/lib/validations/class";

interface AcademicYearOption {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface SectionRow {
  id?: string;
  name: string;
}

interface FeeRow {
  id?: string;
  name: string;
  amount: number | string;
}

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

interface ClassFormProps {
  mode: "create" | "edit";
  initialData?: ClassData;
}

export function ClassForm({ mode, initialData }: ClassFormProps) {
  const router = useRouter();
  const snackbar = useSnackbar();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const { branches, isLoading: branchesLoading } = useBranches();

  const [name, setName] = useState(initialData?.name ?? "");
  const [numericGrade, setNumericGrade] = useState<string>(
    initialData?.numericGrade?.toString() ?? ""
  );
  const [branchId, setBranchId] = useState(initialData?.branchId ?? "");
  const [academicYearId, setAcademicYearId] = useState(
    initialData?.academicYearId ?? ""
  );
  const [sections, setSections] = useState<SectionRow[]>(
    initialData?.sections ?? [{ name: "A" }]
  );
  const [classTeacherId, setClassTeacherId] = useState<string>(
    initialData?.classTeacherId ?? ""
  );
  const [subjectTeacherIds, setSubjectTeacherIds] = useState<string[]>(
    initialData?.subjectTeachers?.map((st) => st.staff.id) ?? []
  );
  const [fees, setFees] = useState<FeeRow[]>(
    initialData?.feeStructures?.map((f) => ({
      id: f.id,
      name: f.feeCategory.name,
      amount: Number(f.amount),
    })) ?? []
  );

  const { teachers, isLoading: teachersLoading } = useTeachers(branchId);

  // Auto-assign branch for non-SUPER_ADMIN users
  useEffect(() => {
    if (!isSuperAdmin && session?.user?.branchId && !branchId) {
      setBranchId(session.user.branchId);
    }
  }, [isSuperAdmin, session?.user?.branchId, branchId]);

  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch academic years on mount
  useEffect(() => {
    fetch("/api/v1/academic-years")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAcademicYears(data.data);
          // Auto-select current year if creating
          if (mode === "create" && !academicYearId) {
            const current = data.data.find(
              (y: AcademicYearOption) => y.isCurrent
            );
            if (current) setAcademicYearId(current.id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setAcademicYearsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Section helpers
  function addSection() {
    setSections((prev) => [...prev, { name: "" }]);
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSection(index: number, value: string) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, name: value } : s))
    );
  }

  // Fee helpers
  function addFee() {
    setFees((prev) => [
      ...prev,
      { name: "", amount: "" },
    ]);
  }

  function removeFee(index: number) {
    setFees((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFee(index: number, field: keyof FeeRow, value: string) {
    setFees((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  }

  const annualTotal = fees.reduce((sum, f) => {
    const amt = typeof f.amount === "string" ? parseFloat(f.amount) : f.amount;
    if (isNaN(amt) || amt <= 0) return sum;
    return sum + amt;
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const formFields = {
      name,
      numericGrade: numericGrade !== "" ? parseInt(numericGrade, 10) : undefined,
      branchId,
      academicYearId,
      classTeacherId: classTeacherId || null,
      subjectTeacherIds,
      sections: sections.map((s) => ({
        ...(s.id ? { id: s.id } : {}),
        name: s.name,
      })),
      fees: fees.map((f) => ({
        ...(f.id ? { id: f.id } : {}),
        name: f.name,
        amount:
          typeof f.amount === "string" ? parseFloat(f.amount) : f.amount,
      })),
    };

    if (mode === "create") {
      const result = createClassSchema.safeParse(formFields);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const err of result.error.errors) {
          const key = err.path.join(".");
          if (!fieldErrors[key]) fieldErrors[key] = err.message;
        }
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/v1/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.data),
        });
        const data = await res.json();

        if (!data.success) {
          snackbar.show(data.error?.message ?? "Failed to create class");
          return;
        }

        snackbar.show("Class created successfully");
        router.push("/classes");
        router.refresh();
      } catch {
        snackbar.show("An error occurred");
      } finally {
        setLoading(false);
      }
    } else {
      const result = updateClassSchema.safeParse(formFields);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const err of result.error.errors) {
          const key = err.path.join(".");
          if (!fieldErrors[key]) fieldErrors[key] = err.message;
        }
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/v1/classes/${initialData!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.data),
        });
        const data = await res.json();

        if (!data.success) {
          snackbar.show(data.error?.message ?? "Failed to update class");
          return;
        }

        snackbar.show("Class updated successfully");
        router.push("/classes");
        router.refresh();
      } catch {
        snackbar.show("An error occurred");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      <Card variant="outlined">
        <CardContent className="p-6 space-y-5">
          {/* Class Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Class name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="e.g. Class 1"
              required
              fullWidth
            />
            <TextField
              label="Numeric grade"
              type="number"
              value={numericGrade}
              onChange={(e) => setNumericGrade(e.target.value)}
              error={errors.numericGrade}
              placeholder="e.g. 1"
              required
              fullWidth
            />
          </div>

          <div className={`grid grid-cols-1 gap-4 ${isSuperAdmin ? "sm:grid-cols-2" : ""}`}>
            {isSuperAdmin && (
              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface-variant px-1">
                  Branch *
                </label>
                <Select
                  value={branchId}
                  onValueChange={setBranchId}
                  disabled={mode === "edit"}
                >
                  <SelectTrigger fullWidth>
                    <SelectValue
                      placeholder={
                        branchesLoading ? "Loading..." : "Select branch"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.branchId && (
                  <p className="px-4 text-[12px] leading-4 text-error">
                    {errors.branchId}
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-label-md text-on-surface-variant px-1">
                Academic Year *
              </label>
              <Select
                value={academicYearId}
                onValueChange={setAcademicYearId}
                disabled={mode === "edit"}
              >
                <SelectTrigger fullWidth>
                  <SelectValue
                    placeholder={
                      academicYearsLoading ? "Loading..." : "Select academic year"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name}
                      {y.isCurrent ? " (Current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.academicYearId && (
                <p className="px-4 text-[12px] leading-4 text-error">
                  {errors.academicYearId}
                </p>
              )}
            </div>
          </div>

          <Divider />

          {/* Teacher Assignments */}
          <div>
            <p className="text-label-lg font-medium text-on-surface mb-3">
              Teacher Assignments
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface-variant px-1">
                  Class Teacher
                </label>
                <Select
                  value={classTeacherId || "__none__"}
                  onValueChange={(val) =>
                    setClassTeacherId(val === "__none__" ? "" : val)
                  }
                  disabled={!branchId}
                >
                  <SelectTrigger fullWidth>
                    <SelectValue
                      placeholder={
                        teachersLoading
                          ? "Loading..."
                          : !branchId
                            ? "Select branch first"
                            : "Select class teacher"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface-variant px-1">
                  Subject Teachers
                </label>
                <MultiSelect
                  options={teachers.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  value={subjectTeacherIds}
                  onChange={setSubjectTeacherIds}
                  placeholder={
                    teachersLoading
                      ? "Loading..."
                      : !branchId
                        ? "Select branch first"
                        : "Select subject teachers"
                  }
                  searchPlaceholder="Search teachers..."
                  disabled={!branchId}
                  fullWidth
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-label-lg font-medium text-on-surface">
                Sections
              </p>
              <Button
                type="button"
                variant="text"
                icon="add"
                onClick={addSection}
              >
                Add Section
              </Button>
            </div>
            {errors.sections && (
              <p className="px-4 text-[12px] leading-4 text-error mb-2">
                {errors.sections}
              </p>
            )}
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TextField
                    label=""
                    placeholder="Section name (e.g. A)"
                    value={section.name}
                    onChange={(e) => updateSection(index, e.target.value)}
                    error={errors[`sections.${index}.name`]}
                    fullWidth
                  />
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="rounded-full p-2 hover:bg-surface-container-high text-on-surface-variant"
                    >
                      <Icon name="close" size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Fee Structure */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-label-lg font-medium text-on-surface">
                Fee Structure
              </p>
              <Button
                type="button"
                variant="text"
                icon="add"
                onClick={addFee}
              >
                Add Fee
              </Button>
            </div>
            <div className="space-y-3">
              {fees.map((fee, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2"
                >
                  <div className="flex-1">
                    <TextField
                      label=""
                      placeholder="Fee name (e.g. Tuition)"
                      value={fee.name}
                      onChange={(e) => updateFee(index, "name", e.target.value)}
                      error={errors[`fees.${index}.name`]}
                      fullWidth
                    />
                  </div>
                  <div className="w-40">
                    <TextField
                      label=""
                      type="number"
                      placeholder="Amount (Annual)"
                      value={fee.amount.toString()}
                      onChange={(e) =>
                        updateFee(index, "amount", e.target.value)
                      }
                      error={errors[`fees.${index}.amount`]}
                      fullWidth
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFee(index)}
                    className="rounded-full p-2 hover:bg-surface-container-high text-on-surface-variant mt-1"
                  >
                    <Icon name="close" size={20} />
                  </button>
                </div>
              ))}
              {fees.length === 0 && (
                <p className="text-body-sm text-on-surface-variant">
                  No fees added. Click &ldquo;Add Fee&rdquo; to define the fee structure.
                </p>
              )}
            </div>
            {fees.length > 0 && (
              <div className="mt-4 text-right">
                <p className="text-label-lg text-on-surface">
                  Total:{" "}
                  <span className="font-semibold">
                    ₹{annualTotal.toLocaleString("en-IN")}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pt-6">
        <Button
          type="button"
          variant="outlined"
          onClick={() => router.push("/classes")}
        >
          Cancel
        </Button>
        <Button type="submit" variant="filled" loading={loading} icon="save">
          {mode === "create" ? "Create Class" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
