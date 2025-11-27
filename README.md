# Happy Tenant

AI-powered property management platform that simplifies how landlords manage rentals, screen tenants, collect rent, and handle maintenance - all in one place.

## Features

- **Property Management**: Manage multiple properties and units with ease
- **Tenant Screening**: AI-assisted tenant screening and risk assessment
- **Rent Collection**: Automated rent collection with Stripe integration
- **Maintenance Tracking**: Track and manage maintenance requests efficiently
- **Document Management**: Store and organize leases, receipts, and other documents
- **Communication Hub**: Built-in messaging system for landlord-tenant communication
- **AI Assistant**: Get intelligent insights and recommendations
- **Financial Analytics**: Track income, expenses, and generate reports
- **Progressive Web App**: Install on mobile devices for on-the-go access

## Tech Stack

### Core
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Runtime**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)

### State Management
- **Server State**: [TanStack Query (React Query)](https://tanstack.com/query) - Data fetching, caching, and synchronization
- **Client State**: [Zustand](https://zustand-demo.pmnd.rs/) - UI state and preferences
- **Persistence**: localStorage via Zustand middleware

### UI Components
- **Component Library**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

### Testing
- **Unit Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- **E2E Testing**: [Playwright](https://playwright.dev/)
- **Coverage**: [@vitest/coverage-v8](https://vitest.dev/guide/coverage)

## Getting Started

### Prerequisites

- **Node.js**: 20.x or later
- **npm**: 10.x or later (comes with Node.js)
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/happy-tenant.git
   cd happy-tenant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure your environment variables:
   - Database connection strings
   - Authentication secrets
   - Stripe API keys (for payments)
   - Email service credentials (optional)
   - SMS service credentials (optional)
   - File storage credentials (optional)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Mock Data

The application currently uses mock data from `/src/data/mock-data.ts` for development. This allows you to explore all features without setting up a backend.

To switch to a real API:
- Update the functions in `/src/hooks/use-properties.ts` and `/src/hooks/use-tenants.ts`
- Replace mock API calls with real fetch/axios calls
- Configure `NEXT_PUBLIC_API_URL` in your `.env.local`

## Project Structure

```
happy-tenant/
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   └── manifest.json      # PWA manifest
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (dashboard)/   # Landlord dashboard
│   │   ├── (marketing)/   # Marketing/landing pages
│   │   └── (tenant)/      # Tenant portal
│   ├── components/        # React components
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── documents/     # Document management
│   │   ├── properties/    # Property components
│   │   ├── tenants/       # Tenant components
│   │   └── ui/            # Reusable UI components
│   ├── contexts/          # React contexts
│   │   └── auth-context.tsx
│   ├── data/              # Mock data
│   │   └── mock-data.ts
│   ├── hooks/             # Custom React hooks
│   │   ├── use-properties.ts
│   │   ├── use-tenants.ts
│   │   └── index.ts
│   ├── lib/               # Utility functions
│   │   ├── query-client.ts
│   │   ├── schemas/       # Zod validation schemas
│   │   └── utils.ts
│   ├── providers/         # React providers
│   │   ├── query-provider.tsx
│   │   └── index.ts
│   ├── stores/            # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   └── index.ts
│   ├── test/              # Test utilities
│   └── types/             # TypeScript type definitions
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run unit tests with Vitest
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
npm run test:e2e     # Run end-to-end tests with Playwright
npm run test:e2e:ui  # Run E2E tests with UI
npm run test:e2e:headed # Run E2E tests in headed mode
```

## State Management Architecture

### React Query (Server State)
Used for all server data fetching and mutations:
- Properties, tenants, leases
- Transactions and payments
- Maintenance requests
- Documents and messages
- Automatic caching and background refetching
- Optimistic updates for better UX

### Zustand (Client State)
Used for UI state and user preferences:
- Sidebar collapse state
- Modal open/close states
- Filter and sort preferences
- View preferences (grid/list)
- Theme preferences
- Persisted to localStorage

### Auth Context
Manages authentication state:
- User session
- Role-based access control
- Permission checking
- Login/logout flows

## Authentication & Authorization

Currently using mock authentication for development. The auth system includes:

- **Roles**: `landlord`, `tenant`, `admin`
- **Protected Routes**: Using `ProtectedRoute` component
- **Permissions**: Role-based permission system
- **Session**: Stored in Zustand with localStorage persistence

To implement real authentication:
1. Integrate NextAuth.js or similar
2. Update `/src/contexts/auth-context.tsx`
3. Connect to your auth provider
4. Configure environment variables

## Database Schema (Planned)

The application is designed to work with the following entities:
- Users & Organizations
- Properties & Units
- Tenants & Leases
- Transactions & Payments
- Maintenance Requests
- Messages & Conversations
- Documents
- Notifications

See `/src/types/index.ts` for complete TypeScript definitions.

## Environment Variables

See `.env.example` for all available environment variables. Key variables include:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `DATABASE_URL` - Database connection string
- `AUTH_SECRET` - Authentication secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker
```bash
docker build -t happy-tenant .
docker run -p 3000:3000 happy-tenant
```

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted

## Progressive Web App (PWA)

The application includes PWA support:
- Installable on mobile and desktop
- Offline capability (planned)
- App-like experience
- Custom splash screen
- Icon sets for all devices

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new files
- Follow the existing code style
- Run `npm run lint` before committing
- Write tests for new features

## Roadmap

- [ ] Backend API integration
- [ ] Real authentication with NextAuth.js
- [ ] Database integration (PostgreSQL)
- [ ] Stripe payment processing
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced AI features
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@happytenant.com or join our Slack community.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Hosted on [Vercel](https://vercel.com/)

---

Made with care for landlords and tenants everywhere
