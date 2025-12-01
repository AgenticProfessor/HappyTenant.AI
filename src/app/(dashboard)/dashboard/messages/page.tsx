'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Bot } from 'lucide-react';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useMarkAsRead,
  useCreateConversation,
} from '@/hooks/api/use-conversations';
import { useTenants } from '@/hooks/api/use-tenants';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
  } = useConversations({ status: 'ACTIVE' });

  // Fetch messages for selected conversation
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
  } = useConversationMessages(selectedConversationId);

  // Fetch tenants for new conversation dialog
  const { data: tenantsData } = useTenants();

  // Mutations
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const createConversationMutation = useCreateConversation();

  // Get current conversation
  const conversations = conversationsData?.conversations || [];
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null;
  const messages = messagesData?.messages || [];

  // Auto-select first conversation if none selected
  if (!selectedConversationId && conversations.length > 0) {
    setSelectedConversationId(conversations[0].id);
  }

  // Handle send message
  const handleSendMessage = useCallback(
    (content: string, attachments?: File[]) => {
      if (!selectedConversationId) return;

      sendMessageMutation.mutate(
        {
          conversationId: selectedConversationId,
          content,
          contentType: 'TEXT',
        },
        {
          onError: (error) => {
            toast.error('Failed to send message', {
              description: error instanceof Error ? error.message : 'Please try again',
            });
          },
        }
      );
    },
    [selectedConversationId, sendMessageMutation]
  );

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    (messageIds: string[]) => {
      if (!selectedConversationId || messageIds.length === 0) return;

      markAsReadMutation.mutate({
        conversationId: selectedConversationId,
        messageIds,
      });
    },
    [selectedConversationId, markAsReadMutation]
  );

  // Handle create conversation
  const handleCreateConversation = useCallback(
    (data: {
      participantId: string;
      participantType: 'tenant' | 'user';
      message?: string;
      subject?: string;
    }) => {
      createConversationMutation.mutate(
        {
          type: data.participantType === 'tenant' ? 'LANDLORD_TENANT' : 'INTERNAL',
          participantIds: [
            data.participantType === 'tenant'
              ? { tenantId: data.participantId }
              : { userId: data.participantId },
          ],
          subject: data.subject,
          initialMessage: data.message,
        },
        {
          onSuccess: (newConversation) => {
            setSelectedConversationId(newConversation.id);
            setIsNewConversationOpen(false);
            toast.success('Conversation started');
          },
          onError: (error) => {
            toast.error('Failed to create conversation', {
              description: error instanceof Error ? error.message : 'Please try again',
            });
          },
        }
      );
    },
    [createConversationMutation]
  );

  // Transform tenants for the dialog
  const tenantRecipients = (tenantsData?.tenants || []).map((tenant) => ({
    id: tenant.id,
    name: `${tenant.firstName} ${tenant.lastName}`,
    email: tenant.email,
    phone: tenant.phone || undefined,
    type: 'tenant' as const,
    propertyName: tenant.leaseTenants?.[0]?.lease?.unit?.property?.name,
    unitNumber: tenant.leaseTenants?.[0]?.lease?.unit?.unitNumber,
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with tenants and manage conversations
          </p>
        </div>
        <Button onClick={() => setIsNewConversationOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* AI Assistance Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">AI Communication Assistant</h3>
              <p className="text-xs text-muted-foreground">
                Get help drafting professional responses or let AI handle common inquiries
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Bot className="h-4 w-4 mr-2" />
              Enable AI Assist
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-350px)] min-h-[500px]">
        {/* Conversations list */}
        <div className="lg:col-span-1">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            currentUserId={user?.id || ''}
            isLoading={isLoadingConversations}
            onSelect={setSelectedConversationId}
            onNewConversation={() => setIsNewConversationOpen(true)}
          />
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2">
          <MessageThread
            conversation={selectedConversation}
            messages={messages}
            currentUserId={user?.id || ''}
            isLoading={isLoadingMessages}
            isSending={sendMessageMutation.isPending}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
            hasMoreMessages={messagesData?.hasMore || false}
          />
        </div>
      </div>

      {/* New conversation dialog */}
      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        tenants={tenantRecipients}
        onCreateConversation={handleCreateConversation}
        isLoading={createConversationMutation.isPending}
      />
    </div>
  );
}
