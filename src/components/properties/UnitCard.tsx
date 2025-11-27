'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BedDouble, Bath, Maximize2, DollarSign, User } from 'lucide-react';
import Link from 'next/link';

interface UnitCardProps {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  rent: number;
  status: 'occupied' | 'vacant' | 'maintenance' | 'notice_given' | 'off_market';
  tenantName?: string;
  tenantId?: string;
}

export function UnitCard({
  id,
  name,
  bedrooms,
  bathrooms,
  squareFeet,
  rent,
  status,
  tenantName,
  tenantId,
}: UnitCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'default';
      case 'vacant':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      case 'notice_given':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant={getStatusColor(status)} className="capitalize">
            {status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Unit details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-muted-foreground" />
            <span>
              {bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>
              {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          </div>
          {squareFeet && (
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
              <span>{squareFeet} sq ft</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">${rent.toLocaleString()}/mo</span>
          </div>
        </div>

        {/* Tenant info */}
        {status === 'occupied' && tenantName && tenantId && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tenant:</span>
                <span className="font-medium">{tenantName}</span>
              </div>
              <Link href={`/dashboard/tenants/${tenantId}`}>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Vacant unit actions */}
        {status === 'vacant' && (
          <div className="pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full">
              List Unit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
