"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/ui/search-bar";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { FAB } from "@/components/ui/fab";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui/menu";
import { Icon } from "@/components/ui/icon";

interface BranchRow {
  id: string;
  name: string;
  code: string;
  phone: string | null;
  email: string | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function BranchesPage() {
  const router = useRouter();

  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/branches?limit=9999");
      const data = await res.json();
      if (data.success) {
        setBranches(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const columns: Column<BranchRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "code",
      header: "Code",
      render: (row) => row.code,
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => row.phone ?? "—",
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.email ?? "—",
    },
    {
      key: "isMain",
      header: "Main",
      render: (row) =>
        row.isMain ? (
          <Chip label="Main" variant="filled" color="primary" icon="star" />
        ) : null,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Chip
          label={row.isActive ? "Active" : "Inactive"}
          variant="filled"
          color={row.isActive ? "success" : "error"}
          icon={row.isActive ? "check_circle" : "cancel"}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Menu>
          <MenuTrigger asChild>
            <button
              type="button"
              className="rounded-full p-1 hover:bg-on-surface/8 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon name="more_vert" size={20} className="text-on-surface-variant" />
            </button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem
              icon="edit"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/branches/${row.id}/edit`);
              }}
            >
              Edit
            </MenuItem>
          </MenuContent>
        </Menu>
      ),
      className: "w-12",
    },
  ];

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Branches</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Branches
      </h1>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search branches"
            className="sm:max-w-xs"
          />
          <PermissionGate module="branches" action="manage">
            <Button
              variant="filled"
              icon="add"
              onClick={() => router.push("/branches/new")}
              className="hidden md:inline-flex"
            >
              Add Branch
            </Button>
          </PermissionGate>
        </div>

        {/* Table */}
        <div className="rounded-md border border-outline-variant bg-surface overflow-hidden">
          <DataTable
            columns={columns}
            data={branches}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => router.push(`/branches/${row.id}/edit`)}
            loading={loading}
            emptyIcon="location_off"
            emptyMessage="No branches found"
            quickFilter={searchInput}
          />
        </div>
      </div>

      <PermissionGate module="branches" action="manage">
        <FAB icon="add" onClick={() => router.push("/branches/new")} />
      </PermissionGate>
    </div>
  );
}
