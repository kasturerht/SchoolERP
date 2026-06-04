"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Card, CardContent } from "@/components/ui/card";
import { useSnackbar } from "@/components/ui/snackbar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, string> = {
  students: "school",
  staff: "badge",
  attendance: "fact_check",
  fees: "payments",
  exams: "quiz",
  timetable: "calendar_month",
  transport: "directions_bus",
  library: "local_library",
  hostel: "apartment",
  notices: "campaign",
  events: "event",
  reports: "analytics",
  settings: "settings",
  subjects: "menu_book",
  classes: "class",
  academic_years: "date_range",
  branches: "location_city",
  users: "group",
};

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string | null;
}

interface RoleData {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

interface RoleFormProps {
  mode: "create" | "edit";
  initialData?: RoleData;
}

export function RoleForm({ mode, initialData }: RoleFormProps) {
  const router = useRouter();
  const snackbar = useSnackbar();
  const { data: session } = useSession();

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(
    new Set(initialData?.permissions ?? [])
  );
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Accordion State
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const isSystem = initialData?.isSystem ?? false;
  const isUserAdmin = session?.user?.roleName === "SUPER_ADMIN" || session?.user?.roleName === "SCHOOL_ADMIN";
  const disableEdits = isSystem && !isUserAdmin;

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const res = await fetch("/api/v1/permissions");
        const data = await res.json();
        if (data.success) {
          setPermissions(data.data);
          // Auto-expand first 2 modules by default
          const uniqueModules = Array.from(new Set((data.data as Permission[]).map(p => p.module)));
          setExpandedModules(new Set(uniqueModules.slice(0, 2)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    fetchPermissions();
  }, []);

  const permissionsByModule: Record<string, Permission[]> = {};
  permissions.forEach(p => {
    if (!permissionsByModule[p.module]) permissionsByModule[p.module] = [];
    permissionsByModule[p.module].push(p);
  });

  const togglePermission = (id: string) => {
    if (disableEdits) return;
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectModule = (modulePerms: Permission[], selectAll: boolean) => {
    if (disableEdits) return;
    setSelectedPerms(prev => {
      const next = new Set(prev);
      modulePerms.forEach(p => {
        if (selectAll) next.add(p.id);
        else next.delete(p.id);
      });
      return next;
    });
  };

  const toggleAccordion = (moduleName: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleName)) next.delete(moduleName);
      else next.add(moduleName);
      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disableEdits) return;

    setErrors({});
    if (name.trim().length < 2) {
      setErrors({ name: "Name must be at least 2 characters" });
      return;
    }
    if (selectedPerms.size === 0) {
      snackbar.show("Please select at least one permission");
      return;
    }

    setLoading(true);
    const payload = isSystem
      ? { permissions: Array.from(selectedPerms) }
      : {
          name: name.trim(),
          description: description.trim(),
          permissions: Array.from(selectedPerms),
        };

    try {
      const url = mode === "create" ? "/api/v1/roles" : `/api/v1/roles/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        snackbar.show(data.error?.message ?? "Failed to save role");
        return;
      }

      snackbar.show(mode === "create" ? "Role created" : "Role updated");
      router.push("/settings/roles");
      router.refresh();
    } catch (err) {
      snackbar.show("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
      <Card variant="outlined" className="bg-surface shadow-sm rounded-2xl border-outline-variant/30">
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TextField
              label="Role Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
              fullWidth
              disabled={isSystem}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              disabled={isSystem}
            />
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined" className="overflow-hidden border-outline-variant/30 shadow-sm rounded-2xl bg-surface">
        <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <h2 className="text-title-md font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              Module Permissions
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Select specific access rights for this role.</p>
          </div>
          {isSystem && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container">
              {disableEdits ? "System Role (Read-only)" : "System Role (Editable)"}
            </span>
          )}
        </div>
        
        <CardContent className="p-0">
          {fetching ? (
            <div className="flex items-center justify-center p-12 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              Loading structure...
            </div>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-outline-variant/10">
              {Object.entries(permissionsByModule).map(([moduleName, perms]) => {
                const isExpanded = expandedModules.has(moduleName);
                const allModuleSelected = perms.every(p => selectedPerms.has(p.id));
                const someModuleSelected = perms.some(p => selectedPerms.has(p.id));
                const indeterminate = someModuleSelected && !allModuleSelected;

                return (
                  <div key={moduleName} className="flex flex-col">
                    {/* Accordion Header */}
                    <div 
                      className={cn(
                        "flex items-center justify-between px-6 py-3.5 cursor-pointer transition-colors hover:bg-surface-container-lowest",
                        isExpanded ? "bg-surface-container-lowest" : ""
                      )}
                      onClick={() => toggleAccordion(moduleName)}
                    >
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "material-symbols-outlined text-[22px] transition-colors",
                          someModuleSelected ? "text-primary" : "text-on-surface-variant/50"
                        )}>
                          {MODULE_ICONS[moduleName] || "extension"}
                        </span>
                        <div>
                          <h3 className="text-label-lg font-semibold capitalize text-on-surface">
                            {moduleName.replace(/_/g, " ")}
                          </h3>
                          <p className="text-body-sm text-on-surface-variant/70">
                            {perms.filter(p => selectedPerms.has(p.id)).length} of {perms.length} selected
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                        {!disableEdits && (
                          <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-container-low px-2 py-1 rounded-md transition-colors">
                            <span className="text-label-sm font-medium text-on-surface-variant">Select All</span>
                            <Checkbox
                              checked={allModuleSelected}
                              // @ts-ignore - custom indeterminate logic if needed, but we'll use CSS for now or just true/false
                              onChange={(e) => handleSelectModule(perms, e.target.checked)}
                              disabled={disableEdits}
                              className={cn(
                                "rounded-[4px] border-outline-variant/50",
                                indeterminate && !allModuleSelected ? "bg-primary/50 border-primary/50" : ""
                              )}
                            />
                          </label>
                        )}
                        <button 
                          type="button"
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                          onClick={() => toggleAccordion(moduleName)}
                        >
                          <span className={cn(
                            "material-symbols-outlined transition-transform duration-200",
                            isExpanded ? "rotate-180" : ""
                          )}>
                            expand_more
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Accordion Content */}
                    <div className={cn(
                      "grid gap-4 px-6 overflow-hidden transition-all duration-300 ease-in-out",
                      isExpanded ? "py-4 opacity-100 max-h-[500px]" : "max-h-0 opacity-0 py-0"
                    )}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pl-10">
                        {perms.map(p => (
                          <label 
                            key={p.id} 
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                              selectedPerms.has(p.id) 
                                ? "bg-primary-container/20 border-primary/30" 
                                : "bg-surface border-outline-variant/20 hover:border-outline-variant/50"
                            )}
                          >
                            <div className="mt-0.5">
                              <Checkbox
                                checked={selectedPerms.has(p.id)}
                                onChange={() => togglePermission(p.id)}
                                disabled={disableEdits}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-label-md font-semibold text-on-surface uppercase tracking-wider">
                                {p.action.replace(/_/g, " ")}
                              </span>
                              {p.description && (
                                <span className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                                  {p.description}
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pt-4">
        <Button
          type="button"
          variant="outlined"
          onClick={() => router.push("/settings/roles")}
        >
          {disableEdits ? "Back" : "Cancel"}
        </Button>
        {!disableEdits && (
          <Button type="submit" variant="filled" loading={loading} icon="save" className="rounded-full px-8 shadow-sm">
            {mode === "create" ? "Create Role" : "Save Changes"}
          </Button>
        )}
      </div>
    </form>
  );
}
