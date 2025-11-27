'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  MapPin,
  Home,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

interface PropertyCardMobileProps {
  property: {
    id: string;
    name: string;
    type: string;
    address: string;
    city: string;
    state: string;
  };
  units?: number;
  occupancy?: number;
  monthlyRevenue?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PropertyCardMobile({
  property,
  units = 0,
  occupancy = 0,
  monthlyRevenue = 0,
  onEdit,
  onDelete,
}: PropertyCardMobileProps) {
  return (
    <Card className="overflow-hidden active:scale-[0.98] transition-transform">
      {/* Header with image placeholder */}
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-12 w-12 text-primary/30" />
        </div>
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon-sm"
                className="h-8 w-8 touch-manipulation"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/properties/${property.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Property
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="capitalize">
            {property.type.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-base leading-tight">{property.name}</CardTitle>
        <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
          <span className="line-clamp-2">
            {property.address}, {property.city}, {property.state}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Home className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold leading-none">{units}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Units</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold leading-none">{occupancy}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Occupied</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold leading-none">
              {(monthlyRevenue / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Monthly</p>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/dashboard/properties/${property.id}`}>
          <Button
            variant="outline"
            className="w-full touch-manipulation min-h-[44px]"
          >
            View Property
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
