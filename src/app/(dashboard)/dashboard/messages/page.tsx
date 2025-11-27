'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Sparkles,
  Bot,
  User,
  Check,
  CheckCheck,
} from 'lucide-react';
import { mockConversations, mockMessages, mockTenants, getTenantById } from '@/data/mock-data';

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]?.id || null);
  const [newMessage, setNewMessage] = useState('');

  const filteredConversations = mockConversations.filter((conv) => {
    const tenant = getTenantById(conv.participantIds.find((id) => id !== 'user-1') || '');
    return tenant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const currentConversation = mockConversations.find((c) => c.id === selectedConversation);
  const conversationMessages = mockMessages.filter(
    (m) => m.conversationId === selectedConversation
  );

  const getParticipant = (conversationId: string) => {
    const conv = mockConversations.find((c) => c.id === conversationId);
    if (conv) {
      const participantId = conv.participantIds.find((id) => id !== 'user-1');
      return participantId ? getTenantById(participantId) : null;
    }
    return null;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In a real app, this would send the message via API
    setNewMessage('');
  };

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
        <Button>
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
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
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
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-3">
                {filteredConversations.map((conversation) => {
                  const participant = getParticipant(conversation.id);
                  const isSelected = selectedConversation === conversation.id;
                  const lastMessage = mockMessages
                    .filter((m) => m.conversationId === conversation.id)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant?.avatarUrl} alt={participant?.name} />
                        <AvatarFallback>
                          {participant?.name.split(' ').map((n) => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium truncate ${isSelected ? 'text-primary' : ''}`}>
                            {participant?.name || 'Unknown'}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {lastMessage
                              ? new Date(lastMessage.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : ''}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}

                {filteredConversations.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat area */}
        <Card className="lg:col-span-2 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat header */}
              <CardHeader className="border-b py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={getParticipant(currentConversation.id)?.avatarUrl}
                        alt={getParticipant(currentConversation.id)?.name}
                      />
                      <AvatarFallback>
                        {getParticipant(currentConversation.id)?.name.split(' ').map((n) => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {getParticipant(currentConversation.id)?.name || 'Unknown'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {getParticipant(currentConversation.id)?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {conversationMessages.map((message) => {
                      const isOwn = message.senderId === 'user-1';
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span>
                                {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isOwn && (
                                message.read ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" className="text-primary">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No conversation selected</h3>
                <p className="text-muted-foreground mt-1">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
