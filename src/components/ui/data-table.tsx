"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TableInstance,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"

/**
 * Props for the DataTable component
 * @template TData - The type of data items in the table
 * @template TValue - The type of values in table cells
 */
interface DataTableProps<TData, TValue> {
  /**
   * Column definitions for the table
   */
  columns: ColumnDef<TData, TValue>[]

  /**
   * Data to display in the table
   */
  data: TData[]

  /**
   * Optional callback when a row is clicked
   */
  onRowClick?: (row: TData) => void

  /**
   * Optional default page size (defaults to 10)
   */
  defaultPageSize?: number

  /**
   * Optional filter column key for the search functionality
   */
  filterColumn?: string

  /**
   * Optional placeholder for the search input
   */
  searchPlaceholder?: string

  /**
   * Whether to show the toolbar (defaults to true)
   */
  showToolbar?: boolean

  /**
   * Whether to show pagination (defaults to true)
   */
  showPagination?: boolean

  /**
   * Optional children to render in the toolbar (action buttons, etc.)
   */
  children?: React.ReactNode
}

/**
 * A fully-featured data table component built with @tanstack/react-table
 *
 * Features:
 * - Column sorting (ascending/descending)
 * - Row selection with checkboxes
 * - Pagination with customizable page sizes
 * - Column filtering and search
 * - Column visibility toggling
 * - Responsive design
 * - Keyboard accessible
 * - Works with any data type through TypeScript generics
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<Property>[] = [
 *   {
 *     id: "select",
 *     header: ({ table }) => (
 *       <Checkbox
 *         checked={table.getIsAllPageRowsSelected()}
 *         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
 *       />
 *     ),
 *     cell: ({ row }) => (
 *       <Checkbox
 *         checked={row.getIsSelected()}
 *         onCheckedChange={(value) => row.toggleSelected(!!value)}
 *       />
 *     ),
 *   },
 *   {
 *     accessorKey: "name",
 *     header: ({ column }) => (
 *       <DataTableColumnHeader column={column} title="Property Name" />
 *     ),
 *   },
 * ]
 *
 * <DataTable
 *   columns={columns}
 *   data={properties}
 *   onRowClick={(property) => console.log(property)}
 *   filterColumn="name"
 *   searchPlaceholder="Search properties..."
 * >
 *   <Button onClick={handleAdd}>Add Property</Button>
 * </DataTable>
 * ```
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  defaultPageSize = 10,
  filterColumn,
  searchPlaceholder = "Search...",
  showToolbar = true,
  showPagination = true,
  children,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
  })

  return (
    <div className="space-y-4">
      {showToolbar && (
        <DataTableToolbar
          table={table}
          filterColumn={filterColumn}
          searchPlaceholder={searchPlaceholder}
        >
          {children}
        </DataTableToolbar>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && <DataTablePagination table={table} />}
    </div>
  )
}

/**
 * Export types for use in custom components
 */
export type { DataTableProps, TableInstance }
