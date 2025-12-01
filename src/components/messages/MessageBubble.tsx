'use client';

import { Check, CheckCheck, Bot, FileIcon, ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  isConsecutive?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  isConsecutive = false,
}: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // System message style
  if (message.isSystemMessage || message.contentType === 'SYSTEM') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted px-4 py-2 rounded-full text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  // AI suggestion style
  if (message.contentType === 'AI_SUGGESTION') {
    return (
      <div className="flex justify-start my-2">
        <div className="max-w-[85%] bg-primary/10 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-primary mb-2">
            <Bot className="h-3 w-3" />
            <span>AI Suggestion</span>
          </div>
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2',
        isOwn ? 'justify-end' : 'justify-start',
        isConsecutive ? 'mt-1' : 'mt-4'
      )}
    >
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && !isConsecutive && (
        <Avatar className="h-8 w-8 mt-auto">
          <AvatarImage src={message.senderAvatarUrl} alt={message.senderName} />
          <AvatarFallback className="text-xs">
            {message.isAiGenerated ? (
              <Bot className="h-4 w-4" />
            ) : (
              getInitials(message.senderName)
            )}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Spacer for consecutive messages */}
      {!isOwn && showAvatar && isConsecutive && <div className="w-8" />}

      <div className={cn('max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender name for group chats or first message */}
        {!isOwn && !isConsecutive && (
          <p className="text-xs text-muted-foreground mb-1 ml-1">
            {message.senderName}
            {message.isAiGenerated && (
              <span className="ml-1 text-primary">(AI)</span>
            )}
          </p>
        )}

        {/* Message content */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          )}
        >
          {/* Image attachment */}
          {message.contentType === 'IMAGE' && message.attachments.length > 0 && (
            <div className="mb-2 space-y-2">
              {message.attachments.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="Attachment"
                  className="rounded-lg max-w-full max-h-64 object-cover"
                />
              ))}
            </div>
          )}

          {/* File attachment */}
          {message.contentType === 'FILE' && message.attachments.length > 0 && (
            <div className="mb-2 space-y-1">
              {message.attachments.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg',
                    isOwn
                      ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
                      : 'bg-background hover:bg-background/80'
                  )}
                >
                  <FileIcon className="h-4 w-4" />
                  <span className="text-sm truncate">
                    {url.split('/').pop() || 'File'}
                  </span>
                </a>
              ))}
            </div>
          )}

          {/* Text content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Timestamp and read status */}
          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-[10px]',
              isOwn ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'
            )}
          >
            <span>{formatTime(message.sentAt)}</span>
            {isOwn && (
              <span className="ml-0.5">
                {message.readAt ? (
                  <CheckCheck className="h-3 w-3" />
                ) : message.deliveredAt ? (
                  <CheckCheck className="h-3 w-3 opacity-50" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
