# Happy Tenant - System Architecture

## Core Philosophy
- **AI-First Design**: Every feature considers how AI can enhance or automate it
- **Mobile-First**: Landlords and tenants are often on the go
- **Simplicity Over Complexity**: Powerful features with intuitive UX
- **Scalable Architecture**: Built to handle growth from 1 to 100,000+ units

## Target Users
- **Individual Landlords**: Managing 1-50 units, need simplicity and automation
- **Property Management Companies**: Managing 50+ units, need scale, team features, and advanced reporting

---

## Technology Stack

### Backend (Hybrid Approach)
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Main API** | Node.js + TypeScript + Fastify | Primary REST/GraphQL API, fast and type-safe |
| **AI Services** | Python + FastAPI | AI agents, ML models, document processing |
| **Message Queue** | Redis + BullMQ | Job processing, AI task queues |
| **Real-time** | Socket.io | Live chat, notifications, status updates |

### Frontend
| Platform | Technology | Purpose |
|----------|------------|---------|
| **Web App** | Next.js 14+ (App Router) | SSR, SEO, fast loads |
| **Mobile** | React Native (Expo) | iOS/Android from shared codebase |
| **UI Library** | shadcn/ui + Tailwind | Consistent, accessible components |
| **State** | Zustand + TanStack Query | Simple state + server cache |

### Database Strategy
| Database | Purpose |
|----------|---------|
| **PostgreSQL** | Primary data store (users, properties, leases, transactions) |
| **Redis** | Caching, sessions, real-time pub/sub, job queues |
| **S3-Compatible** | Document storage (leases, photos, receipts) |
| **Pinecone/pgvector** | Vector DB for AI semantic search |

### Infrastructure (Vercel + Railway)
| Service | Platform | Purpose |
|---------|----------|---------|
| **Next.js App** | Vercel | Frontend + API routes for simple endpoints |
| **Node.js API** | Railway | Main backend API server |
| **Python AI Services** | Railway | AI agent microservices |
| **PostgreSQL** | Railway | Managed database |
| **Redis** | Railway/Upstash | Caching and queues |
| **File Storage** | Cloudflare R2 | S3-compatible, cost-effective |

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Web App    │  │  iOS App     │  │ Android App  │  │  Tenant      │    │
│  │  (Next.js)   │  │(React Native)│  │(React Native)│  │  Portal      │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────────┘
          │                 │                 │                 │
          └─────────────────┴────────┬────────┴─────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                           API GATEWAY                                        │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐  │
│  │                    Vercel Edge / API Routes                            │  │
│  │              (Auth, Rate Limiting, Request Routing)                    │  │
│  └─────────────────────────────────┬─────────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                          CORE SERVICES                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   Node.js API    │  │  Python AI Hub   │  │   Socket.io      │          │
│  │   (Fastify)      │  │   (FastAPI)      │  │   (Real-time)    │          │
│  │                  │  │                  │  │                  │          │
│  │ • Properties     │  │ • AI Agents      │  │ • Chat           │          │
│  │ • Tenants        │  │ • Doc Processing │  │ • Notifications  │          │
│  │ • Leases         │  │ • Smart Replies  │  │ • Live Updates   │          │
│  │ • Payments       │  │ • Analytics      │  │                  │          │
│  │ • Maintenance    │  │ • Predictions    │  │                  │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
└───────────┼─────────────────────┼─────────────────────┼─────────────────────┘
            │                     │                     │
┌───────────┴─────────────────────┴─────────────────────┴─────────────────────┐
│                           DATA LAYER                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   PostgreSQL     │  │     Redis        │  │  Cloudflare R2   │          │
│  │                  │  │                  │  │                  │          │
│  │ • Users/Auth     │  │ • Sessions       │  │ • Documents      │          │
│  │ • Properties     │  │ • Cache          │  │ • Photos         │          │
│  │ • Leases         │  │ • Job Queues     │  │ • Receipts       │          │
│  │ • Transactions   │  │ • Pub/Sub        │  │ • Exports        │          │
│  │ • Audit Logs     │  │ • Rate Limits    │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
│  ┌──────────────────┐                                                       │
│  │  Vector DB       │  (Pinecone or pgvector extension)                    │
│  │  • AI Embeddings │                                                       │
│  │  • Semantic Search│                                                      │
│  └──────────────────┘                                                       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │  Stripe    │ │  Plaid     │ │  Twilio    │ │  SendGrid  │ │  OpenAI/   │ │
│  │ (Payments) │ │ (Banking)  │ │ (SMS/Voice)│ │  (Email)   │ │  Anthropic │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │  TransUnion│ │  Zillow    │ │  DocuSign  │ │  Zapier    │               │
│  │ (Screening)│ │ (Listings) │ │ (E-Sign)   │ │ (Automate) │               │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Service Communication

### Sync Communication (REST/GraphQL)
- Client → API Gateway → Core Services
- Used for: CRUD operations, queries, immediate responses

### Async Communication (Message Queue)
- BullMQ on Redis for job processing
- Used for: AI processing, email/SMS sending, report generation, background tasks

### Real-time Communication (WebSocket)
- Socket.io for bidirectional communication
- Used for: Chat, notifications, live status updates

---

## Security Architecture

### Authentication & Authorization
- **Auth Provider**: Clerk or Auth.js (NextAuth)
- **Token Strategy**: JWT with refresh tokens
- **RBAC**: Role-based access control (Owner, Manager, Tenant, Viewer)

### Data Protection
- Encryption at rest (PostgreSQL, S3)
- TLS 1.3 in transit
- PII encryption for sensitive fields
- Audit logging for compliance

### Multi-tenancy
- Row-level security in PostgreSQL
- Organization-based data isolation
- API key scoping per organization

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers (easy horizontal scaling on Railway)
- Redis for session storage (shared state)
- Connection pooling for database

### Performance Optimization
- Edge caching via Vercel
- Redis caching for hot data
- Database read replicas (when needed)
- CDN for static assets

### Growth Path
| Stage | Units | Infrastructure |
|-------|-------|----------------|
| MVP | 1-1,000 | Single Railway instance + Vercel |
| Growth | 1,000-10,000 | Multiple Railway services, Redis cluster |
| Scale | 10,000-100,000 | Add read replicas, dedicated AI compute |
| Enterprise | 100,000+ | Kubernetes migration, multi-region |
