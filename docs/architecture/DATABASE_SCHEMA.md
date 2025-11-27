# Happy Tenant - Database Schema Design

## Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Organization │────<│   User      │>────│   Role      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  Property   │────<│  Tenant     │
└─────────────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│    Unit     │────<│   Lease     │
└─────────────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│ Maintenance │     │  Payment    │
│   Request   │     │ Transaction │
└─────────────┘     └─────────────┘
```

---

## Core Domain Models

### 1. Organization & Users

```sql
-- Organizations (for multi-tenancy)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('individual', 'company')),

    -- Subscription & Billing
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    stripe_customer_id VARCHAR(255),

    -- Settings
    settings JSONB DEFAULT '{}',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Auth (if using external auth, this links to provider)
    external_auth_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMPTZ,
    phone VARCHAR(50),
    phone_verified_at TIMESTAMPTZ,

    -- Profile
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,

    -- Preferences
    preferences JSONB DEFAULT '{
        "notifications": {
            "email": true,
            "sms": true,
            "push": true
        },
        "timezone": "America/New_York",
        "language": "en"
    }',

    -- Metadata
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Organization Memberships (many-to-many with roles)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),

    -- Permissions override (if needed beyond role)
    permissions JSONB DEFAULT '{}',

    -- Status
    status VARCHAR(50) DEFAULT 'active',
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, user_id)
);
```

### 2. Properties & Units

```sql
-- Properties (buildings/addresses)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),

    -- Basic Info
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'single_family', 'multi_family', 'apartment', 'condo',
        'townhouse', 'commercial', 'mixed_use'
    )),

    -- Address
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'US',

    -- Geocoding (for map features)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Property Details
    year_built INTEGER,
    square_feet INTEGER,
    lot_size DECIMAL(10, 2),
    parking_spaces INTEGER DEFAULT 0,

    -- Financials
    purchase_price DECIMAL(12, 2),
    purchase_date DATE,
    current_value DECIMAL(12, 2),

    -- Media
    photos JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold')),

    -- AI-Enhanced Fields
    ai_description TEXT,
    ai_market_analysis JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Units (individual rentable spaces)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),

    -- Identification
    unit_number VARCHAR(50) NOT NULL,
    name VARCHAR(255),

    -- Details
    bedrooms DECIMAL(3, 1) DEFAULT 0,  -- Allows for studio (0) and half rooms
    bathrooms DECIMAL(3, 1) DEFAULT 1,
    square_feet INTEGER,
    floor_number INTEGER,

    -- Features
    features JSONB DEFAULT '[]',  -- ['washer_dryer', 'dishwasher', 'parking', ...]
    amenities JSONB DEFAULT '[]',

    -- Rental Info
    market_rent DECIMAL(10, 2),
    deposit_amount DECIMAL(10, 2),

    -- Status
    status VARCHAR(50) DEFAULT 'vacant' CHECK (status IN (
        'vacant', 'occupied', 'notice_given', 'maintenance', 'off_market'
    )),
    available_date DATE,

    -- Listing
    is_listed BOOLEAN DEFAULT FALSE,
    listing_description TEXT,
    listing_photos JSONB DEFAULT '[]',

    -- AI-Enhanced Fields
    ai_listing_description TEXT,
    ai_rent_recommendation DECIMAL(10, 2),
    ai_rent_analysis JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    UNIQUE(property_id, unit_number)
);
```

### 3. Tenants & Leases

```sql
-- Tenants (prospective and current)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),  -- Links to user account if they have one

    -- Contact Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),

    -- Screening Info
    date_of_birth DATE,
    ssn_encrypted BYTEA,  -- Encrypted SSN for screening

    -- Background Check Results (encrypted/sensitive)
    screening_status VARCHAR(50) CHECK (screening_status IN (
        'not_started', 'pending', 'passed', 'failed', 'review_needed'
    )),
    screening_results JSONB,
    screening_completed_at TIMESTAMPTZ,

    -- Employment
    employer_name VARCHAR(255),
    employer_phone VARCHAR(50),
    monthly_income DECIMAL(10, 2),
    employment_verified BOOLEAN DEFAULT FALSE,

    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(100),

    -- Documents
    documents JSONB DEFAULT '[]',

    -- AI Insights
    ai_risk_score DECIMAL(5, 2),
    ai_risk_factors JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Leases
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id),

    -- Lease Terms
    lease_type VARCHAR(50) NOT NULL CHECK (lease_type IN (
        'fixed', 'month_to_month', 'week_to_week'
    )),
    start_date DATE NOT NULL,
    end_date DATE,

    -- Rent
    rent_amount DECIMAL(10, 2) NOT NULL,
    rent_due_day INTEGER DEFAULT 1 CHECK (rent_due_day BETWEEN 1 AND 28),

    -- Deposits
    security_deposit DECIMAL(10, 2),
    pet_deposit DECIMAL(10, 2),
    other_deposits JSONB DEFAULT '{}',

    -- Fees
    late_fee_amount DECIMAL(10, 2),
    late_fee_grace_days INTEGER DEFAULT 5,

    -- Terms
    terms JSONB DEFAULT '{}',  -- Custom lease terms
    rules JSONB DEFAULT '[]',  -- Property rules

    -- Documents
    lease_document_url TEXT,
    signed_document_url TEXT,
    addendums JSONB DEFAULT '[]',

    -- Signatures
    landlord_signed_at TIMESTAMPTZ,
    tenant_signed_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_signature', 'active', 'expired',
        'terminated', 'renewed'
    )),

    -- Renewal
    auto_renew BOOLEAN DEFAULT FALSE,
    renewal_terms JSONB,
    renewal_notice_days INTEGER DEFAULT 30,

    -- Move-out
    move_out_date DATE,
    move_out_reason VARCHAR(255),
    move_out_inspection JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Lease Tenants (many-to-many - multiple tenants per lease)
CREATE TABLE lease_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    is_primary BOOLEAN DEFAULT FALSE,
    relationship VARCHAR(100),  -- 'primary', 'spouse', 'roommate', 'dependent'

    -- Signature tracking
    signed_at TIMESTAMPTZ,
    signature_ip VARCHAR(45),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(lease_id, tenant_id)
);
```

### 4. Financial Transactions

```sql
-- Payment Methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    type VARCHAR(50) NOT NULL CHECK (type IN ('bank_account', 'card', 'cash', 'check')),

    -- Stripe/Plaid References
    stripe_payment_method_id VARCHAR(255),
    plaid_account_id VARCHAR(255),

    -- Display Info (masked)
    last_four VARCHAR(4),
    bank_name VARCHAR(255),
    account_type VARCHAR(50),

    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Transactions (all money movement)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    lease_id UUID REFERENCES leases(id),
    tenant_id UUID REFERENCES tenants(id),

    -- Transaction Details
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'rent', 'deposit', 'late_fee', 'utility', 'maintenance',
        'refund', 'other_income', 'expense'
    )),
    category VARCHAR(100),
    description TEXT,

    -- Amounts
    amount DECIMAL(12, 2) NOT NULL,
    fee_amount DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(12, 2),

    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    )),

    -- Payment Info
    payment_method_id UUID REFERENCES payment_methods(id),
    payment_processor VARCHAR(50),  -- 'stripe', 'plaid', 'manual'
    processor_transaction_id VARCHAR(255),

    -- Dates
    due_date DATE,
    paid_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Charges
CREATE TABLE recurring_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id),

    type VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,

    frequency VARCHAR(50) NOT NULL CHECK (frequency IN (
        'monthly', 'quarterly', 'annually', 'one_time'
    )),
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 28),

    start_date DATE NOT NULL,
    end_date DATE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Maintenance & Work Orders

```sql
-- Maintenance Requests
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id),
    tenant_id UUID REFERENCES tenants(id),
    reported_by_user_id UUID REFERENCES users(id),

    -- Request Details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'plumbing', 'electrical', 'hvac', 'appliance', 'structural',
        'pest_control', 'landscaping', 'cleaning', 'other'
    )),

    -- Priority & Urgency
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN (
        'emergency', 'high', 'medium', 'low'
    )),
    is_emergency BOOLEAN DEFAULT FALSE,

    -- Media
    photos JSONB DEFAULT '[]',
    videos JSONB DEFAULT '[]',

    -- Status Tracking
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'acknowledged', 'scheduled', 'in_progress',
        'pending_parts', 'completed', 'cancelled'
    )),

    -- Assignment
    assigned_to_user_id UUID REFERENCES users(id),
    assigned_to_vendor_id UUID,  -- References vendors table

    -- Scheduling
    scheduled_date DATE,
    scheduled_time_start TIME,
    scheduled_time_end TIME,

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    resolution_photos JSONB DEFAULT '[]',

    -- Tenant Satisfaction
    tenant_rating INTEGER CHECK (tenant_rating BETWEEN 1 AND 5),
    tenant_feedback TEXT,

    -- Costs
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),

    -- AI Fields
    ai_category_suggestion VARCHAR(100),
    ai_priority_suggestion VARCHAR(50),
    ai_similar_issues JSONB,

    -- Entry Permission
    entry_permission_granted BOOLEAN,
    entry_instructions TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),

    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),

    -- Service Types
    categories JSONB DEFAULT '[]',

    -- Address
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),

    -- Business Details
    license_number VARCHAR(100),
    insurance_expiry DATE,

    -- Ratings
    rating DECIMAL(3, 2),
    total_jobs INTEGER DEFAULT 0,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Communication

```sql
-- Conversations (threads)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),

    -- Participants
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'landlord_tenant', 'internal', 'ai_assistant', 'support'
    )),

    -- Context (what is this conversation about?)
    context_type VARCHAR(50),  -- 'maintenance', 'lease', 'payment', 'general'
    context_id UUID,

    -- Status
    status VARCHAR(50) DEFAULT 'active',
    is_archived BOOLEAN DEFAULT FALSE,

    -- Last Activity
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID REFERENCES users(id),
    tenant_id UUID REFERENCES tenants(id),

    -- Type
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'participant', 'ai_agent')),

    -- Status
    unread_count INTEGER DEFAULT 0,
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(conversation_id, user_id),
    UNIQUE(conversation_id, tenant_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),

    -- Sender
    sender_user_id UUID REFERENCES users(id),
    sender_tenant_id UUID REFERENCES tenants(id),
    is_ai_generated BOOLEAN DEFAULT FALSE,

    -- Content
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN (
        'text', 'image', 'file', 'system', 'ai_suggestion'
    )),

    -- Attachments
    attachments JSONB DEFAULT '[]',

    -- AI Analysis
    ai_sentiment VARCHAR(50),
    ai_intent JSONB,
    ai_suggested_response TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Delivery
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,

    -- SMS/Email Integration
    external_message_id VARCHAR(255),
    channel VARCHAR(50) DEFAULT 'in_app' CHECK (channel IN (
        'in_app', 'sms', 'email', 'whatsapp'
    )),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    tenant_id UUID REFERENCES tenants(id),

    -- Content
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,

    -- Link
    action_url TEXT,
    action_type VARCHAR(50),

    -- Channels
    channels JSONB DEFAULT '["push"]',  -- ['push', 'email', 'sms']

    -- Status
    read_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. AI & Automation

```sql
-- AI Agent Sessions
CREATE TABLE ai_agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),

    -- Agent Type
    agent_type VARCHAR(100) NOT NULL CHECK (agent_type IN (
        'tenant_communication', 'maintenance_triage', 'rent_collection',
        'listing_optimization', 'document_analysis', 'financial_insights'
    )),

    -- Context
    context_type VARCHAR(50),
    context_id UUID,

    -- Session Data
    input_data JSONB,
    output_data JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN (
        'running', 'completed', 'failed', 'cancelled'
    )),

    -- Metrics
    tokens_used INTEGER,
    latency_ms INTEGER,

    -- Error Handling
    error_message TEXT,

    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- AI Suggestions Log
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),

    -- What type of suggestion
    type VARCHAR(100) NOT NULL,

    -- Context
    context_type VARCHAR(50),
    context_id UUID,

    -- The Suggestion
    suggestion_text TEXT NOT NULL,
    suggestion_data JSONB,
    confidence_score DECIMAL(5, 4),

    -- User Response
    was_accepted BOOLEAN,
    was_modified BOOLEAN,
    user_feedback TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation Rules
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),

    -- Rule Definition
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Trigger
    trigger_type VARCHAR(100) NOT NULL,
    trigger_conditions JSONB NOT NULL,

    -- Actions
    actions JSONB NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Execution Tracking
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. Analytics & Audit

```sql
-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),

    -- Action
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,

    -- Change Data
    old_values JSONB,
    new_values JSONB,

    -- Request Context
    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),

    -- Event
    event_name VARCHAR(100) NOT NULL,
    event_properties JSONB DEFAULT '{}',

    -- Session
    session_id VARCHAR(255),

    -- Context
    page_url TEXT,
    referrer TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Performance Snapshots (for historical tracking)
CREATE TABLE property_performance_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),

    -- Time Period
    snapshot_date DATE NOT NULL,
    period_type VARCHAR(50) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),

    -- Metrics
    total_units INTEGER,
    occupied_units INTEGER,
    vacancy_rate DECIMAL(5, 2),

    total_rent_expected DECIMAL(12, 2),
    total_rent_collected DECIMAL(12, 2),
    collection_rate DECIMAL(5, 2),

    maintenance_requests_open INTEGER,
    maintenance_requests_completed INTEGER,
    avg_maintenance_resolution_days DECIMAL(5, 2),

    -- AI Predictions
    predicted_vacancy_rate DECIMAL(5, 2),
    predicted_collection_rate DECIMAL(5, 2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(property_id, snapshot_date, period_type)
);
```

---

## Indexes

```sql
-- Performance Indexes
CREATE INDEX idx_properties_org ON properties(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_units_property ON units(property_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_units_status ON units(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leases_unit ON leases(unit_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leases_status ON leases(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_org ON tenants(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_org ON transactions(organization_id);
CREATE INDEX idx_transactions_lease ON transactions(lease_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_maintenance_unit ON maintenance_requests(unit_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_notifications_user ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Full Text Search
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('english', name || ' ' || address_line1 || ' ' || city));
CREATE INDEX idx_tenants_search ON tenants USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || email));

-- GeoSpatial (for property maps)
CREATE INDEX idx_properties_location ON properties USING gist(point(longitude, latitude));
```

---

## Row Level Security (Multi-tenancy)

```sql
-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Example Policy
CREATE POLICY org_isolation ON properties
    USING (organization_id = current_setting('app.current_organization_id')::uuid);
```

---

## Key Design Decisions

1. **UUID Primary Keys**: Enables distributed systems, prevents ID enumeration attacks
2. **Soft Deletes**: `deleted_at` columns for audit trails and recovery
3. **JSONB for Flexibility**: Settings, metadata, and variable structures
4. **Encrypted Sensitive Data**: SSN stored encrypted, not plain text
5. **Audit Trail**: Comprehensive logging for compliance (Fair Housing, etc.)
6. **AI-Ready Fields**: Pre-planned columns for AI insights and suggestions
7. **Multi-tenancy**: Organization-based isolation with RLS
