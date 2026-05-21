"use client";

import { useMemo, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type RowClickedEvent,
  type GridReadyEvent,
} from "ag-grid-community";
import { TableSkeleton } from "./skeleton";
import { EmptyState } from "./empty-state";

ModuleRegistry.registerModules([AllCommunityModule]);

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyIcon?: string;
  emptyMessage?: string;
  quickFilter?: string;
  paginationPageSize?: number;
}

const AG_GRID_THEME_OVERRIDES: React.CSSProperties = {
  "--ag-border-color": "var(--color-outline-variant)",
  "--ag-header-background-color": "var(--color-surface)",
  "--ag-background-color": "var(--color-surface)",
  "--ag-foreground-color": "var(--color-on-surface)",
  "--ag-header-foreground-color": "var(--color-on-surface-variant)",
  "--ag-row-hover-color": "rgba(0,0,0,0.04)",
  "--ag-selected-row-background-color": "var(--color-primary-container)",
  "--ag-font-family": "var(--font-sans)",
  "--ag-font-size": "14px",
  "--ag-border-radius": "0",
} as React.CSSProperties;

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyIcon = "search_off",
  emptyMessage = "No results found",
  quickFilter,
  paginationPageSize = 20,
}: DataTableProps<T>) {
  const gridRef = useRef<AgGridReact>(null);

  const colDefs: ColDef[] = useMemo(
    () =>
      columns.map((col) => ({
        field: col.key,
        headerName: col.header,
        cellRenderer: (params: { data: T }) => col.render(params.data),
        sortable: col.key !== "actions",
        filter: col.key !== "actions",
        suppressHeaderMenuButton: col.key === "actions",
        maxWidth: col.className?.includes("w-12") ? 64 : undefined,
        flex: col.className?.includes("w-12") ? 0 : 1,
      })),
    [columns]
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: false,
      suppressMovable: true,
    }),
    []
  );

  const getRowId = useCallback(
    (params: { data: T }) => keyExtractor(params.data),
    [keyExtractor]
  );

  const handleRowClicked = useCallback(
    (event: RowClickedEvent<T>) => {
      if (!onRowClick || !event.data) return;
      onRowClick(event.data);
    },
    [onRowClick]
  );

  const onGridReady = useCallback((_event: GridReadyEvent) => {
    // Grid is ready
  }, []);

  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length || 5} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyMessage}
        description=""
      />
    );
  }

  return (
    <div
      className="ag-theme-quartz"
      style={AG_GRID_THEME_OVERRIDES}
    >
      <AgGridReact<T>
        ref={gridRef}
        rowData={data}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        onRowClicked={handleRowClicked}
        onGridReady={onGridReady}
        domLayout="autoHeight"
        pagination={true}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={false}
        quickFilterText={quickFilter}
        rowClass={onRowClick ? "cursor-pointer" : undefined}
        suppressCellFocus={true}
      />
    </div>
  );
}
