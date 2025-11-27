'use client';

import { Building2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PropertyEditForm } from './PropertyEditForm';
import type { Property } from '@/types';

/**
 * PropertyEditDialog Component
 *
 * Dialog wrapper for the property edit form.
 * Opens from property details page and handles property updates.
 *
 * @param open - Whether the dialog is open
 * @param onOpenChange - Callback to change dialog open state
 * @param property - The property to edit
 * @param onPropertyUpdated - Callback function called after successful update
 */

interface PropertyEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
  onPropertyUpdated?: (property: Property) => void;
}

export function PropertyEditDialog({
  open,
  onOpenChange,
  property,
  onPropertyUpdated,
}: PropertyEditDialogProps) {
  const handleSuccess = (updatedProperty: Property) => {
    onPropertyUpdated?.(updatedProperty);
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
            <Building2 className="h-5 w-5 text-primary" />
            Edit Property
          </DialogTitle>
          <DialogDescription>
            Update the details for {property.name}. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <PropertyEditForm
          property={property}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
