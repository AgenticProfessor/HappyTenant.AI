-- ============================================================================
-- Happy Tenant - Row Level Security (RLS) Policies
-- ============================================================================
-- This migration enables RLS on all tables and creates policies for
-- multi-tenant data isolation based on organization membership.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper Function: Get current user's organization ID from auth
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT "organizationId"
  FROM public."User"
  WHERE "supabaseId" = auth.uid()::text
  LIMIT 1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;

-- ----------------------------------------------------------------------------
-- ORGANIZATION TABLE
-- Users can only see their own organization
-- ----------------------------------------------------------------------------
ALTER TABLE public."Organization" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organization"
  ON public."Organization"
  FOR SELECT
  USING (id = public.get_user_organization_id());

CREATE POLICY "Organization owners can update their organization"
  ON public."Organization"
  FOR UPDATE
  USING (id = public.get_user_organization_id());

-- ----------------------------------------------------------------------------
-- USER TABLE
-- Users can see other members of their organization
-- ----------------------------------------------------------------------------
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their organization"
  ON public."User"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can update their own profile"
  ON public."User"
  FOR UPDATE
  USING ("supabaseId" = auth.uid()::text);

CREATE POLICY "Allow user creation during onboarding"
  ON public."User"
  FOR INSERT
  WITH CHECK ("supabaseId" = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- PROPERTY TABLE
-- Organization-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public."Property" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view properties in their organization"
  ON public."Property"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can create properties in their organization"
  ON public."Property"
  FOR INSERT
  WITH CHECK ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can update properties in their organization"
  ON public."Property"
  FOR UPDATE
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can delete properties in their organization"
  ON public."Property"
  FOR DELETE
  USING ("organizationId" = public.get_user_organization_id());

-- ----------------------------------------------------------------------------
-- UNIT TABLE
-- Organization-scoped via Property
-- ----------------------------------------------------------------------------
ALTER TABLE public."Unit" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view units in their organization"
  ON public."Unit"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Property" p
      WHERE p.id = "propertyId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create units in their organization properties"
  ON public."Unit"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Property" p
      WHERE p.id = "propertyId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can update units in their organization"
  ON public."Unit"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."Property" p
      WHERE p.id = "propertyId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can delete units in their organization"
  ON public."Unit"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public."Property" p
      WHERE p.id = "propertyId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- TENANT TABLE
-- Organization-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public."Tenant" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tenants in their organization"
  ON public."Tenant"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can create tenants in their organization"
  ON public."Tenant"
  FOR INSERT
  WITH CHECK ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can update tenants in their organization"
  ON public."Tenant"
  FOR UPDATE
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can delete tenants in their organization"
  ON public."Tenant"
  FOR DELETE
  USING ("organizationId" = public.get_user_organization_id());

-- ----------------------------------------------------------------------------
-- LEASE TABLE
-- Organization-scoped via Unit -> Property
-- ----------------------------------------------------------------------------
ALTER TABLE public."Lease" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leases in their organization"
  ON public."Lease"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Unit" u
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE u.id = "unitId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create leases in their organization"
  ON public."Lease"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Unit" u
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE u.id = "unitId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can update leases in their organization"
  ON public."Lease"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."Unit" u
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE u.id = "unitId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can delete leases in their organization"
  ON public."Lease"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public."Unit" u
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE u.id = "unitId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- LEASETENANT TABLE (Junction table)
-- Organization-scoped via Tenant
-- ----------------------------------------------------------------------------
ALTER TABLE public."LeaseTenant" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lease-tenant relations in their organization"
  ON public."LeaseTenant"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create lease-tenant relations in their organization"
  ON public."LeaseTenant"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can delete lease-tenant relations in their organization"
  ON public."LeaseTenant"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- PAYMENT TABLE
-- Organization-scoped via Tenant
-- ----------------------------------------------------------------------------
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments in their organization"
  ON public."Payment"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create payments in their organization"
  ON public."Payment"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can update payments in their organization"
  ON public."Payment"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- CHARGE TABLE
-- Organization-scoped via Tenant
-- ----------------------------------------------------------------------------
ALTER TABLE public."Charge" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view charges in their organization"
  ON public."Charge"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create charges in their organization"
  ON public."Charge"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can update charges in their organization"
  ON public."Charge"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- VENDOR TABLE
-- Organization-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public."Vendor" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vendors in their organization"
  ON public."Vendor"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can create vendors in their organization"
  ON public."Vendor"
  FOR INSERT
  WITH CHECK ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can update vendors in their organization"
  ON public."Vendor"
  FOR UPDATE
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can delete vendors in their organization"
  ON public."Vendor"
  FOR DELETE
  USING ("organizationId" = public.get_user_organization_id());

-- ----------------------------------------------------------------------------
-- EXPENSE TABLE
-- Organization-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public."Expense" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses in their organization"
  ON public."Expense"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can create expenses in their organization"
  ON public."Expense"
  FOR INSERT
  WITH CHECK ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can update expenses in their organization"
  ON public."Expense"
  FOR UPDATE
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can delete expenses in their organization"
  ON public."Expense"
  FOR DELETE
  USING ("organizationId" = public.get_user_organization_id());

-- ----------------------------------------------------------------------------
-- MAINTENANCEREQUEST TABLE
-- Organization-scoped via Unit -> Property
-- ----------------------------------------------------------------------------
ALTER TABLE public."MaintenanceRequest" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view maintenance requests in their organization"
  ON public."MaintenanceRequest"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Unit" u
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE u.id = "unitId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create maintenance requests in their organization"
  ON public."MaintenanceRequest"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Unit" u
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE u.id = "unitId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can update maintenance requests in their organization"
  ON public."MaintenanceRequest"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."Unit" u
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE u.id = "unitId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- MAINTENANCECOMMENT TABLE
-- Organization-scoped via MaintenanceRequest -> Unit -> Property
-- ----------------------------------------------------------------------------
ALTER TABLE public."MaintenanceComment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view maintenance comments in their organization"
  ON public."MaintenanceComment"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."MaintenanceRequest" mr
      JOIN public."Unit" u ON u.id = mr."unitId"
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE mr.id = "requestId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create maintenance comments in their organization"
  ON public."MaintenanceComment"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."MaintenanceRequest" mr
      JOIN public."Unit" u ON u.id = mr."unitId"
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE mr.id = "requestId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- DOCUMENT TABLE
-- Organization-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public."Document" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their organization"
  ON public."Document"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can create documents in their organization"
  ON public."Document"
  FOR INSERT
  WITH CHECK ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can update documents in their organization"
  ON public."Document"
  FOR UPDATE
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can delete documents in their organization"
  ON public."Document"
  FOR DELETE
  USING ("organizationId" = public.get_user_organization_id());

-- ----------------------------------------------------------------------------
-- CONVERSATION TABLE
-- Organization-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public."Conversation" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations in their organization"
  ON public."Conversation"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can create conversations in their organization"
  ON public."Conversation"
  FOR INSERT
  WITH CHECK ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can update conversations in their organization"
  ON public."Conversation"
  FOR UPDATE
  USING ("organizationId" = public.get_user_organization_id());

-- ----------------------------------------------------------------------------
-- MESSAGE TABLE
-- Organization-scoped via Conversation
-- ----------------------------------------------------------------------------
ALTER TABLE public."Message" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their organization"
  ON public."Message"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Conversation" c
      WHERE c.id = "conversationId"
      AND c."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create messages in their organization"
  ON public."Message"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Conversation" c
      WHERE c.id = "conversationId"
      AND c."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- CONVERSATIONPARTICIPANT TABLE
-- Organization-scoped via Conversation
-- ----------------------------------------------------------------------------
ALTER TABLE public."ConversationParticipant" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversation participants in their organization"
  ON public."ConversationParticipant"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Conversation" c
      WHERE c.id = "conversationId"
      AND c."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can manage conversation participants in their organization"
  ON public."ConversationParticipant"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."Conversation" c
      WHERE c.id = "conversationId"
      AND c."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- NOTIFICATION TABLE
-- User-specific (only see your own notifications)
-- ----------------------------------------------------------------------------
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public."Notification"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."User" u
      WHERE u.id = "userId"
      AND u."supabaseId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own notifications"
  ON public."Notification"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."User" u
      WHERE u.id = "userId"
      AND u."supabaseId" = auth.uid()::text
    )
  );

-- ----------------------------------------------------------------------------
-- ACTIVITYLOG TABLE
-- Organization-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public."ActivityLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity logs in their organization"
  ON public."ActivityLog"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can create activity logs in their organization"
  ON public."ActivityLog"
  FOR INSERT
  WITH CHECK ("organizationId" = public.get_user_organization_id());

-- ----------------------------------------------------------------------------
-- SCREENINGREQUEST TABLE
-- Organization-scoped via Tenant
-- ----------------------------------------------------------------------------
ALTER TABLE public."ScreeningRequest" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view screening requests in their organization"
  ON public."ScreeningRequest"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create screening requests in their organization"
  ON public."ScreeningRequest"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can update screening requests in their organization"
  ON public."ScreeningRequest"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."Tenant" t
      WHERE t.id = "tenantId"
      AND t."organizationId" = public.get_user_organization_id()
    )
  );

-- ----------------------------------------------------------------------------
-- APPLICATION TABLE
-- Organization-scoped via Unit -> Property
-- ----------------------------------------------------------------------------
ALTER TABLE public."Application" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view applications in their organization"
  ON public."Application"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Unit" u
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE u.id = "unitId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can update applications in their organization"
  ON public."Application"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."Unit" u
      JOIN public."Property" p ON p.id = u."propertyId"
      WHERE u.id = "unitId"
      AND p."organizationId" = public.get_user_organization_id()
    )
  );

-- Allow public application submissions (no auth required for INSERT)
CREATE POLICY "Anyone can submit applications"
  ON public."Application"
  FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- LEASETEMPLATE TABLE
-- Organization-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public."LeaseTemplate" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lease templates in their organization"
  ON public."LeaseTemplate"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can create lease templates in their organization"
  ON public."LeaseTemplate"
  FOR INSERT
  WITH CHECK ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can update lease templates in their organization"
  ON public."LeaseTemplate"
  FOR UPDATE
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can delete lease templates in their organization"
  ON public."LeaseTemplate"
  FOR DELETE
  USING ("organizationId" = public.get_user_organization_id());

-- ----------------------------------------------------------------------------
-- REMINDER TABLE
-- User-specific or organization-wide
-- ----------------------------------------------------------------------------
ALTER TABLE public."Reminder" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminders in their organization"
  ON public."Reminder"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."User" u
      WHERE u.id = "userId"
      AND u."organizationId" = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can create their own reminders"
  ON public."Reminder"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."User" u
      WHERE u.id = "userId"
      AND u."supabaseId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own reminders"
  ON public."Reminder"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."User" u
      WHERE u.id = "userId"
      AND u."supabaseId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own reminders"
  ON public."Reminder"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public."User" u
      WHERE u.id = "userId"
      AND u."supabaseId" = auth.uid()::text
    )
  );

-- ----------------------------------------------------------------------------
-- CUSTOMFIELD TABLE
-- Organization-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public."CustomField" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view custom fields in their organization"
  ON public."CustomField"
  FOR SELECT
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can create custom fields in their organization"
  ON public."CustomField"
  FOR INSERT
  WITH CHECK ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can update custom fields in their organization"
  ON public."CustomField"
  FOR UPDATE
  USING ("organizationId" = public.get_user_organization_id());

CREATE POLICY "Users can delete custom fields in their organization"
  ON public."CustomField"
  FOR DELETE
  USING ("organizationId" = public.get_user_organization_id());

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================
-- To apply: Run this SQL in Supabase Dashboard > SQL Editor
-- Or use: supabase db push (if using Supabase CLI)
-- ============================================================================
