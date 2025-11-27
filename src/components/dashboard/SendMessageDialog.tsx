'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Loader2, Mail, Smartphone, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  name: string;
  email: string;
}

interface Message {
  id: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  channels: string[];
  sentAt: string;
}

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageSent: (message: Message) => void;
  tenants: Tenant[];
}

export function SendMessageDialog({ open, onOpenChange, onMessageSent, tenants }: SendMessageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    message: '',
  });
  const [channels, setChannels] = useState({
    inApp: true,
    email: false,
    sms: false,
  });

  const selectedTenant = tenants.find((t) => t.id === formData.recipientId);
  const isAllTenants = formData.recipientId === 'all';

  const handleChannelChange = (channel: 'inApp' | 'email' | 'sms', checked: boolean) => {
    setChannels({ ...channels, [channel]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.recipientId || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate at least one channel is selected
    if (!channels.inApp && !channels.email && !channels.sms) {
      toast.error('Please select at least one delivery method');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const selectedChannels = [];
    if (channels.inApp) selectedChannels.push('in-app');
    if (channels.email) selectedChannels.push('email');
    if (channels.sms) selectedChannels.push('sms');

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      recipientId: formData.recipientId,
      recipientName: isAllTenants ? 'All Tenants' : selectedTenant?.name || 'Unknown',
      subject: formData.subject,
      body: formData.message,
      channels: selectedChannels,
      sentAt: new Date().toISOString(),
    };

    onMessageSent(newMessage);

    const recipientCount = isAllTenants ? tenants.length : 1;
    toast.success('Message sent!', {
      description: `Your message has been sent to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''} via ${selectedChannels.join(', ')}.`,
    });

    // Reset form
    setFormData({
      recipientId: '',
      subject: '',
      message: '',
    });
    setChannels({
      inApp: true,
      email: false,
      sms: false,
    });
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Send Message
          </DialogTitle>
          <DialogDescription>
            Send a message to your tenants. Choose how you'd like to deliver it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Recipient Selection */}
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient *</Label>
              <Select
                value={formData.recipientId}
                onValueChange={(value) => setFormData({ ...formData, recipientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="font-medium">All Tenants</span>
                    <span className="text-muted-foreground ml-2">({tenants.length})</span>
                  </SelectItem>
                  {tenants.filter((t) => t.id).map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Enter message subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            {/* Message */}
            <div className="grid gap-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
              />
            </div>

            {/* Delivery Methods */}
            <div className="grid gap-3">
              <Label>Send via *</Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="inApp"
                    checked={channels.inApp}
                    onCheckedChange={(checked) => handleChannelChange('inApp', checked as boolean)}
                  />
                  <Label
                    htmlFor="inApp"
                    className="flex items-center gap-2 font-normal cursor-pointer"
                  >
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    In-App Notification
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="email"
                    checked={channels.email}
                    onCheckedChange={(checked) => handleChannelChange('email', checked as boolean)}
                  />
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 font-normal cursor-pointer"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="sms"
                    checked={channels.sms}
                    onCheckedChange={(checked) => handleChannelChange('sms', checked as boolean)}
                  />
                  <Label
                    htmlFor="sms"
                    className="flex items-center gap-2 font-normal cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    SMS Text Message
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
