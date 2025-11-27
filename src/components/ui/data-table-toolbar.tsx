"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"

/**
 * Props for the DataTableToolbar component
 * @template TData - The type of data items in the table
 */
interface DataTableToolbarProps<TData> {
  /**
   * The table instance from @tanstack/react-table
   */
  table: Table<TData>

  /**
   * Optional filter column key for the search functionality
   */
  filterColumn?: string

  /**
   * Optional placeholder for the search input
   */
  searchPlaceholder?: string

  /**
   * Optional custom actions to render in the toolbar
   */
  children?: React.ReactNode
}

/**
 * A toolbar component for DataTable with search, filters, and column visibility controls
 *
 * Features:
 * - Search/filter input for a specific column
 * - Column visibility toggle dropdown
 * - Filter reset button (shown when filters are active)
 * - Slot for custom action buttons
 * - Keyboard accessible
 * - Responsive design
 *
 * @example
 * ```tsx
 * <DataTableToolbar
 *   table={table}
 *   filterColumn="name"
 *   searchPlaceholder="Search properties..."
 * >
 *   <Button onClick={handleAdd}>Add Property</Button>
 * </DataTableToolbar>
 * ```
 */
export function DataTableToolbar<TData>({
  table,
  filterColumn,
  searchPlaceholder = "Search...",
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {filterColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <XIcon className="ml-2 size-4" />
          </Button>
        )}
        {children}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
