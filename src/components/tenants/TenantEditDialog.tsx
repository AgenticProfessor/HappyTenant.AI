'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TenantEditForm } from './TenantEditForm';
import { UserPen } from 'lucide-react';
import type { TenantFormData } from '@/lib/schemas/tenant';

interface TenantEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    notes?: string;
    employerName?: string;
    monthlyIncome?: number;
  };
  onSave: (data: TenantFormData) => void | Promise<void>;
}

/**
 * TenantEditDialog component
 *
 * A dialog wrapper for the TenantEditForm component.
 * Opens from tenant details or list pages to edit tenant information.
 *
 * Features:
 * - Modal dialog interface
 * - Responsive layout
 * - Automatically closes on successful save
 * - Passes tenant data to form
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <TenantEditDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   tenant={selectedTenant}
 *   onSave={async (data) => {
 *     await updateTenant(tenant.id, data);
 *     setIsOpen(false);
 *   }}
 * />
 * ```
 */
export function TenantEditDialog({
  open,
  onOpenChange,
  tenant,
  onSave,
}: TenantEditDialogProps) {
  const handleSave = async (data: TenantFormData) => {
    await onSave(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPen className="h-5 w-5 text-primary" />
            Edit Tenant Information
          </DialogTitle>
          <DialogDescription>
            Update {tenant.firstName} {tenant.lastName}'s information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <TenantEditForm tenant={tenant} onSave={handleSave} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}
