'use client';

import { useState, useMemo } from 'react';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from './types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  isLoading?: boolean;
  onSelect: (conversationId: string) => void;
  onNewConversation?: () => void;
}

export function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  isLoading,
  onSelect,
  onNewConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      // Search in participant names
      const participantMatch = conv.participants.some((p) =>
        p.name.toLowerCase().includes(query)
      );
      // Search in subject
      const subjectMatch = conv.subject?.toLowerCase().includes(query);
      // Search in last message preview
      const messageMatch = conv.lastMessagePreview?.toLowerCase().includes(query);

      return participantMatch || subjectMatch || messageMatch;
    });
  }, [conversations, searchQuery]);

  // Sort by last message time (most recent first)
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [filteredConversations]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Conversations
          </h2>
          {onNewConversation && (
            <Button variant="ghost" size="icon" onClick={onNewConversation}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-3">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[60%]" />
                    <Skeleton className="h-3 w-[80%]" />
                  </div>
                </div>
              ))
            ) : sortedConversations.length > 0 ? (
              sortedConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedId === conversation.id}
                  currentUserId={currentUserId}
                  onClick={() => onSelect(conversation.id)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                {!searchQuery && onNewConversation && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={onNewConversation}
                    className="mt-2"
                  >
                    Start a new conversation
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
