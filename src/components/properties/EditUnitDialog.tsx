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
 * EditUnitDialog Component
 *
 * Dialog for editing an existing unit.
 * Uses UnitForm in edit mode with pre-populated data.
 *
 * @param open - Whether the dialog is open
 * @param onOpenChange - Callback to change dialog open state
 * @param unit - The unit to edit
 * @param onUnitUpdated - Callback function called after successful update
 */

interface EditUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unit;
  onUnitUpdated?: (unit: Unit) => void;
}

export function EditUnitDialog({
  open,
  onOpenChange,
  unit,
  onUnitUpdated,
}: EditUnitDialogProps) {
  const handleSuccess = (updatedUnit: Unit) => {
    onUnitUpdated?.(updatedUnit);
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
            Edit Unit
          </DialogTitle>
          <DialogDescription>
            Update the details for {unit.unitNumber}
            {unit.name && ` (${unit.name})`}. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <UnitForm
          mode="edit"
          propertyId={unit.propertyId}
          unit={unit}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
