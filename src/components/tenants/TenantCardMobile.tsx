'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Mail,
  Phone,
  MessageSquare,
  FileText,
  MoreHorizontal,
  DollarSign,
  Home,
} from 'lucide-react';

interface TenantCardMobileProps {
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'pending' | 'past';
    moveInDate: string;
    avatarUrl?: string;
  };
  unit?: {
    name: string;
    property?: string;
  };
  rentAmount?: number;
  onMessage?: () => void;
  onViewLease?: () => void;
  onViewProfile?: () => void;
  onEdit?: () => void;
  onRecordPayment?: () => void;
  onRemove?: () => void;
}

export function TenantCardMobile({
  tenant,
  unit,
  rentAmount,
  onMessage,
  onViewLease,
  onViewProfile,
  onEdit,
  onRecordPayment,
  onRemove,
}: TenantCardMobileProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="overflow-hidden active:scale-[0.98] transition-transform">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
              <AvatarFallback className="text-sm">
                {tenant.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight truncate">
                {tenant.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Since {new Date(tenant.moveInDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant={getStatusColor(tenant.status)} className="shrink-0">
            {tenant.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Unit Info */}
        {unit && (
          <div className="p-2.5 rounded-lg bg-muted/50 flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{unit.name}</p>
              {unit.property && (
                <p className="text-xs text-muted-foreground truncate">
                  {unit.property}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate text-muted-foreground">{tenant.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{tenant.phone}</span>
          </div>
        </div>

        {/* Rent Amount */}
        {rentAmount && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Monthly Rent</span>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{rentAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onMessage && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 touch-manipulation min-h-[44px]"
              onClick={onMessage}
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Message</span>
            </Button>
          )}
          {onViewLease && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 touch-manipulation min-h-[44px]"
              onClick={onViewLease}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Lease</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="shrink-0 touch-manipulation min-h-[44px] min-w-[44px]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewProfile && (
                <DropdownMenuItem onClick={onViewProfile}>
                  View Profile
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>Edit Tenant</DropdownMenuItem>
              )}
              {onRecordPayment && (
                <DropdownMenuItem onClick={onRecordPayment}>
                  Record Payment
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  Remove Tenant
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
