'use client';

import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Conversation } from './types';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  // Get the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId && p.tenantId !== currentUserId
  );

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format last message time
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Calculate total unread for current user
  const currentParticipant = conversation.participants.find(
    (p) => p.userId === currentUserId || p.tenantId === currentUserId
  );
  const unreadCount = currentParticipant?.unreadCount || 0;

  const displayName = otherParticipant?.name || conversation.subject || 'Unknown';
  const avatarUrl = otherParticipant?.avatarUrl;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
        isSelected ? 'bg-primary/10' : 'hover:bg-muted'
      )}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        {conversation.type === 'AI_ASSISTANT' && (
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
            <span className="text-[8px] text-primary-foreground">AI</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={cn(
              'font-medium truncate',
              isSelected && 'text-primary',
              unreadCount > 0 && 'font-semibold'
            )}
          >
            {displayName}
          </p>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p
            className={cn(
              'text-sm truncate',
              unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {conversation.lastMessagePreview || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <Badge
              className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full ml-2 flex-shrink-0"
              variant="default"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>

        {conversation.subject && otherParticipant && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {conversation.subject}
          </p>
        )}
      </div>
    </button>
  );
}
