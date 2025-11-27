'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PropertyHeaderProps {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  status?: string;
  onEdit?: () => void;
}

export function PropertyHeader({
  name,
  address,
  city,
  state,
  zipCode,
  type,
  status = 'active',
  onEdit,
}: PropertyHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Back button */}
      <Link href="/dashboard/properties">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Button>
      </Link>

      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <Badge variant="secondary" className="capitalize">
              {type.replace('_', ' ')}
            </Badge>
            {status && (
              <Badge variant={status === 'active' ? 'default' : 'outline'} className="capitalize">
                {status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {address}, {city}, {state} {zipCode}
            </span>
          </div>
        </div>
        <Button onClick={onEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Property
        </Button>
      </div>
    </div>
  );
}
