'use client';

import { Home } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UnitForm } from './UnitForm';
import type { Unit } from '@/types';

/**
 * AddUnitDialog Component
 *
 * Dialog for adding a new unit to a property.
 * Triggered from property details page and uses UnitForm in add mode.
 *
 * @param open - Whether the dialog is open
 * @param onOpenChange - Callback to change dialog open state
 * @param propertyId - ID of the property to add the unit to
 * @param propertyName - Name of the property (for display)
 * @param onUnitAdded - Callback function called after successful unit creation
 */

interface AddUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyName?: string;
  onUnitAdded?: (unit: Unit) => void;
}

export function AddUnitDialog({
  open,
  onOpenChange,
  propertyId,
  propertyName,
  onUnitAdded,
}: AddUnitDialogProps) {
  const handleSuccess = (unit: Unit) => {
    onUnitAdded?.(unit);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Add New Unit
          </DialogTitle>
          <DialogDescription>
            {propertyName
              ? `Add a new unit to ${propertyName}.`
              : 'Create a new unit with all the necessary details.'}
          </DialogDescription>
        </DialogHeader>

        <UnitForm
          mode="add"
          propertyId={propertyId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
