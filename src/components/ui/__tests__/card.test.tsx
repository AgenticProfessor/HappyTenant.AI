import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '../card'

describe('Card', () => {
  describe('Card Container', () => {
    it('should render correctly with children', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      )
      expect(screen.getByText(/card content/i)).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-slot', 'card')
    })

    it('should render with custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('should have proper default styles', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-card')
      expect(card).toHaveClass('text-card-foreground')
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('shadow-sm')
    })
  })

  describe('CardHeader', () => {
    it('should render correctly', () => {
      render(
        <Card>
          <CardHeader>
            <div>Header content</div>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText(/header content/i)).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(
        <CardHeader data-testid="card-header">
          Header
        </CardHeader>
      )
      const header = screen.getByTestId('card-header')
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })

    it('should render with custom className', () => {
      render(
        <CardHeader className="custom-header" data-testid="card-header">
          Header
        </CardHeader>
      )
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText(/card title/i)).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })

    it('should render with custom className', () => {
      render(
        <CardTitle className="custom-title" data-testid="card-title">
          Title
        </CardTitle>
      )
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass('custom-title')
    })

    it('should have proper typography styles', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('leading-none')
    })
  })

  describe('CardDescription', () => {
    it('should render correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>This is a description</CardDescription>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText(/this is a description/i)).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(
        <CardDescription data-testid="card-description">
          Description
        </CardDescription>
      )
      const description = screen.getByTestId('card-description')
      expect(description).toHaveAttribute('data-slot', 'card-description')
    })

    it('should render with custom className', () => {
      render(
        <CardDescription className="custom-description" data-testid="card-description">
          Description
        </CardDescription>
      )
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('custom-description')
    })

    it('should have muted text style', () => {
      render(<CardDescription data-testid="card-description">Description</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('text-muted-foreground')
      expect(description).toHaveClass('text-sm')
    })
  })

  describe('CardAction', () => {
    it('should render correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
        </Card>
      )
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(
        <CardAction data-testid="card-action">
          Action
        </CardAction>
      )
      const action = screen.getByTestId('card-action')
      expect(action).toHaveAttribute('data-slot', 'card-action')
    })

    it('should render with custom className', () => {
      render(
        <CardAction className="custom-action" data-testid="card-action">
          Action
        </CardAction>
      )
      const action = screen.getByTestId('card-action')
      expect(action).toHaveClass('custom-action')
    })
  })

  describe('CardContent', () => {
    it('should render correctly', () => {
      render(
        <Card>
          <CardContent>
            <p>Content text</p>
          </CardContent>
        </Card>
      )
      expect(screen.getByText(/content text/i)).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(
        <CardContent data-testid="card-content">
          Content
        </CardContent>
      )
      const content = screen.getByTestId('card-content')
      expect(content).toHaveAttribute('data-slot', 'card-content')
    })

    it('should render with custom className', () => {
      render(
        <CardContent className="custom-content" data-testid="card-content">
          Content
        </CardContent>
      )
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('custom-content')
    })

    it('should have proper padding', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('px-6')
    })
  })

  describe('CardFooter', () => {
    it('should render correctly', () => {
      render(
        <Card>
          <CardFooter>
            <button>Footer Action</button>
          </CardFooter>
        </Card>
      )
      expect(screen.getByRole('button', { name: /footer action/i })).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(
        <CardFooter data-testid="card-footer">
          Footer
        </CardFooter>
      )
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
    })

    it('should render with custom className', () => {
      render(
        <CardFooter className="custom-footer" data-testid="card-footer">
          Footer
        </CardFooter>
      )
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('should have proper flex layout', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('px-6')
    })
  })

  describe('Complete Card', () => {
    it('should render a complete card with all sections', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>View and manage property information</CardDescription>
            <CardAction>
              <button>Edit</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>123 Main Street</p>
          </CardContent>
          <CardFooter>
            <button>Save</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText(/property details/i)).toBeInTheDocument()
      expect(screen.getByText(/view and manage property information/i)).toBeInTheDocument()
      expect(screen.getByText(/123 main street/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })

    it('should work with nested components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Nested Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h3>Section 1</h3>
              <p>Content 1</p>
            </div>
            <div>
              <h3>Section 2</h3>
              <p>Content 2</p>
            </div>
          </CardContent>
        </Card>
      )

      expect(screen.getByText(/nested content/i)).toBeInTheDocument()
      expect(screen.getByText(/section 1/i)).toBeInTheDocument()
      expect(screen.getByText(/content 1/i)).toBeInTheDocument()
      expect(screen.getByText(/section 2/i)).toBeInTheDocument()
      expect(screen.getByText(/content 2/i)).toBeInTheDocument()
    })
  })
})
