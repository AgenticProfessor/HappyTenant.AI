'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Briefcase,
  Scale,
  Users,
  Building,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  Info,
  MapPin,
  FileText,
  Calendar,
  Mail,
  Phone,
  Hash,
  type LucideIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  CreateEntitySchema,
  type CreateEntityInput,
  type EntityType,
  type StateCode,
  US_STATES,
  getEntityTypeLabel,
} from '@/lib/schemas/entity';

interface CreateEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEntityInput) => Promise<void>;
  parentEntities?: { id: string; name: string; entityType: EntityType }[];
}

type EntityTypeOption = {
  value: EntityType;
  label: string;
  description: string;
  icon: LucideIcon;
  category: 'llc' | 'corporation' | 'partnership' | 'other';
};

const entityTypeOptions: EntityTypeOption[] = [
  {
    value: 'LLC',
    label: 'LLC',
    description: 'Standard Limited Liability Company',
    icon: Building2,
    category: 'llc',
  },
  {
    value: 'SERIES_LLC',
    label: 'Series LLC',
    description: 'LLC with separate series for asset protection',
    icon: Building2,
    category: 'llc',
  },
  {
    value: 'SERIES_LLC_CHILD',
    label: 'Series (Child)',
    description: 'Individual series under a Series LLC',
    icon: Building2,
    category: 'llc',
  },
  {
    value: 'S_CORP',
    label: 'S Corporation',
    description: 'Pass-through taxation corporation',
    icon: Briefcase,
    category: 'corporation',
  },
  {
    value: 'C_CORP',
    label: 'C Corporation',
    description: 'Standard corporation with double taxation',
    icon: Briefcase,
    category: 'corporation',
  },
  {
    value: 'LP',
    label: 'Limited Partnership',
    description: 'Partnership with limited partners',
    icon: Users,
    category: 'partnership',
  },
  {
    value: 'LLP',
    label: 'LLP',
    description: 'Limited Liability Partnership',
    icon: Users,
    category: 'partnership',
  },
  {
    value: 'TRUST',
    label: 'Trust',
    description: 'Asset protection or estate planning trust',
    icon: Scale,
    category: 'other',
  },
  {
    value: 'ESTATE',
    label: 'Estate',
    description: 'Estate holding entity',
    icon: Scale,
    category: 'other',
  },
  {
    value: 'INDIVIDUAL',
    label: 'Individual',
    description: 'Personal ownership (sole proprietor)',
    icon: User,
    category: 'other',
  },
];

function EntityTypeCard({
  option,
  selected,
  onSelect,
}: {
  option: EntityTypeOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
        'hover:shadow-md',
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border hover:border-primary/50'
      )}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <div className="size-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="size-3 text-primary-foreground" />
          </div>
        </motion.div>
      )}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            selected ? 'bg-primary/15' : 'bg-muted'
          )}
        >
          <Icon
            className={cn('size-5', selected ? 'text-primary' : 'text-muted-foreground')}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium', selected && 'text-primary')}>
            {option.label}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {option.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export function CreateEntityDialog({
  open,
  onOpenChange,
  onSubmit,
  parentEntities = [],
}: CreateEntityDialogProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateEntitySchema),
    defaultValues: {
      name: '',
      legalName: '' as string | null | undefined,
      entityType: 'LLC' as EntityType,
      parentEntityId: undefined as string | null | undefined,
      stateOfFormation: undefined as StateCode | null | undefined,
      dateFormed: undefined as Date | null | undefined,
      registeredAgent: '' as string | null | undefined,
      registeredAgentAddress: '' as string | null | undefined,
      ein: '' as string | null | undefined,
      addressLine1: '' as string | null | undefined,
      addressLine2: '' as string | null | undefined,
      city: '' as string | null | undefined,
      state: '' as string | null | undefined,
      postalCode: '' as string | null | undefined,
      country: 'USA',
      phone: '' as string | null | undefined,
      email: '' as string | null | undefined,
      status: 'ACTIVE' as const,
      isDefault: false,
    },
  });

  const selectedEntityType = form.watch('entityType');
  const isChildSeries = selectedEntityType === 'SERIES_LLC_CHILD';

  // Filter parent entities to only show Series LLCs
  const availableParents = parentEntities.filter(
    (e) => e.entityType === 'SERIES_LLC'
  );

  const handleSubmit = async (data: CreateEntityInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      setStep(1);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create entity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate entity type selection
      setStep(2);
    } else if (step === 2) {
      // Validate basic info
      form.trigger(['name', 'parentEntityId']).then((valid) => {
        if (valid) setStep(3);
      });
    }
  };

  const prevStep = () => {
    setStep(Math.max(1, step - 1));
  };

  const resetAndClose = () => {
    form.reset();
    setStep(1);
    onOpenChange(false);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="size-5 text-primary" />
              </div>
              <div>
                <span className="text-lg">Create New Entity</span>
                <p className="text-sm font-normal text-muted-foreground">
                  {step === 1 && 'Choose the entity type'}
                  {step === 2 && 'Enter basic information'}
                  {step === 3 && 'Add optional details'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="px-6 py-3 border-b bg-muted/30">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                        s < step && 'bg-success text-success-foreground',
                        s === step && 'bg-primary text-primary-foreground',
                        s > step && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {s < step ? <Check className="size-4" /> : s}
                    </div>
                    <span
                      className={cn(
                        'text-sm hidden sm:inline',
                        s === step ? 'font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {s === 1 && 'Type'}
                      {s === 2 && 'Info'}
                      {s === 3 && 'Details'}
                    </span>
                  </div>
                  {s < 3 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2',
                        s < step ? 'bg-success' : 'bg-muted'
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <ScrollArea className="flex-1 max-h-[50vh]">
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Entity Type Selection */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            LLCs
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {entityTypeOptions
                              .filter((o) => o.category === 'llc')
                              .map((option) => (
                                <EntityTypeCard
                                  key={option.value}
                                  option={option}
                                  selected={selectedEntityType === option.value}
                                  onSelect={() =>
                                    form.setValue('entityType', option.value)
                                  }
                                />
                              ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            Corporations
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {entityTypeOptions
                              .filter((o) => o.category === 'corporation')
                              .map((option) => (
                                <EntityTypeCard
                                  key={option.value}
                                  option={option}
                                  selected={selectedEntityType === option.value}
                                  onSelect={() =>
                                    form.setValue('entityType', option.value)
                                  }
                                />
                              ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            Partnerships & Other
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {entityTypeOptions
                              .filter(
                                (o) =>
                                  o.category === 'partnership' || o.category === 'other'
                              )
                              .map((option) => (
                                <EntityTypeCard
                                  key={option.value}
                                  option={option}
                                  selected={selectedEntityType === option.value}
                                  onSelect={() =>
                                    form.setValue('entityType', option.value)
                                  }
                                />
                              ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Basic Information */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        {/* Parent Entity (for Series Child) */}
                        {isChildSeries && (
                          <FormField
                            control={form.control}
                            name="parentEntityId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Parent Series LLC
                                  <Badge variant="secondary" className="text-xs">
                                    Required
                                  </Badge>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select parent Series LLC" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availableParents.map((parent) => (
                                      <SelectItem key={parent.id} value={parent.id}>
                                        {parent.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Sunset Holdings"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                A short name for easy identification
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="legalName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Legal Name (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Sunset Holdings Limited Liability Company"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormDescription>
                                Full legal name as registered with the state
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="stateOfFormation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State of Formation</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {US_STATES.map((state) => (
                                      <SelectItem key={state} value={state}>
                                        {state}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dateFormed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date Formed</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    value={
                                      field.value instanceof Date
                                        ? field.value.toISOString().split('T')[0]
                                        : ''
                                    }
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? new Date(e.target.value)
                                          : undefined
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="ein"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                EIN (Tax ID)
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="size-3.5 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Employer Identification Number (XX-XXXXXXX format)
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="XX-XXXXXXX"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {/* Step 3: Optional Details */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="size-4 text-muted-foreground" />
                            Address
                          </h3>

                          <FormField
                            control={form.control}
                            name="addressLine1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="123 Main Street"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="addressLine2"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Suite, Unit, etc. (optional)"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <FileText className="size-4 text-muted-foreground" />
                            Registered Agent
                          </h3>

                          <FormField
                            control={form.control}
                            name="registeredAgent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Agent Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Registered agent name"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="registeredAgentAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Agent Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Full address of registered agent"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <Mail className="size-4 text-muted-foreground" />
                            Contact Information
                          </h3>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      placeholder="entity@example.com"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="tel"
                                      placeholder="(555) 123-4567"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
                <div className="flex items-center justify-between w-full">
                  <div>
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={prevStep}
                      >
                        <ChevronLeft className="size-4 mr-1" />
                        Back
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetAndClose}
                    >
                      Cancel
                    </Button>
                    {step < 3 ? (
                      <Button type="button" onClick={nextStep}>
                        Continue
                        <ChevronRight className="size-4 ml-1" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Entity'}
                      </Button>
                    )}
                  </div>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
