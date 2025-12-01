'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  User,
  Users,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Building2,
  Mail,
  Phone,
  ChevronDown,
  Check,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useESign } from './ESignContext';
import { SignerRole, SIGNER_COLORS } from '@/lib/schemas/esign';

// Mock tenants - in real app, this would come from API
const mockTenants = [
  {
    id: 'tenant-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    property: 'Sunset Apartments',
    unit: 'Unit 3B',
  },
  {
    id: 'tenant-2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 987-6543',
    property: 'Sunset Apartments',
    unit: 'Unit 3B',
  },
  {
    id: 'tenant-3',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 456-7890',
    property: 'Oak Grove Homes',
    unit: 'Unit 12',
  },
];

// Mock current user (landlord)
const mockLandlord = {
  id: 'user-1',
  name: 'John Smith',
  email: 'john@propertymanagement.com',
  company: 'Smith Property Management',
};

interface SignerFormData {
  name: string;
  email: string;
  phone?: string;
  role: SignerRole;
  tenantId?: string;
  userId?: string;
}

export function SignerSelection() {
  const {
    state,
    addSigner,
    updateSigner,
    removeSigner,
    setStep,
    canProceedToSigners,
    canProceedToFields,
  } = useESign();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<SignerFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'TENANT',
  });
  const [selectedTenants, setSelectedTenants] = useState<Set<string>>(new Set());
  const [isLandlordSigning, setIsLandlordSigning] = useState(false);
  const [isAdditionalSignersOpen, setIsAdditionalSignersOpen] = useState(false);

  const handleSelectTenant = (tenantId: string, checked: boolean) => {
    const newSelected = new Set(selectedTenants);
    if (checked) {
      newSelected.add(tenantId);
    } else {
      newSelected.delete(tenantId);
    }
    setSelectedTenants(newSelected);

    // Add or remove from signers
    const tenant = mockTenants.find((t) => t.id === tenantId);
    if (!tenant) return;

    if (checked) {
      // Check if already added
      const alreadyAdded = state.signers.some((s) => s.tenantId === tenantId);
      if (!alreadyAdded) {
        addSigner({
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          role: 'TENANT',
          tenantId: tenant.id,
        });
      }
    } else {
      // Remove from signers
      const signerIndex = state.signers.findIndex((s) => s.tenantId === tenantId);
      if (signerIndex !== -1) {
        removeSigner(signerIndex);
      }
    }
  };

  const handleToggleLandlord = (checked: boolean) => {
    setIsLandlordSigning(checked);

    if (checked) {
      const alreadyAdded = state.signers.some((s) => s.userId === mockLandlord.id);
      if (!alreadyAdded) {
        addSigner({
          name: mockLandlord.name,
          email: mockLandlord.email,
          role: 'LANDLORD',
          userId: mockLandlord.id,
        });
      }
    } else {
      const signerIndex = state.signers.findIndex((s) => s.userId === mockLandlord.id);
      if (signerIndex !== -1) {
        removeSigner(signerIndex);
      }
    }
  };

  const handleAddCustomSigner = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'OTHER',
    });
    setEditingIndex(null);
    setIsAddDialogOpen(true);
  };

  const handleEditSigner = (index: number) => {
    const signer = state.signers[index];
    setFormData({
      name: signer.name,
      email: signer.email,
      phone: signer.phone,
      role: signer.role,
      tenantId: signer.tenantId,
      userId: signer.userId,
    });
    setEditingIndex(index);
    setIsAddDialogOpen(true);
  };

  const handleSaveSigner = () => {
    if (!formData.name || !formData.email) return;

    if (editingIndex !== null) {
      updateSigner(editingIndex, formData);
    } else {
      addSigner(formData);
    }

    setIsAddDialogOpen(false);
    setFormData({ name: '', email: '', phone: '', role: 'TENANT' });
    setEditingIndex(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Who needs to sign?</h2>
        <p className="text-muted-foreground mt-1">
          Select the tenants and add any additional signers for this document
        </p>
      </div>

      {/* Tenants Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Which tenants are signing?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTenants.map((tenant) => {
            const isSelected = selectedTenants.has(tenant.id) ||
              state.signers.some((s) => s.tenantId === tenant.id);
            const signerIndex = state.signers.findIndex((s) => s.tenantId === tenant.id);
            const signerColor = signerIndex !== -1
              ? state.signers[signerIndex].color
              : SIGNER_COLORS[state.signers.length % SIGNER_COLORS.length];

            return (
              <motion.div
                key={tenant.id}
                layout
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all',
                  isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                )}
              >
                <Checkbox
                  id={tenant.id}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleSelectTenant(tenant.id, checked as boolean)
                  }
                  className="size-5"
                />
                <Avatar
                  className="size-12 border-2"
                  style={{ borderColor: isSelected ? signerColor : 'transparent' }}
                >
                  <AvatarFallback
                    style={{ backgroundColor: isSelected ? signerColor : undefined }}
                    className={cn(
                      'text-sm font-semibold',
                      isSelected ? 'text-white' : 'bg-muted'
                    )}
                  >
                    {getInitials(tenant.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <label
                    htmlFor={tenant.id}
                    className="font-medium cursor-pointer"
                  >
                    {tenant.name}
                  </label>
                  <p className="text-sm text-muted-foreground">{tenant.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{tenant.property}</p>
                  <p className="text-xs text-muted-foreground">{tenant.unit}</p>
                </div>
                {isSelected && signerIndex !== -1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditSigner(signerIndex)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                )}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Landlord Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Are you signing?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            layout
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border transition-all',
              isLandlordSigning ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
            )}
          >
            <Checkbox
              id="landlord"
              checked={isLandlordSigning || state.signers.some((s) => s.userId === mockLandlord.id)}
              onCheckedChange={(checked) => handleToggleLandlord(checked as boolean)}
              className="size-5"
            />
            <Avatar
              className="size-12 border-2"
              style={{
                borderColor: isLandlordSigning
                  ? SIGNER_COLORS[state.signers.findIndex((s) => s.userId === mockLandlord.id) % SIGNER_COLORS.length]
                  : 'transparent'
              }}
            >
              <AvatarFallback
                className={cn(
                  'text-sm font-semibold',
                  isLandlordSigning ? 'bg-primary text-white' : 'bg-muted'
                )}
              >
                {getInitials(mockLandlord.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <label htmlFor="landlord" className="font-medium cursor-pointer">
                {mockLandlord.name}
              </label>
              <p className="text-sm text-muted-foreground">{mockLandlord.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{mockLandlord.company}</p>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Additional Signers */}
      <Collapsible open={isAdditionalSignersOpen} onOpenChange={setIsAdditionalSignersOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <UserPlus className="size-5 text-primary" />
                  Additional Signers
                  <span className="text-muted-foreground font-normal text-sm ml-2">
                    (Co-signers, witnesses, etc.)
                  </span>
                </CardTitle>
                <ChevronDown
                  className={cn(
                    'size-5 text-muted-foreground transition-transform',
                    isAdditionalSignersOpen && 'rotate-180'
                  )}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {/* List additional signers */}
              <AnimatePresence>
                {state.signers
                  .filter((s) => !s.tenantId && !s.userId)
                  .map((signer, index) => {
                    const actualIndex = state.signers.findIndex(
                      (s) => s.email === signer.email && !s.tenantId && !s.userId
                    );
                    return (
                      <motion.div
                        key={signer.email}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-4 p-4 rounded-xl border mb-3"
                      >
                        <Avatar
                          className="size-12 border-2"
                          style={{ borderColor: signer.color }}
                        >
                          <AvatarFallback
                            style={{ backgroundColor: signer.color }}
                            className="text-white text-sm font-semibold"
                          >
                            {getInitials(signer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{signer.name}</p>
                          <p className="text-sm text-muted-foreground">{signer.email}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted">
                          {signer.role.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSigner(actualIndex)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeSigner(actualIndex)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={handleAddCustomSigner}
              >
                <Plus className="size-4 mr-2" />
                Add Another Signer
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Selected Signers Summary */}
      {state.signers.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {state.signers.slice(0, 5).map((signer, index) => (
                    <Avatar
                      key={signer.email}
                      className="size-10 border-2 border-background"
                      style={{ backgroundColor: signer.color }}
                    >
                      <AvatarFallback
                        style={{ backgroundColor: signer.color }}
                        className="text-white text-xs font-semibold"
                      >
                        {getInitials(signer.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {state.signers.length > 5 && (
                    <Avatar className="size-10 border-2 border-background bg-muted">
                      <AvatarFallback className="text-xs font-semibold">
                        +{state.signers.length - 5}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {state.signers.length} signer{state.signers.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ready to place signature fields
                  </p>
                </div>
              </div>
              <Check className="size-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setStep('upload')}>
          Back
        </Button>
        <Button
          onClick={() => setStep('fields')}
          disabled={!canProceedToFields}
          size="lg"
          className="min-w-[200px]"
        >
          Next: Place Signatures
        </Button>
      </div>

      {/* Add/Edit Signer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Signer' : 'Add Signer'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signer-name">Full Name</Label>
              <Input
                id="signer-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signer-email">Email Address</Label>
              <Input
                id="signer-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signer-phone">Phone (optional)</Label>
              <Input
                id="signer-phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signer-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as SignerRole })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                  <SelectItem value="LANDLORD">Landlord</SelectItem>
                  <SelectItem value="CO_SIGNER">Co-Signer</SelectItem>
                  <SelectItem value="WITNESS">Witness</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSigner} disabled={!formData.name || !formData.email}>
              {editingIndex !== null ? 'Save Changes' : 'Add Signer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
