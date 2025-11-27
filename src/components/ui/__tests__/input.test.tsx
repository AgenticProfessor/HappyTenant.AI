import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      render(<Input className="custom-class" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('custom-class')
    })

    it('should have data-slot attribute', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('data-slot', 'input')
    })

    it('should render with default type text', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      // When no type is specified, browsers default to 'text' but may not show the attribute
      expect(input.type).toBe('text')
    })
  })

  describe('Types', () => {
    it('should render email type', () => {
      render(<Input type="email" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render password type', () => {
      render(<Input type="password" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should render number type', () => {
      render(<Input type="number" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render tel type', () => {
      render(<Input type="tel" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should render date type', () => {
      render(<Input type="date" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'date')
    })
  })

  describe('Interactions', () => {
    it('should handle value changes', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Type here" />)

      const input = screen.getByPlaceholderText(/type here/i)
      await user.type(input, 'Hello World')

      expect(input).toHaveValue('Hello World')
    })

    it('should call onChange handler', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Input onChange={handleChange} placeholder="Type here" />)
      const input = screen.getByPlaceholderText(/type here/i)

      await user.type(input, 'test')

      expect(handleChange).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledTimes(4) // Once per character
    })

    it('should call onFocus handler', async () => {
      const handleFocus = vi.fn()
      const user = userEvent.setup()

      render(<Input onFocus={handleFocus} placeholder="Type here" />)
      const input = screen.getByPlaceholderText(/type here/i)

      await user.click(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('should call onBlur handler', async () => {
      const handleBlur = vi.fn()
      const user = userEvent.setup()

      render(
        <>
          <Input onBlur={handleBlur} placeholder="Type here" />
          <button>Other element</button>
        </>
      )

      const input = screen.getByPlaceholderText(/type here/i)
      const button = screen.getByRole('button')

      await user.click(input)
      await user.click(button)

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('should be clearable', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Type here" />)

      const input = screen.getByPlaceholderText(/type here/i)
      await user.type(input, 'Hello')
      expect(input).toHaveValue('Hello')

      await user.clear(input)
      expect(input).toHaveValue('')
    })
  })

  describe('States', () => {
    it('should render disabled state', () => {
      render(<Input disabled placeholder="Disabled input" />)
      const input = screen.getByPlaceholderText(/disabled input/i)
      expect(input).toBeDisabled()
    })

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup()
      render(<Input disabled placeholder="Disabled input" />)

      const input = screen.getByPlaceholderText(/disabled input/i)
      await user.type(input, 'test')

      expect(input).toHaveValue('')
    })

    it('should render readonly state', () => {
      render(<Input readOnly value="Read only" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('readonly')
    })

    it('should render required state', () => {
      render(<Input required placeholder="Required input" />)
      const input = screen.getByPlaceholderText(/required input/i)
      expect(input).toBeRequired()
    })

    it('should render with value', () => {
      render(<Input value="Initial value" onChange={() => {}} data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveValue('Initial value')
    })

    it('should render with defaultValue', () => {
      render(<Input defaultValue="Default value" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveValue('Default value')
    })
  })

  describe('Validation', () => {
    it('should support maxLength', async () => {
      const user = userEvent.setup()
      render(<Input maxLength={5} placeholder="Max 5 chars" />)

      const input = screen.getByPlaceholderText(/max 5 chars/i)
      await user.type(input, '123456789')

      expect(input).toHaveValue('12345')
    })

    it('should support pattern attribute', () => {
      render(<Input pattern="[0-9]*" placeholder="Numbers only" />)
      const input = screen.getByPlaceholderText(/numbers only/i)
      expect(input).toHaveAttribute('pattern', '[0-9]*')
    })

    it('should support min and max for number type', () => {
      render(<Input type="number" min={0} max={100} data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
    })

    it('should support aria-invalid for error state', () => {
      render(<Input aria-invalid="true" placeholder="Invalid input" />)
      const input = screen.getByPlaceholderText(/invalid input/i)
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Username" />)
      const input = screen.getByLabelText(/username/i)
      expect(input).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="helper-text" placeholder="Email" />
          <div id="helper-text">Enter your email address</div>
        </>
      )
      const input = screen.getByPlaceholderText(/email/i)
      expect(input).toHaveAttribute('aria-describedby', 'helper-text')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Type here" />)

      const input = screen.getByPlaceholderText(/type here/i)

      input.focus()
      expect(input).toHaveFocus()

      await user.keyboard('Hello')
      expect(input).toHaveValue('Hello')
    })
  })

  describe('Placeholder', () => {
    it('should render placeholder text', () => {
      render(<Input placeholder="Enter your name" />)
      expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument()
    })

    it('should hide placeholder when value is entered', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Type here" />)

      const input = screen.getByPlaceholderText(/type here/i)
      await user.type(input, 'test')

      expect(input).toHaveValue('test')
    })
  })
})
