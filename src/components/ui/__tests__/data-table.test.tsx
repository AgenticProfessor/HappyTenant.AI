import { describe, it, expect, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"

/**
 * Test data type
 */
type TestData = {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
}

/**
 * Sample test data
 */
const testData: TestData[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", status: "inactive" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", status: "active" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", status: "active" },
  { id: "5", name: "Eve Adams", email: "eve@example.com", status: "inactive" },
]

/**
 * Sample column definitions
 */
const testColumns: ColumnDef<TestData>[] = [
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
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <span className="capitalize">{status}</span>
    },
  },
]

describe("DataTable", () => {
  describe("Basic Rendering", () => {
    it("should render the table with data", () => {
      render(<DataTable columns={testColumns} data={testData} />)

      // Check if all rows are rendered
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      expect(screen.getByText("Bob Smith")).toBeInTheDocument()
      expect(screen.getByText("Charlie Brown")).toBeInTheDocument()
      expect(screen.getByText("Diana Prince")).toBeInTheDocument()
      expect(screen.getByText("Eve Adams")).toBeInTheDocument()
    })

    it("should render column headers", () => {
      render(<DataTable columns={testColumns} data={testData} />)

      expect(screen.getByText("Name")).toBeInTheDocument()
      expect(screen.getByText("Email")).toBeInTheDocument()
      expect(screen.getByText("Status")).toBeInTheDocument()
    })

    it("should render empty state when no data is provided", () => {
      render(<DataTable columns={testColumns} data={[]} />)

      expect(screen.getByText("No results.")).toBeInTheDocument()
    })

    it("should render the toolbar by default", () => {
      render(
        <DataTable
          columns={testColumns}
          data={testData}
          filterColumn="name"
          searchPlaceholder="Search users..."
        />
      )

      expect(screen.getByPlaceholderText("Search users...")).toBeInTheDocument()
    })

    it("should render the pagination by default", () => {
      render(<DataTable columns={testColumns} data={testData} />)

      // Check for pagination elements
      expect(screen.getByText(/row\(s\) total/i)).toBeInTheDocument()
      expect(screen.getByText(/Rows per page/i)).toBeInTheDocument()
    })

    it("should hide toolbar when showToolbar is false", () => {
      render(
        <DataTable
          columns={testColumns}
          data={testData}
          filterColumn="name"
          searchPlaceholder="Search users..."
          showToolbar={false}
        />
      )

      expect(screen.queryByPlaceholderText("Search users...")).not.toBeInTheDocument()
    })

    it("should hide pagination when showPagination is false", () => {
      render(
        <DataTable columns={testColumns} data={testData} showPagination={false} />
      )

      expect(screen.queryByText(/Rows per page/i)).not.toBeInTheDocument()
    })
  })

  describe("Sorting", () => {
    it("should render sortable column headers", () => {
      render(<DataTable columns={testColumns} data={testData} />)

      // Check that sortable headers are rendered as buttons
      const nameHeader = screen.getByRole("button", { name: /Name/i })
      expect(nameHeader).toBeInTheDocument()

      const emailHeader = screen.getByRole("button", { name: /Email/i })
      expect(emailHeader).toBeInTheDocument()
    })

    // Note: Full sorting interaction tests are skipped due to Radix UI dropdown menu
    // mocking complexity in jsdom. Sorting functionality is tested in integration tests.
  })

  describe("Filtering", () => {
    it("should filter data based on search input", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={testColumns}
          data={testData}
          filterColumn="name"
          searchPlaceholder="Search users..."
        />
      )

      const searchInput = screen.getByPlaceholderText("Search users...")

      // Type in search input
      await user.type(searchInput, "Alice")

      // Check if only Alice is visible
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument()
      expect(screen.queryByText("Charlie Brown")).not.toBeInTheDocument()
    })

    it("should show no results when search has no matches", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={testColumns}
          data={testData}
          filterColumn="name"
          searchPlaceholder="Search users..."
        />
      )

      const searchInput = screen.getByPlaceholderText("Search users...")

      // Type in search input with no matches
      await user.type(searchInput, "NonexistentUser")

      // Check if no results message is shown
      expect(screen.getByText("No results.")).toBeInTheDocument()
    })
  })

  describe("Pagination", () => {
    it("should paginate data correctly", async () => {
      const user = userEvent.setup()
      render(
        <DataTable columns={testColumns} data={testData} defaultPageSize={2} />
      )

      // Initially should show first 2 items
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      expect(screen.getByText("Bob Smith")).toBeInTheDocument()
      expect(screen.queryByText("Charlie Brown")).not.toBeInTheDocument()

      // Click next page
      const nextButton = screen.getByRole("button", { name: /Go to next page/i })
      await user.click(nextButton)

      // Should show next 2 items
      expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument()
      expect(screen.getByText("Charlie Brown")).toBeInTheDocument()
      expect(screen.getByText("Diana Prince")).toBeInTheDocument()
    })

    it("should render page size selector", () => {
      render(
        <DataTable columns={testColumns} data={testData} defaultPageSize={2} />
      )

      // Initially should show 2 items per page
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      expect(screen.getByText("Bob Smith")).toBeInTheDocument()
      expect(screen.queryByText("Charlie Brown")).not.toBeInTheDocument()

      // Check that page size selector is rendered
      const pageSizeButton = screen.getByRole("combobox")
      expect(pageSizeButton).toBeInTheDocument()
    })

    // Note: Page size change interaction test is skipped due to Radix UI Select
    // mocking complexity in jsdom. This functionality is tested in integration tests.

    it("should disable previous button on first page", () => {
      render(
        <DataTable columns={testColumns} data={testData} defaultPageSize={2} />
      )

      const previousButton = screen.getByRole("button", {
        name: /Go to previous page/i,
      })
      expect(previousButton).toBeDisabled()
    })

    it("should disable next button on last page", async () => {
      const user = userEvent.setup()
      render(
        <DataTable columns={testColumns} data={testData} defaultPageSize={10} />
      )

      const nextButton = screen.getByRole("button", { name: /Go to next page/i })
      expect(nextButton).toBeDisabled()
    })
  })

  describe("Row Selection", () => {
    it("should select individual rows", async () => {
      const user = userEvent.setup()
      render(<DataTable columns={testColumns} data={testData} />)

      // Find all checkboxes (first one is the header checkbox)
      const checkboxes = screen.getAllByRole("checkbox")
      const firstRowCheckbox = checkboxes[1] // Skip header checkbox

      // Click the checkbox
      await user.click(firstRowCheckbox)

      // Check if selection count is updated
      expect(screen.getByText(/1 of 5 row\(s\) selected/i)).toBeInTheDocument()
    })

    it("should select all rows when header checkbox is clicked", async () => {
      const user = userEvent.setup()
      render(<DataTable columns={testColumns} data={testData} />)

      // Find the header checkbox
      const checkboxes = screen.getAllByRole("checkbox")
      const headerCheckbox = checkboxes[0]

      // Click the header checkbox
      await user.click(headerCheckbox)

      // Check if all rows are selected
      expect(screen.getByText(/5 of 5 row\(s\) selected/i)).toBeInTheDocument()
    })
  })

  describe("Row Click Handler", () => {
    it("should call onRowClick when a row is clicked", async () => {
      const user = userEvent.setup()
      const handleRowClick = vi.fn()

      render(
        <DataTable
          columns={testColumns}
          data={testData}
          onRowClick={handleRowClick}
        />
      )

      // Click on a row (find by text content)
      const aliceRow = screen.getByText("Alice Johnson").closest("tr")
      expect(aliceRow).toBeInTheDocument()

      if (aliceRow) {
        await user.click(aliceRow)
        expect(handleRowClick).toHaveBeenCalledWith(testData[0])
      }
    })

    it("should add cursor-pointer class when onRowClick is provided", () => {
      const handleRowClick = vi.fn()

      render(
        <DataTable
          columns={testColumns}
          data={testData}
          onRowClick={handleRowClick}
        />
      )

      const aliceRow = screen.getByText("Alice Johnson").closest("tr")
      expect(aliceRow).toHaveClass("cursor-pointer")
    })
  })

  describe("Column Visibility", () => {
    it("should render view options button", () => {
      render(<DataTable columns={testColumns} data={testData} />)

      // Check that view options button is rendered
      const viewButton = screen.getByRole("button", { name: /View/i })
      expect(viewButton).toBeInTheDocument()
    })

    // Note: Column visibility toggle test is skipped due to Radix UI dropdown menu
    // mocking complexity in jsdom. This functionality is tested in integration tests.
  })

  describe("Custom Toolbar Actions", () => {
    it("should render custom children in the toolbar", () => {
      render(
        <DataTable columns={testColumns} data={testData} filterColumn="name">
          <button>Add User</button>
        </DataTable>
      )

      expect(screen.getByRole("button", { name: "Add User" })).toBeInTheDocument()
    })
  })
})
