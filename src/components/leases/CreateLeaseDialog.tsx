'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LeaseForm } from './LeaseForm';
import { FileText } from 'lucide-react';
import type { LeaseFormData } from '@/lib/schemas/lease';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Unit {
  id: string;
  unitNumber: string;
  name?: string;
  propertyId: string;
  marketRent: number;
}

interface CreateLeaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenants: Tenant[];
  units: Unit[];
  preSelectedTenantId?: string;
  preSelectedUnitId?: string;
  onSuccess: (data: LeaseFormData) => void | Promise<void>;
}

/**
 * CreateLeaseDialog component
 *
 * A dialog for creating a new lease agreement.
 * Can be pre-populated with a selected tenant or unit.
 *
 * Features:
 * - Modal dialog interface
 * - Responsive layout
 * - Pre-selection support for tenant/unit
 * - Automatically closes on successful creation
 * - Success callback for parent components
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <CreateLeaseDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   tenants={availableTenants}
 *   units={vacantUnits}
 *   preSelectedTenantId={tenantId}
 *   onSuccess={async (data) => {
 *     await createLease(data);
 *     refreshLeases();
 *     setIsOpen(false);
 *   }}
 * />
 * ```
 */
export function CreateLeaseDialog({
  open,
  onOpenChange,
  tenants,
  units,
  preSelectedTenantId,
  preSelectedUnitId,
  onSuccess,
}: CreateLeaseDialogProps) {
  const handleSave = async (data: LeaseFormData) => {
    await onSuccess(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Get pre-selected tenant name for dialog description
  const preSelectedTenant = tenants.find((t) => t.id === preSelectedTenantId);
  const preSelectedUnit = units.find((u) => u.id === preSelectedUnitId);

  const getDescription = () => {
    if (preSelectedTenant && preSelectedUnit) {
      return `Creating a new lease for ${preSelectedTenant.firstName} ${preSelectedTenant.lastName} in ${preSelectedUnit.name || preSelectedUnit.unitNumber}.`;
    } else if (preSelectedTenant) {
      return `Creating a new lease for ${preSelectedTenant.firstName} ${preSelectedTenant.lastName}.`;
    } else if (preSelectedUnit) {
      return `Creating a new lease for ${preSelectedUnit.name || preSelectedUnit.unitNumber}.`;
    }
    return 'Create a new lease agreement for a tenant and unit.';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create New Lease
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <LeaseForm
          mode="create"
          tenants={tenants}
          units={units}
          preSelectedTenantId={preSelectedTenantId}
          preSelectedUnitId={preSelectedUnitId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
