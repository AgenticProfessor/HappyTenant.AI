# Supabase Setup for Happy Tenant

## Overview

This directory contains Supabase configuration and migrations for Row Level Security (RLS) policies.

## Applying RLS Policies

### Option 1: Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/20241201_rls_policies.sql`
4. Paste and run the SQL

### Option 2: Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

## RLS Policy Overview

The RLS policies implement multi-tenant data isolation:

| Table | Scope | Description |
|-------|-------|-------------|
| Organization | Self | Users see only their own organization |
| User | Organization | See members of same organization |
| Property | Organization | Direct organizationId check |
| Unit | Via Property | Join to Property for org check |
| Tenant | Organization | Direct organizationId check |
| Lease | Via Unit→Property | Two-level join for org check |
| Payment | Via Tenant | Tenant's organizationId check |
| Charge | Via Tenant | Tenant's organizationId check |
| Vendor | Organization | Direct organizationId check |
| Expense | Organization | Direct organizationId check |
| Document | Organization | Direct organizationId check |
| Application | Via Unit→Property | Public insert allowed |

## Helper Function

The `get_user_organization_id()` function:
- Looks up the current authenticated user via `auth.uid()`
- Returns their `organizationId` from the User table
- Used by all policies for consistent org scoping

## Troubleshooting

### "permission denied for table X"
- Ensure RLS is enabled and policies are created
- Check that the user has a corresponding row in the User table with `supabaseId` set

### Queries returning empty results
- Verify the user's `supabaseId` matches their Supabase Auth ID
- Check that data has the correct `organizationId`

### New users can't access data
- Users must complete onboarding (creates User record with `supabaseId`)
- The onboarding flow handles Organization + User creation
