'use client';

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Phone, Video, MoreVertical, ArrowDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import type { Conversation, Message } from './types';

interface MessageThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  isSending?: boolean;
  typingUsers?: string[];
  onSendMessage: (content: string, attachments?: File[]) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onLoadMore?: () => void;
  onAiAssist?: (content: string) => void;
  onMarkAsRead?: (messageIds: string[]) => void;
  hasMoreMessages?: boolean;
}

export function MessageThread({
  conversation,
  messages,
  currentUserId,
  isLoading,
  isSending,
  typingUsers = [],
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onLoadMore,
  onAiAssist,
  onMarkAsRead,
  hasMoreMessages,
}: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Get other participant info
  const otherParticipant = conversation?.participants.find(
    (p) => p.userId !== currentUserId && p.tenantId !== currentUserId
  );

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: Date; messages: Message[] }[] = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.sentAt);
      const existingGroup = groups.find((g) => isSameDay(g.date, messageDate));

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: messageDate, messages: [message] });
      }
    });

    return groups;
  }, [messages]);

  // Format date header
  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Check if message is consecutive from same sender
  const isConsecutive = (current: Message, previous: Message | undefined) => {
    if (!previous) return false;
    const sameUser =
      current.senderUserId === previous.senderUserId &&
      current.senderTenantId === previous.senderTenantId;
    const timeDiff =
      new Date(current.sentAt).getTime() - new Date(previous.sentAt).getTime();
    return sameUser && timeDiff < 60000; // Within 1 minute
  };

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(isBottom);
    setShowScrollButton(!isBottom);

    // Load more when scrolled to top
    if (scrollTop < 100 && hasMoreMessages && onLoadMore) {
      onLoadMore();
    }
  }, [hasMoreMessages, onLoadMore]);

  // Scroll to bottom on new messages (if already at bottom)
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('instant');
    }
  }, [messages.length, isAtBottom, scrollToBottom]);

  // Mark messages as read when visible
  useEffect(() => {
    if (!conversation || !onMarkAsRead) return;

    const unreadIds = messages
      .filter(
        (m) =>
          !m.readAt &&
          m.senderUserId !== currentUserId &&
          m.senderTenantId !== currentUserId
      )
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      onMarkAsRead(unreadIds);
    }
  }, [messages, currentUserId, conversation, onMarkAsRead]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // No conversation selected
  if (!conversation) {
    return (
      <Card className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">No conversation selected</h3>
            <p className="text-muted-foreground mt-1">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={otherParticipant?.avatarUrl}
                alt={otherParticipant?.name}
              />
              <AvatarFallback>
                {getInitials(otherParticipant?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {otherParticipant?.name || conversation.subject || 'Conversation'}
              </h3>
              {otherParticipant?.email && (
                <p className="text-xs text-muted-foreground">
                  {otherParticipant.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View profile</DropdownMenuItem>
                <DropdownMenuItem>Search in conversation</DropdownMenuItem>
                <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Archive conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages area */}
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full" ref={scrollRef} onScroll={handleScroll}>
          <div className="p-4 min-h-full flex flex-col">
            {/* Load more */}
            {hasMoreMessages && (
              <div className="text-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load older messages'}
                </Button>
              </div>
            )}

            {/* Loading state */}
            {isLoading && messages.length === 0 ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                  >
                    <Skeleton className="h-12 w-[60%] rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              /* Messages grouped by date */
              <div className="flex-1">
                {groupedMessages.map((group) => (
                  <div key={group.date.toISOString()}>
                    {/* Date divider */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                        {formatDateHeader(group.date)}
                      </div>
                    </div>

                    {/* Messages */}
                    {group.messages.map((message, index) => {
                      const isOwn =
                        message.senderUserId === currentUserId ||
                        message.senderTenantId === currentUserId;
                      const prevMessage = group.messages[index - 1];

                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwn={isOwn}
                          isConsecutive={isConsecutive(message, prevMessage)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator userNames={typingUsers} />
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-4 right-4 rounded-full shadow-lg"
            onClick={() => scrollToBottom()}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </CardContent>

      {/* Message input */}
      <MessageInput
        onSend={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        onAiAssist={onAiAssist}
        disabled={isSending}
        showAiAssist={!!onAiAssist}
      />
    </Card>
  );
}
