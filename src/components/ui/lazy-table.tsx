"use client";

import React from "react";
import dynamic from "next/dynamic";
import { TableSkeleton } from "./skeleton";
import { DataTable as BaseDataTable } from "./data-table";

const DynamicDataTable = dynamic(
  () => import("./data-table").then((mod) => mod.DataTable),
  {
    ssr: false,
    loading: () => <TableSkeleton rows={5} columns={5} />,
  }
);

// Cast to retain TypeScript generic type inference in pages importing DataTable
export const DataTable = DynamicDataTable as unknown as typeof BaseDataTable;
