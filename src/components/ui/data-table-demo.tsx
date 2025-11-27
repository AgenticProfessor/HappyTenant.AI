"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"

/**
 * Example property type for the demo
 */
export type Property = {
  id: string
  name: string
  address: string
  type: "apartment" | "house" | "condo" | "townhouse"
  units: number
  status: "active" | "inactive" | "maintenance"
  monthlyRent: number
}

/**
 * Sample property data for demonstration
 */
const sampleProperties: Property[] = [
  {
    id: "1",
    name: "Sunset Apartments",
    address: "123 Main St, Springfield, IL",
    type: "apartment",
    units: 24,
    status: "active",
    monthlyRent: 1200,
  },
  {
    id: "2",
    name: "Oak Tree House",
    address: "456 Oak Ave, Portland, OR",
    type: "house",
    units: 1,
    status: "active",
    monthlyRent: 2500,
  },
  {
    id: "3",
    name: "Downtown Condos",
    address: "789 City Center, Seattle, WA",
    type: "condo",
    units: 12,
    status: "maintenance",
    monthlyRent: 1800,
  },
  {
    id: "4",
    name: "Garden Townhouses",
    address: "321 Garden Ln, Austin, TX",
    type: "townhouse",
    units: 8,
    status: "active",
    monthlyRent: 1650,
  },
  {
    id: "5",
    name: "Riverside Complex",
    address: "555 River Rd, Denver, CO",
    type: "apartment",
    units: 36,
    status: "inactive",
    monthlyRent: 1400,
  },
  {
    id: "6",
    name: "Mountain View Estate",
    address: "777 Peak Dr, Boulder, CO",
    type: "house",
    units: 1,
    status: "active",
    monthlyRent: 3200,
  },
  {
    id: "7",
    name: "Harbor Condos",
    address: "999 Harbor St, San Francisco, CA",
    type: "condo",
    units: 18,
    status: "active",
    monthlyRent: 2800,
  },
  {
    id: "8",
    name: "Maple Street Townhomes",
    address: "147 Maple St, Boston, MA",
    type: "townhouse",
    units: 6,
    status: "active",
    monthlyRent: 2100,
  },
  {
    id: "9",
    name: "Lakeside Apartments",
    address: "258 Lake View Dr, Chicago, IL",
    type: "apartment",
    units: 42,
    status: "maintenance",
    monthlyRent: 1550,
  },
  {
    id: "10",
    name: "Pine Valley House",
    address: "369 Pine Valley Rd, Nashville, TN",
    type: "house",
    units: 1,
    status: "active",
    monthlyRent: 2200,
  },
]

/**
 * Column definitions for the properties table
 */
export const propertyColumns: ColumnDef<Property>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate text-muted-foreground">
            {row.getValue("address")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <div className="flex w-[100px] items-center">
          <span className="capitalize">{type}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "units",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Units" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("units")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              status === "active"
                ? "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                : status === "inactive"
                  ? "bg-gray-50 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400"
                  : "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
            }`}
          >
            {status}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "monthlyRent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monthly Rent" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("monthlyRent"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const property = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(property.id)}
            >
              Copy property ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit property</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

/**
 * DataTable Demo Component
 *
 * Demonstrates all features of the DataTable component system:
 * - Column sorting
 * - Row selection
 * - Pagination
 * - Search/filtering
 * - Column visibility toggling
 * - Custom toolbar actions
 * - Row actions dropdown
 * - Responsive design
 *
 * @example
 * ```tsx
 * import { DataTableDemo } from "@/components/ui/data-table-demo"
 *
 * export default function PropertiesPage() {
 *   return <DataTableDemo />
 * }
 * ```
 */
export function DataTableDemo() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Properties</h2>
        <p className="text-muted-foreground">
          Manage your property portfolio with advanced table features.
        </p>
      </div>

      <DataTable
        columns={propertyColumns}
        data={sampleProperties}
        onRowClick={(property) => {
          console.log("Row clicked:", property)
        }}
        filterColumn="name"
        searchPlaceholder="Search properties..."
        defaultPageSize={10}
      >
        <Button variant="default" size="sm" className="h-8">
          Add Property
        </Button>
      </DataTable>
    </div>
  )
}

/**
 * Alternative simpler demo without custom toolbar actions
 */
export function DataTableSimpleDemo() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Properties</h2>
        <p className="text-muted-foreground">
          Simple table implementation with default controls.
        </p>
      </div>

      <DataTable
        columns={propertyColumns}
        data={sampleProperties}
        onRowClick={(property) => {
          console.log("Row clicked:", property)
        }}
        filterColumn="name"
        searchPlaceholder="Search properties..."
        defaultPageSize={5}
      />
    </div>
  )
}
