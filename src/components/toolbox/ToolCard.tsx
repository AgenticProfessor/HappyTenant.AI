'use client';

import { LucideIcon, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: 'AI' | 'Popular' | 'New';
  onClick: () => void;
  className?: string;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  badge,
  onClick,
  className,
}: ToolCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        // Base styles
        "group relative cursor-pointer p-5 rounded-xl",
        "bg-white border border-gray-100",
        "shadow-sm",
        // Hover animations
        "hover:shadow-lg hover:-translate-y-1",
        "transition-all duration-200 ease-out",
        // Dark mode support
        "dark:bg-gray-900 dark:border-gray-800",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon container - oval/pill shape with animation */}
        <div
          className={cn(
            "flex items-center justify-center",
            "w-14 h-14 rounded-2xl",
            "bg-blue-50 dark:bg-blue-950",
            // Hover scale animation
            "group-hover:scale-110",
            "transition-transform duration-200 ease-out"
          )}
        >
          <Icon className="h-6 w-6 text-[#1a4480] dark:text-blue-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h3>
            {badge && (
              <Badge
                variant={badge === 'AI' ? 'default' : 'secondary'}
                className={cn(
                  "text-xs px-2 py-0.5",
                  badge === 'AI' && "bg-purple-600 hover:bg-purple-700",
                  badge === 'New' && "bg-green-600 hover:bg-green-700 text-white",
                  badge === 'Popular' && "bg-orange-500 hover:bg-orange-600 text-white"
                )}
              >
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Arrow with slide animation */}
        <ChevronRight
          className={cn(
            "h-5 w-5 text-gray-400 flex-shrink-0",
            "group-hover:translate-x-1 group-hover:text-primary",
            "transition-all duration-200"
          )}
        />
      </div>

      {/* Subtle hover glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0",
          "bg-gradient-to-r from-blue-500/5 to-purple-500/5",
          "group-hover:opacity-100",
          "transition-opacity duration-300",
          "pointer-events-none"
        )}
      />
    </div>
  );
}
