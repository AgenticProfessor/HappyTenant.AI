'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

import {
  unitSchema,
  type UnitFormValues,
  unitStatuses,
  unitAmenities,
  amenityLabels,
  defaultUnitValues,
} from '@/lib/schemas/unit';
import type { Unit } from '@/types';

/**
 * UnitForm Component
 *
 * A comprehensive form for adding or editing unit details.
 * Supports two modes: 'add' for creating new units and 'edit' for updating existing units.
 * Includes full validation, error handling, currency formatting, and amenities selection.
 *
 * @param mode - Form mode: 'add' or 'edit'
 * @param propertyId - ID of the property this unit belongs to
 * @param unit - The unit to edit (required in edit mode)
 * @param onSuccess - Callback function called after successful save
 * @param onCancel - Callback function called when cancel is clicked
 */

interface UnitFormProps {
  mode: 'add' | 'edit';
  propertyId: string;
  unit?: Unit;
  onSuccess?: (unit: Unit) => void;
  onCancel?: () => void;
}

// Unit status labels for display
const unitStatusLabels: Record<typeof unitStatuses[number], string> = {
  VACANT: 'Vacant',
  OCCUPIED: 'Occupied',
  NOTICE_GIVEN: 'Notice Given',
  UNDER_APPLICATION: 'Under Application',
  MAINTENANCE: 'Under Maintenance',
  OFF_MARKET: 'Off Market',
};

// Format currency for display
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function UnitForm({ mode, propertyId, unit, onSuccess, onCancel }: UnitFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with unit data or default values
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: unit
      ? {
          unitNumber: unit.unitNumber,
          name: unit.name || '',
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          squareFeet: unit.squareFeet || 0,
          floorNumber: unit.floorNumber || 0,
          marketRent: unit.marketRent,
          depositAmount: unit.depositAmount || 0,
          status: unit.status,
          features: unit.features || [],
          isListed: unit.isListed,
          listingDescription: unit.listingDescription || '',
        }
      : {
          ...defaultUnitValues,
          marketRent: 0,
        },
  });

  const watchedFeatures = form.watch('features');

  const onSubmit = async (data: UnitFormValues) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create unit object
      const unitData: Unit = mode === 'edit' && unit
        ? {
            ...unit,
            ...data,
          }
        : {
            id: `unit-${Date.now()}`,
            propertyId,
            unitNumber: data.unitNumber,
            name: data.name,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            squareFeet: data.squareFeet,
            floorNumber: data.floorNumber,
            features: data.features,
            marketRent: data.marketRent,
            depositAmount: data.depositAmount || data.marketRent,
            status: data.status,
            availableDate: data.status === 'VACANT' ? new Date() : undefined,
            isListed: data.isListed,
            listingDescription: data.listingDescription,
            listingPhotos: [],
          };

      const successMessage = mode === 'add'
        ? 'Unit added successfully'
        : 'Unit updated successfully';

      const description = mode === 'add'
        ? `Unit ${data.unitNumber} has been added.`
        : `Unit ${data.unitNumber} has been updated.`;

      toast.success(successMessage, { description });

      onSuccess?.(unitData);
    } catch (error) {
      const errorMessage = mode === 'add'
        ? 'Failed to add unit'
        : 'Failed to update unit';

      toast.error(errorMessage, {
        description: 'Please try again later.',
      });
      console.error('Error saving unit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmenityToggle = (amenity: string, checked: boolean) => {
    const currentFeatures = form.getValues('features');
    const newFeatures = checked
      ? [...currentFeatures, amenity]
      : currentFeatures.filter((f) => f !== amenity);
    form.setValue('features', newFeatures);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Unit Number */}
        <FormField
          control={form.control}
          name="unitNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Number / Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 101, Unit A, Apt 2B" {...field} />
              </FormControl>
              <FormDescription>
                The unique identifier for this unit
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Optional Display Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Corner Suite, Garden Unit" {...field} />
              </FormControl>
              <FormDescription>
                A friendly name for marketing purposes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bedrooms and Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                  />
                </FormControl>
                <FormDescription>
                  Use 0.5 increments (e.g., 1.5, 2.5)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Square Feet and Floor Number */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="squareFeet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Feet (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="850"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="floorNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rent Amount and Deposit */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="marketRent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rent</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="1500"
                      className="pl-7"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  {(field.value ?? 0) > 0 && formatCurrency(field.value ?? 0)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="depositAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Deposit (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="1500"
                      className="pl-7"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  {(field.value ?? 0) > 0 && formatCurrency(field.value ?? 0)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {unitStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {unitStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amenities */}
        <FormItem>
          <FormLabel>Amenities & Features</FormLabel>
          <FormDescription>
            Select all amenities that apply to this unit
          </FormDescription>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {unitAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={watchedFeatures.includes(amenity)}
                  onCheckedChange={(checked) => handleAmenityToggle(amenity, checked as boolean)}
                />
                <label
                  htmlFor={amenity}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {amenityLabels[amenity]}
                </label>
              </div>
            ))}
          </div>
        </FormItem>

        {/* Listing Description */}
        <FormField
          control={form.control}
          name="listingDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the unit for potential tenants..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This description will be shown to prospective tenants
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'add' ? 'Add Unit' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
