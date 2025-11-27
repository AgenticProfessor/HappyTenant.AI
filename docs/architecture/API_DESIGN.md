# Happy Tenant - API & Service Architecture

## Service Boundaries

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (Vercel Edge)                          │
│  • Authentication/Authorization                                               │
│  • Rate Limiting                                                             │
│  • Request Routing                                                           │
│  • API Versioning                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Core API      │      │   AI Services   │      │  Real-time      │
│   (Node.js)     │      │   (Python)      │      │  (Socket.io)    │
│                 │      │                 │      │                 │
│  /api/v1/*      │      │  /ai/*          │      │  wss://         │
│                 │      │                 │      │                 │
│  • Properties   │      │  • Agents       │      │  • Chat         │
│  • Units        │      │  • Analysis     │      │  • Notifications│
│  • Tenants      │      │  • Generation   │      │  • Status       │
│  • Leases       │      │  • Embeddings   │      │                 │
│  • Payments     │      │                 │      │                 │
│  • Maintenance  │      │                 │      │                 │
│  • Messages     │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## Core API Endpoints (Node.js/Fastify)

### Authentication & Users

```yaml
# Auth (handled by Clerk/Auth.js middleware)
POST   /api/v1/auth/signup          # Create account
POST   /api/v1/auth/login           # Login
POST   /api/v1/auth/logout          # Logout
POST   /api/v1/auth/refresh         # Refresh token
POST   /api/v1/auth/forgot-password # Request reset
POST   /api/v1/auth/reset-password  # Reset password

# Users
GET    /api/v1/users/me             # Current user profile
PATCH  /api/v1/users/me             # Update profile
PUT    /api/v1/users/me/preferences # Update preferences
GET    /api/v1/users/me/organizations # List user's orgs
```

### Organizations

```yaml
GET    /api/v1/organizations                    # List orgs
POST   /api/v1/organizations                    # Create org
GET    /api/v1/organizations/:orgId             # Get org
PATCH  /api/v1/organizations/:orgId             # Update org
DELETE /api/v1/organizations/:orgId             # Delete org

# Members
GET    /api/v1/organizations/:orgId/members     # List members
POST   /api/v1/organizations/:orgId/members     # Invite member
PATCH  /api/v1/organizations/:orgId/members/:id # Update role
DELETE /api/v1/organizations/:orgId/members/:id # Remove member

# Settings
GET    /api/v1/organizations/:orgId/settings    # Get settings
PATCH  /api/v1/organizations/:orgId/settings    # Update settings
```

### Properties

```yaml
GET    /api/v1/properties                       # List properties
POST   /api/v1/properties                       # Create property
GET    /api/v1/properties/:id                   # Get property
PATCH  /api/v1/properties/:id                   # Update property
DELETE /api/v1/properties/:id                   # Delete property

# Property sub-resources
GET    /api/v1/properties/:id/units             # List units
GET    /api/v1/properties/:id/tenants           # List tenants
GET    /api/v1/properties/:id/leases            # List leases
GET    /api/v1/properties/:id/maintenance       # List maintenance
GET    /api/v1/properties/:id/transactions      # List transactions
GET    /api/v1/properties/:id/analytics         # Property analytics
GET    /api/v1/properties/:id/documents         # Property documents
POST   /api/v1/properties/:id/documents         # Upload document
```

### Units

```yaml
GET    /api/v1/units                            # List all units (filterable)
POST   /api/v1/units                            # Create unit
GET    /api/v1/units/:id                        # Get unit
PATCH  /api/v1/units/:id                        # Update unit
DELETE /api/v1/units/:id                        # Delete unit

# Unit operations
POST   /api/v1/units/:id/list                   # Create listing
DELETE /api/v1/units/:id/list                   # Remove listing
GET    /api/v1/units/:id/availability           # Check availability
POST   /api/v1/units/:id/photos                 # Upload photos
DELETE /api/v1/units/:id/photos/:photoId        # Delete photo

# Query examples:
# GET /api/v1/units?propertyId=xxx
# GET /api/v1/units?status=vacant
# GET /api/v1/units?minBedrooms=2&maxRent=2000
```

### Tenants

```yaml
GET    /api/v1/tenants                          # List tenants
POST   /api/v1/tenants                          # Create tenant
GET    /api/v1/tenants/:id                      # Get tenant
PATCH  /api/v1/tenants/:id                      # Update tenant
DELETE /api/v1/tenants/:id                      # Delete tenant

# Tenant operations
GET    /api/v1/tenants/:id/leases               # Tenant's leases
GET    /api/v1/tenants/:id/payments             # Payment history
GET    /api/v1/tenants/:id/maintenance          # Maintenance requests
GET    /api/v1/tenants/:id/documents            # Tenant documents
POST   /api/v1/tenants/:id/documents            # Upload document
POST   /api/v1/tenants/:id/invite               # Invite to portal

# Screening
POST   /api/v1/tenants/:id/screening            # Start screening
GET    /api/v1/tenants/:id/screening            # Get screening status
```

### Leases

```yaml
GET    /api/v1/leases                           # List leases
POST   /api/v1/leases                           # Create lease
GET    /api/v1/leases/:id                       # Get lease
PATCH  /api/v1/leases/:id                       # Update lease
DELETE /api/v1/leases/:id                       # Delete lease

# Lease operations
POST   /api/v1/leases/:id/generate              # Generate document
POST   /api/v1/leases/:id/send                  # Send for signature
GET    /api/v1/leases/:id/status                # Signature status
POST   /api/v1/leases/:id/renew                 # Initiate renewal
POST   /api/v1/leases/:id/terminate             # Terminate lease

# Lease tenants
GET    /api/v1/leases/:id/tenants               # List lease tenants
POST   /api/v1/leases/:id/tenants               # Add tenant to lease
DELETE /api/v1/leases/:id/tenants/:tenantId     # Remove tenant

# Query examples:
# GET /api/v1/leases?status=active
# GET /api/v1/leases?expiresWithin=30days
```

### Payments & Transactions

```yaml
GET    /api/v1/transactions                     # List transactions
POST   /api/v1/transactions                     # Create transaction
GET    /api/v1/transactions/:id                 # Get transaction
PATCH  /api/v1/transactions/:id                 # Update transaction

# Payment operations
POST   /api/v1/payments/charge                  # Charge tenant
POST   /api/v1/payments/refund                  # Issue refund
GET    /api/v1/payments/methods                 # List payment methods
POST   /api/v1/payments/methods                 # Add payment method
DELETE /api/v1/payments/methods/:id             # Remove method

# Tenant portal payments
POST   /api/v1/tenant-portal/pay                # Make payment
GET    /api/v1/tenant-portal/balance            # Get balance
POST   /api/v1/tenant-portal/autopay            # Setup autopay

# Recurring charges
GET    /api/v1/recurring-charges                # List recurring
POST   /api/v1/recurring-charges                # Create recurring
PATCH  /api/v1/recurring-charges/:id            # Update recurring
DELETE /api/v1/recurring-charges/:id            # Delete recurring
```

### Maintenance

```yaml
GET    /api/v1/maintenance                      # List requests
POST   /api/v1/maintenance                      # Create request
GET    /api/v1/maintenance/:id                  # Get request
PATCH  /api/v1/maintenance/:id                  # Update request
DELETE /api/v1/maintenance/:id                  # Delete request

# Maintenance operations
POST   /api/v1/maintenance/:id/assign           # Assign to vendor/staff
POST   /api/v1/maintenance/:id/schedule         # Schedule appointment
POST   /api/v1/maintenance/:id/complete         # Mark complete
POST   /api/v1/maintenance/:id/photos           # Add photos
POST   /api/v1/maintenance/:id/notes            # Add notes

# Tenant portal
POST   /api/v1/tenant-portal/maintenance        # Submit request
GET    /api/v1/tenant-portal/maintenance        # View my requests

# Vendors
GET    /api/v1/vendors                          # List vendors
POST   /api/v1/vendors                          # Create vendor
PATCH  /api/v1/vendors/:id                      # Update vendor
DELETE /api/v1/vendors/:id                      # Delete vendor
```

### Communication

```yaml
# Conversations
GET    /api/v1/conversations                    # List conversations
POST   /api/v1/conversations                    # Start conversation
GET    /api/v1/conversations/:id                # Get conversation
DELETE /api/v1/conversations/:id                # Archive conversation

# Messages
GET    /api/v1/conversations/:id/messages       # Get messages
POST   /api/v1/conversations/:id/messages       # Send message
POST   /api/v1/conversations/:id/read           # Mark as read

# Notifications
GET    /api/v1/notifications                    # List notifications
PATCH  /api/v1/notifications/:id/read           # Mark read
POST   /api/v1/notifications/read-all           # Mark all read
GET    /api/v1/notifications/preferences        # Get preferences
PATCH  /api/v1/notifications/preferences        # Update preferences

# Broadcasts
POST   /api/v1/broadcasts                       # Send to multiple
```

### Listings & Applications

```yaml
# Public listings
GET    /api/v1/public/listings                  # Search listings
GET    /api/v1/public/listings/:id              # View listing

# Applications
GET    /api/v1/applications                     # List applications
GET    /api/v1/applications/:id                 # Get application
PATCH  /api/v1/applications/:id                 # Update status
POST   /api/v1/applications/:id/approve         # Approve
POST   /api/v1/applications/:id/reject          # Reject

# Applicant portal
POST   /api/v1/apply/:listingId                 # Submit application
GET    /api/v1/apply/:applicationId/status      # Check status
POST   /api/v1/apply/:applicationId/documents   # Upload docs

# Showings
GET    /api/v1/showings                         # List showings
POST   /api/v1/showings                         # Schedule showing
PATCH  /api/v1/showings/:id                     # Update showing
DELETE /api/v1/showings/:id                     # Cancel showing
```

### Analytics & Reports

```yaml
# Dashboard
GET    /api/v1/analytics/dashboard              # Main dashboard data
GET    /api/v1/analytics/kpis                   # Key metrics

# Reports
GET    /api/v1/reports/income                   # Income report
GET    /api/v1/reports/expenses                 # Expense report
GET    /api/v1/reports/rent-roll                # Rent roll
GET    /api/v1/reports/vacancy                  # Vacancy report
GET    /api/v1/reports/maintenance              # Maintenance report
GET    /api/v1/reports/tenant-aging             # Aging report

# Export
POST   /api/v1/reports/export                   # Export to CSV/PDF
GET    /api/v1/reports/exports/:id              # Download export

# Query parameters for all reports:
# ?startDate=2024-01-01&endDate=2024-12-31
# ?propertyId=xxx
# ?groupBy=month|property|category
```

---

## AI Services API (Python/FastAPI)

```yaml
# Agent Execution
POST   /ai/agents/execute                       # Run an agent
GET    /ai/agents/sessions/:id                  # Get session status
POST   /ai/agents/sessions/:id/feedback         # Submit feedback

# Text Generation
POST   /ai/generate/listing-description         # Generate listing
POST   /ai/generate/message-reply               # Generate reply
POST   /ai/generate/maintenance-response        # Generate response
POST   /ai/generate/lease-summary               # Summarize lease

# Analysis
POST   /ai/analyze/document                     # Analyze document
POST   /ai/analyze/maintenance-photo            # Analyze photo
POST   /ai/analyze/market-rent                  # Market analysis
POST   /ai/analyze/tenant-risk                  # Risk assessment

# Embeddings & Search
POST   /ai/embeddings/create                    # Create embedding
POST   /ai/search/semantic                      # Semantic search
POST   /ai/search/similar-issues                # Find similar maintenance

# Predictions
GET    /ai/predict/vacancy/:propertyId          # Predict vacancy
GET    /ai/predict/collection/:leaseId          # Predict payment
GET    /ai/predict/maintenance/:propertyId      # Predict maintenance
```

---

## Real-time WebSocket Events

```typescript
// Connection
ws://api.happytenant.com/realtime?token=xxx

// Event Types
interface WebSocketEvents {
  // Incoming (server → client)
  'message:new': { conversationId: string; message: Message };
  'notification:new': { notification: Notification };
  'maintenance:updated': { requestId: string; status: string };
  'payment:received': { transactionId: string; amount: number };
  'tenant:typing': { conversationId: string; tenantId: string };

  // Outgoing (client → server)
  'message:send': { conversationId: string; content: string };
  'message:read': { conversationId: string; messageId: string };
  'typing:start': { conversationId: string };
  'typing:stop': { conversationId: string };
  'presence:update': { status: 'online' | 'away' | 'offline' };
}
```

---

## Request/Response Formats

### Standard Response Format

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
    };
    timestamp: string;
  };
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;           // 'VALIDATION_ERROR', 'NOT_FOUND', etc.
    message: string;        // Human-readable message
    details?: object;       // Field-level errors
    requestId: string;      // For support/debugging
  };
}

// Example success
{
  "success": true,
  "data": {
    "id": "prop_123",
    "name": "Oak Street Apartments",
    ...
  },
  "meta": {
    "timestamp": "2024-03-15T10:30:00Z"
  }
}

// Example error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "fields": {
        "rent_amount": "Must be a positive number",
        "start_date": "Must be a future date"
      }
    },
    "requestId": "req_abc123"
  }
}
```

### Pagination

```typescript
// Request
GET /api/v1/properties?page=1&pageSize=20&sort=name:asc

// Response
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalItems": 95
    }
  }
}
```

### Filtering

```typescript
// Query parameter filtering
GET /api/v1/units?status=vacant&minBedrooms=2&maxRent=2500

// Complex filtering (JSON in query)
GET /api/v1/transactions?filter={"type":["rent","late_fee"],"status":"completed"}

// Date ranges
GET /api/v1/transactions?dateFrom=2024-01-01&dateTo=2024-03-31
```

---

## Authentication & Authorization

### Auth Headers

```http
Authorization: Bearer <jwt_token>
X-Organization-Id: org_123    # Required for org-scoped requests
X-Request-Id: req_abc123      # Optional, for tracing
```

### Permission Model (RBAC)

```typescript
enum Role {
  OWNER = 'owner',       // Full access, billing, delete org
  ADMIN = 'admin',       // Full access except billing/delete org
  MANAGER = 'manager',   // Manage properties, limited settings
  STAFF = 'staff',       // Day-to-day operations
  VIEWER = 'viewer'      // Read-only access
}

// Permission matrix (simplified)
const permissions = {
  'properties:create': ['owner', 'admin'],
  'properties:read': ['owner', 'admin', 'manager', 'staff', 'viewer'],
  'properties:update': ['owner', 'admin', 'manager'],
  'properties:delete': ['owner', 'admin'],

  'tenants:create': ['owner', 'admin', 'manager', 'staff'],
  'tenants:read': ['owner', 'admin', 'manager', 'staff', 'viewer'],
  'tenants:update': ['owner', 'admin', 'manager', 'staff'],
  'tenants:delete': ['owner', 'admin'],

  'payments:charge': ['owner', 'admin', 'manager'],
  'payments:refund': ['owner', 'admin'],

  'settings:read': ['owner', 'admin', 'manager'],
  'settings:update': ['owner', 'admin'],

  'billing:manage': ['owner'],
};
```

---

## Rate Limiting

```yaml
# Rate limits by tier
free_tier:
  requests_per_minute: 60
  requests_per_day: 1000
  ai_requests_per_day: 50

pro_tier:
  requests_per_minute: 300
  requests_per_day: 10000
  ai_requests_per_day: 500

enterprise_tier:
  requests_per_minute: 1000
  requests_per_day: unlimited
  ai_requests_per_day: 5000

# Response headers
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1710500000
```

---

## API Versioning Strategy

```yaml
versioning_approach: URL-based

# Current
/api/v1/properties

# Future
/api/v2/properties

deprecation_policy:
  - Minimum 6 months notice before deprecation
  - Sunset header in responses when deprecated
  - Migration guide provided
  - Support overlap period

# Sunset header example
Sunset: Sat, 31 Dec 2025 23:59:59 GMT
Deprecation: true
Link: <https://docs.happytenant.com/migration/v1-to-v2>; rel="successor-version"
```

---

## Webhook Events (Outgoing)

```yaml
# Webhook configuration
POST /api/v1/webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["payment.completed", "maintenance.created"],
  "secret": "whsec_xxx"  # For signature verification
}

# Available events
events:
  # Payments
  - payment.completed
  - payment.failed
  - payment.refunded

  # Maintenance
  - maintenance.created
  - maintenance.updated
  - maintenance.completed

  # Leases
  - lease.created
  - lease.signed
  - lease.expiring_soon
  - lease.expired

  # Tenants
  - tenant.created
  - tenant.application_submitted
  - tenant.screening_completed

  # Messages
  - message.received

# Webhook payload
{
  "id": "evt_123",
  "type": "payment.completed",
  "created": "2024-03-15T10:30:00Z",
  "data": {
    "object": {
      "id": "txn_456",
      "amount": 1500,
      "tenant_id": "ten_789",
      "lease_id": "lea_012"
    }
  }
}

# Signature verification
X-HappyTenant-Signature: sha256=xxx
```

---

## Error Codes

```typescript
const ErrorCodes = {
  // Client Errors (4xx)
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,           // Duplicate resource
  RATE_LIMITED: 429,

  // Business Logic Errors
  INSUFFICIENT_BALANCE: 400,
  LEASE_ALREADY_SIGNED: 400,
  TENANT_NOT_ELIGIBLE: 400,
  PAYMENT_DECLINED: 400,

  // Server Errors (5xx)
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  AI_SERVICE_ERROR: 502,
};
```
