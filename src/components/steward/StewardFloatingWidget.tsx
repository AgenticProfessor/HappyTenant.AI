'use client';

/**
 * StewardFloatingWidget - Floating chat widget
 * Bottom-right corner widget that expands to full chat
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSteward } from './StewardContext';
import { StewardAvatar } from './StewardAvatar';
import { StewardChat } from './StewardChat';

interface StewardFloatingWidgetProps {
  className?: string;
}

export function StewardFloatingWidget({ className }: StewardFloatingWidgetProps) {
  const { isOpen, isMinimized, state, toggle, maximize } = useSteward();

  // Keyboard shortcut to toggle (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {/* Full chat panel */}
        {isOpen && !isMinimized && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <StewardChat />
          </motion.div>
        )}

        {/* Minimized orb button */}
        {(!isOpen || isMinimized) && (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative"
          >
            {/* Pulse ring animation */}
            <div className="absolute inset-0 -z-10">
              <span className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping" />
            </div>

            {/* Main button */}
            <button
              onClick={isMinimized ? maximize : toggle}
              className={cn(
                'relative flex items-center justify-center',
                'w-16 h-16 rounded-full',
                'bg-gradient-to-br from-violet-500 to-blue-500',
                'shadow-lg shadow-violet-500/25',
                'hover:shadow-xl hover:shadow-violet-500/30',
                'transition-all duration-300',
                'group'
              )}
              aria-label="Open Steward AI assistant"
            >
              {/* Inner orb container */}
              <div className="absolute inset-1 rounded-full overflow-hidden">
                <StewardAvatar
                  size="sm"
                  state={state}
                  interactive={false}
                  showSparkles={false}
                  showLabel={false}
                />
              </div>

              {/* Notification badge */}
              {isMinimized && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-violet-500" />
                </span>
              )}

              {/* Tooltip */}
              <span className={cn(
                'absolute -top-10 left-1/2 -translate-x-1/2',
                'px-2 py-1 rounded-md',
                'bg-popover text-popover-foreground text-xs',
                'shadow-md border border-border',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity duration-200',
                'whitespace-nowrap pointer-events-none'
              )}>
                {isMinimized ? 'Continue chat' : 'Ask Steward'} <kbd className="ml-1 text-muted-foreground">⌘K</kbd>
              </span>
            </button>

            {/* Status indicator */}
            <span className={cn(
              'absolute bottom-0 right-0',
              'w-4 h-4 rounded-full border-2 border-background',
              state === 'idle' && 'bg-green-500',
              state === 'thinking' && 'bg-yellow-500 animate-pulse',
              state === 'speaking' && 'bg-violet-500',
              state === 'listening' && 'bg-blue-500'
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
