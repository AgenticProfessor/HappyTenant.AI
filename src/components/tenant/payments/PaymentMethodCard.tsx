'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Building2,
  Star,
  MoreVertical,
  Trash2,
  Check,
  Pencil,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface PaymentMethodCardProps {
  id: string;
  type: 'CARD' | 'US_BANK_ACCOUNT';
  last4: string;
  brand?: string;
  bankName?: string;
  nickname?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onEditNickname: (id: string, nickname: string) => void;
}

export function PaymentMethodCard({
  id,
  type,
  last4,
  brand,
  bankName,
  nickname,
  isDefault,
  expiryMonth,
  expiryYear,
  onSetDefault,
  onDelete,
  onEditNickname,
}: PaymentMethodCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isCard = type === 'CARD';
  const displayName = nickname || (isCard ? `${brand || 'Card'} ****${last4}` : `${bankName || 'Bank'} ****${last4}`);
  const expiry = expiryMonth && expiryYear ? `${String(expiryMonth).padStart(2, '0')}/${String(expiryYear).slice(-2)}` : null;

  // Card brand colors
  const brandColors: Record<string, { bg: string; accent: string }> = {
    visa: { bg: 'from-blue-600 to-blue-800', accent: 'bg-yellow-400' },
    mastercard: { bg: 'from-red-500 to-orange-600', accent: 'bg-yellow-400' },
    amex: { bg: 'from-slate-600 to-slate-800', accent: 'bg-blue-400' },
    discover: { bg: 'from-orange-500 to-orange-700', accent: 'bg-white' },
    default: { bg: 'from-zinc-700 to-zinc-900', accent: 'bg-zinc-400' },
  };

  const bankColors = { bg: 'from-emerald-600 to-teal-800', accent: 'bg-emerald-300' };
  const colors = isCard ? (brandColors[brand?.toLowerCase() || 'default'] || brandColors.default) : bankColors;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Card container with gradient background */}
      <div
        className={cn(
          'relative w-full aspect-[1.586/1] max-w-[320px] rounded-2xl p-5 overflow-hidden',
          'bg-gradient-to-br shadow-xl',
          colors.bg,
          'transform-gpu transition-shadow duration-300',
          isHovered && 'shadow-2xl'
        )}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Top row - Type icon and default badge */}
        <div className="relative flex items-start justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', colors.accent, 'bg-opacity-20')}>
              {isCard ? (
                <CreditCard className="w-5 h-5 text-white" />
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
            </div>
            {isDefault && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm"
              >
                <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                <span className="text-[10px] font-medium text-white uppercase tracking-wider">Default</span>
              </motion.div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isDefault && (
                <DropdownMenuItem onClick={() => onSetDefault(id)}>
                  <Star className="w-4 h-4 mr-2" />
                  Set as default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEditNickname(id, displayName)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit nickname
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Card number display */}
        <div className="relative mb-4">
          <div className="flex items-center gap-3 text-white font-mono text-lg tracking-[0.2em]">
            <span className="opacity-40">****</span>
            <span className="opacity-40">****</span>
            <span className="opacity-40">****</span>
            <span>{last4}</span>
          </div>
        </div>

        {/* Bottom row - Name and expiry/type */}
        <div className="relative flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
              {isCard ? 'Card Name' : 'Account'}
            </p>
            <p className="text-sm font-medium text-white truncate max-w-[180px]">
              {nickname || (isCard ? brand?.toUpperCase() : bankName)}
            </p>
          </div>

          {isCard && expiry ? (
            <div className="text-right">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Expires</p>
              <p className="text-sm font-mono text-white">{expiry}</p>
            </div>
          ) : !isCard ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10">
              <Shield className="w-3 h-3 text-emerald-300" />
              <span className="text-[10px] text-white/80 uppercase tracking-wider">Verified</span>
            </div>
          ) : null}
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/5" />
      </div>

      {/* Hover effect glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        className={cn(
          'absolute inset-0 -z-10 rounded-2xl blur-2xl',
          'bg-gradient-to-br',
          colors.bg
        )}
      />
    </motion.div>
  );
}
