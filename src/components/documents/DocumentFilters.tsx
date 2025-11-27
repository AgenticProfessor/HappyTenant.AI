'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface DocumentFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  propertyFilter: string;
  onPropertyFilterChange: (propertyId: string) => void;
  signatureFilter: string;
  onSignatureFilterChange: (status: string) => void;
  properties: Array<{ id: string; name: string }>;
}

export function DocumentFilters({
  searchQuery,
  onSearchChange,
  propertyFilter,
  onPropertyFilterChange,
  signatureFilter,
  onSignatureFilterChange,
  properties,
}: DocumentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Property Filter */}
      <Select value={propertyFilter} onValueChange={onPropertyFilterChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Properties" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Properties</SelectItem>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              {property.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Signature Status Filter */}
      <Select value={signatureFilter} onValueChange={onSignatureFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="signed">Signed</SelectItem>
          <SelectItem value="pending">Pending Signature</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
          <SelectItem value="not_required">No Signature Required</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
