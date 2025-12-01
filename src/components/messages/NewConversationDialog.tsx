'use client';

import { useState, useMemo } from 'react';
import { Search, User, Building, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  type: 'tenant' | 'user';
  propertyName?: string;
  unitNumber?: string;
}

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenants: Recipient[];
  users?: Recipient[];
  onCreateConversation: (data: {
    participantId: string;
    participantType: 'tenant' | 'user';
    message?: string;
    subject?: string;
  }) => void;
  isLoading?: boolean;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  tenants,
  users = [],
  onCreateConversation,
  isLoading,
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [step, setStep] = useState<'select' | 'compose'>('select');

  // Filter recipients based on search
  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return tenants;
    const query = searchQuery.toLowerCase();
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.email?.toLowerCase().includes(query) ||
        t.propertyName?.toLowerCase().includes(query) ||
        t.unitNumber?.toLowerCase().includes(query)
    );
  }, [tenants, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle recipient selection
  const handleSelectRecipient = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setStep('compose');
  };

  // Handle back to selection
  const handleBack = () => {
    setStep('select');
  };

  // Handle create conversation
  const handleCreate = () => {
    if (!selectedRecipient) return;

    onCreateConversation({
      participantId: selectedRecipient.id,
      participantType: selectedRecipient.type,
      message: message.trim() || undefined,
      subject: subject.trim() || undefined,
    });

    // Reset state
    setSelectedRecipient(null);
    setMessage('');
    setSubject('');
    setStep('select');
    setSearchQuery('');
  };

  // Handle close
  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedRecipient(null);
      setMessage('');
      setSubject('');
      setStep('select');
      setSearchQuery('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' ? 'New Conversation' : 'Compose Message'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select'
              ? 'Select a tenant or team member to start a conversation'
              : `Send a message to ${selectedRecipient?.name}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Recipient tabs */}
            <Tabs defaultValue="tenants" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tenants">
                  <User className="h-4 w-4 mr-2" />
                  Tenants ({filteredTenants.length})
                </TabsTrigger>
                {users.length > 0 && (
                  <TabsTrigger value="team">
                    <Building className="h-4 w-4 mr-2" />
                    Team ({filteredUsers.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="tenants" className="mt-4">
                <ScrollArea className="h-[300px] pr-4">
                  {filteredTenants.length > 0 ? (
                    <div className="space-y-2">
                      {filteredTenants.map((tenant) => (
                        <button
                          key={tenant.id}
                          onClick={() => handleSelectRecipient(tenant)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-muted transition-colors"
                        >
                          <Avatar>
                            <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
                            <AvatarFallback>{getInitials(tenant.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{tenant.name}</p>
                            {tenant.propertyName && (
                              <p className="text-sm text-muted-foreground truncate">
                                {tenant.propertyName}
                                {tenant.unitNumber && ` - Unit ${tenant.unitNumber}`}
                              </p>
                            )}
                            {tenant.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {tenant.email}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tenants found</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {users.length > 0 && (
                <TabsContent value="team" className="mt-4">
                  <ScrollArea className="h-[300px] pr-4">
                    {filteredUsers.length > 0 ? (
                      <div className="space-y-2">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleSelectRecipient(user)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-muted transition-colors"
                          >
                            <Avatar>
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.name}</p>
                              {user.email && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No team members found</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              )}
            </Tabs>
          </>
        ) : (
          /* Compose step */
          <div className="space-y-4">
            {/* Selected recipient */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar>
                <AvatarImage
                  src={selectedRecipient?.avatarUrl}
                  alt={selectedRecipient?.name}
                />
                <AvatarFallback>
                  {getInitials(selectedRecipient?.name || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedRecipient?.name}</p>
                {selectedRecipient?.propertyName && (
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedRecipient.propertyName}
                    {selectedRecipient.unitNumber &&
                      ` - Unit ${selectedRecipient.unitNumber}`}
                  </p>
                )}
              </div>
              <Badge variant="secondary">{selectedRecipient?.type}</Badge>
            </div>

            {/* Subject (optional) */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                placeholder="What's this about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={isLoading}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Start Conversation'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
