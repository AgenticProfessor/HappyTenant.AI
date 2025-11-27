'use client';

/**
 * FormsDemo Component
 *
 * This component demonstrates all the form components in the Happy Tenant application.
 * Use this as a reference for implementing forms in your own pages.
 *
 * NOTE: This is a demo/example component and should not be used in production.
 * Import the individual components as needed in your actual pages.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenantEditDialog } from '@/components/tenants';
import { CreateLeaseDialog } from '@/components/leases';
import { MaintenanceRequestForm } from '@/components/tenant';
import type { TenantFormData } from '@/lib/schemas/tenant';
import type { LeaseFormData } from '@/lib/schemas/lease';
import type { MaintenanceRequestFormData } from '@/lib/schemas/maintenance';
import { toast } from 'sonner';

/**
 * Example/Demo Component - Shows all forms in action
 */
export function FormsDemo() {
  // State for dialog visibility
  const [isTenantEditOpen, setIsTenantEditOpen] = useState(false);
  const [isCreateLeaseOpen, setIsCreateLeaseOpen] = useState(false);

  // Mock data for demonstration
  const mockTenant = {
    id: 'tenant-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(512) 555-1234',
    emergencyContactName: 'Jane Smith',
    emergencyContactPhone: '(512) 555-5678',
    emergencyContactRelationship: 'Spouse',
    employerName: 'Acme Corporation',
    monthlyIncome: 5000,
    notes: 'Excellent tenant, always pays on time.',
  };

  const mockTenants = [
    {
      id: 'tenant-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
    },
    {
      id: 'tenant-2',
      firstName: 'Lisa',
      lastName: 'Wong',
      email: 'lisa.wong@email.com',
    },
  ];

  const mockUnits = [
    {
      id: 'unit-1',
      unitNumber: '101',
      name: 'Unit 101',
      propertyId: 'prop-1',
      marketRent: 1800,
    },
    {
      id: 'unit-2',
      unitNumber: '102',
      name: 'Unit 102',
      propertyId: 'prop-1',
      marketRent: 1400,
    },
  ];

  // Form handlers (mock implementations)
  const handleTenantUpdate = async (data: TenantFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Tenant updated:', data);
    toast.success('Tenant updated successfully!');
  };

  const handleLeaseCreate = async (data: LeaseFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Lease created:', data);
    toast.success('Lease created successfully!');
  };

  const handleMaintenanceRequest = async (data: MaintenanceRequestFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Maintenance request submitted:', data);
    // Form component shows its own toast
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Forms Demo</h1>
        <p className="mt-2 text-muted-foreground">
          Demonstration of all form components in the Happy Tenant application.
        </p>
      </div>

      <Tabs defaultValue="tenant" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tenant">Tenant Forms</TabsTrigger>
          <TabsTrigger value="lease">Lease Forms</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Forms</TabsTrigger>
        </TabsList>

        {/* Tenant Forms Tab */}
        <TabsContent value="tenant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Edit Dialog</CardTitle>
              <CardDescription>
                A dialog for editing tenant information. Opens in a modal overlay.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Current Tenant Data:</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(mockTenant, null, 2)}
                  </pre>
                </div>

                <Button onClick={() => setIsTenantEditOpen(true)}>
                  Open Tenant Edit Dialog
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>Features:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Basic information (name, email, phone)</li>
                    <li>Emergency contact details</li>
                    <li>Employment information</li>
                    <li>Internal notes</li>
                    <li>Full validation with error messages</li>
                    <li>Loading states and toast notifications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Edit Dialog */}
          <TenantEditDialog
            open={isTenantEditOpen}
            onOpenChange={setIsTenantEditOpen}
            tenant={mockTenant}
            onSave={handleTenantUpdate}
          />
        </TabsContent>

        {/* Lease Forms Tab */}
        <TabsContent value="lease" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Lease Dialog</CardTitle>
              <CardDescription>
                A comprehensive dialog for creating new lease agreements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-medium mb-2">Available Tenants:</h4>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(mockTenants, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-medium mb-2">Available Units:</h4>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(mockUnits, null, 2)}
                    </pre>
                  </div>
                </div>

                <Button onClick={() => setIsCreateLeaseOpen(true)}>
                  Open Create Lease Dialog
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>Features:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Tenant and unit selection</li>
                    <li>Lease type (fixed, month-to-month, week-to-week)</li>
                    <li>Date pickers for start/end dates</li>
                    <li>Financial terms (rent, deposits, late fees)</li>
                    <li>Custom terms and internal notes</li>
                    <li>Auto-fills rent based on unit selection</li>
                    <li>Validates date ranges (end after start, minimum 30 days)</li>
                    <li>Support for both create and edit modes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Lease Dialog */}
          <CreateLeaseDialog
            open={isCreateLeaseOpen}
            onOpenChange={setIsCreateLeaseOpen}
            tenants={mockTenants}
            units={mockUnits}
            onSuccess={handleLeaseCreate}
          />
        </TabsContent>

        {/* Maintenance Forms Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Request Form</CardTitle>
              <CardDescription>
                A form for tenants to submit maintenance requests with full details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Features:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Title and detailed description</li>
                    <li>Category selection (Plumbing, Electrical, HVAC, etc.)</li>
                    <li>Priority levels with visual indicators</li>
                    <li>Emergency request highlighting with warnings</li>
                    <li>Entry permission checkbox with instructions</li>
                    <li>Preferred contact method selection</li>
                    <li>Photo upload placeholder (ready for future implementation)</li>
                    <li>Comprehensive validation</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <MaintenanceRequestForm
                    unitId="unit-1"
                    tenantId="tenant-1"
                    onSubmit={handleMaintenanceRequest}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>
            How to use these forms in your own components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Import the components:</h4>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`import { TenantEditDialog } from '@/components/tenants';
import { CreateLeaseDialog } from '@/components/leases';
import { MaintenanceRequestForm } from '@/components/tenant';`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. Import the types:</h4>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`import type { TenantFormData } from '@/lib/schemas/tenant';
import type { LeaseFormData } from '@/lib/schemas/lease';
import type { MaintenanceRequestFormData } from '@/lib/schemas/maintenance';`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Use in your components:</h4>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`const [isOpen, setIsOpen] = useState(false);

<TenantEditDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  tenant={tenant}
  onSave={async (data) => {
    await updateTenant(tenant.id, data);
    refreshData();
  }}
/>`}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              📚 For complete documentation, see:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              <code>/docs/FORMS_DOCUMENTATION.md</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
