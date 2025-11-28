'use client';

import { useState } from 'react';
import {
  Gift,
  Copy,
  Share2,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  ChevronRight,
  Award,
  TrendingUp,
  Sparkles,
  Send,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

// Types
interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'signed_up' | 'subscribed' | 'expired';
  invitedAt: string;
  signedUpAt?: string;
  subscribedAt?: string;
  reward?: number;
}

interface Reward {
  id: string;
  type: 'cash' | 'credit';
  amount: number;
  status: 'pending' | 'paid' | 'credited';
  referralName: string;
  date: string;
}

// Mock data
const mockReferrals: Referral[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    status: 'subscribed',
    invitedAt: 'Nov 1, 2024',
    signedUpAt: 'Nov 3, 2024',
    subscribedAt: 'Nov 10, 2024',
    reward: 50
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    status: 'signed_up',
    invitedAt: 'Nov 15, 2024',
    signedUpAt: 'Nov 18, 2024'
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike.brown@email.com',
    status: 'pending',
    invitedAt: 'Nov 20, 2024'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    status: 'subscribed',
    invitedAt: 'Oct 25, 2024',
    signedUpAt: 'Oct 28, 2024',
    subscribedAt: 'Nov 5, 2024',
    reward: 50
  },
  {
    id: '5',
    name: 'Chris Wilson',
    email: 'chris.w@email.com',
    status: 'expired',
    invitedAt: 'Sep 1, 2024'
  }
];

const mockRewards: Reward[] = [
  {
    id: '1',
    type: 'cash',
    amount: 50,
    status: 'paid',
    referralName: 'John Smith',
    date: 'Nov 15, 2024'
  },
  {
    id: '2',
    type: 'cash',
    amount: 50,
    status: 'paid',
    referralName: 'Emily Davis',
    date: 'Nov 10, 2024'
  },
  {
    id: '3',
    type: 'credit',
    amount: 25,
    status: 'credited',
    referralName: 'Sarah Johnson',
    date: 'Nov 20, 2024'
  }
];

const tiers = [
  { referrals: 0, reward: 50, bonus: 0, name: 'Starter' },
  { referrals: 5, reward: 75, bonus: 100, name: 'Bronze' },
  { referrals: 10, reward: 100, bonus: 250, name: 'Silver' },
  { referrals: 25, reward: 150, bonus: 500, name: 'Gold' },
  { referrals: 50, reward: 200, bonus: 1000, name: 'Platinum' }
];

export default function ReferralsPage() {
  const [referralLink] = useState('https://happytenant.com/ref/USER123');
  const [referrals] = useState(mockReferrals);
  const [rewards] = useState(mockRewards);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState(
    "Hey! I've been using Happy Tenant to manage my rental properties and it's been amazing. I thought you might find it useful too. Use my referral link to get started with a free trial!"
  );
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Calculate stats
  const totalReferrals = referrals.length;
  const successfulReferrals = referrals.filter(r => r.status === 'subscribed').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'signed_up').length;
  const totalEarned = rewards.reduce((sum, r) => sum + r.amount, 0);

  // Calculate current tier
  const currentTier = [...tiers].reverse().find(t => successfulReferrals >= t.referrals) || tiers[0];
  const nextTier = tiers.find(t => t.referrals > successfulReferrals);
  const progressToNextTier = nextTier
    ? ((successfulReferrals - currentTier.referrals) / (nextTier.referrals - currentTier.referrals)) * 100
    : 100;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const handleSendInvites = () => {
    const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) {
      toast.error('Please enter at least one email address');
      return;
    }
    toast.success(`Invitations sent to ${emails.length} people!`);
    setInviteDialogOpen(false);
    setInviteEmails('');
  };

  const getStatusBadge = (status: Referral['status']) => {
    switch (status) {
      case 'subscribed':
        return <Badge className="bg-green-500">Subscribed</Badge>;
      case 'signed_up':
        return <Badge className="bg-blue-500">Signed Up</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground">
            Invite friends and earn rewards for every successful referral
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Send className="h-4 w-4 mr-2" />
              Invite Friends
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite Friends</DialogTitle>
              <DialogDescription>
                Send personalized invitations to your friends and colleagues
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="emails">Email Addresses</Label>
                <Input
                  id="emails"
                  placeholder="email1@example.com, email2@example.com"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple emails with commas
                </p>
              </div>
              <div>
                <Label htmlFor="message">Personal Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendInvites}>
                <Send className="h-4 w-4 mr-2" />
                Send Invitations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalReferrals}</p>
                <p className="text-sm text-muted-foreground">Total Invited</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{successfulReferrals}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReferrals}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalEarned}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link to earn ${currentTier.reward} for each friend who subscribes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" title="Share on Twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Share on Facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Share on LinkedIn">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Share via Email">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Referral Tier: {currentTier.name}
              </CardTitle>
              <CardDescription>
                Earn ${currentTier.reward} per successful referral
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {successfulReferrals} / {nextTier?.referrals || '50+'} referrals
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {nextTier && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Progress to {nextTier.name}
                </span>
                <span className="text-sm font-medium">
                  {nextTier.referrals - successfulReferrals} more referrals needed
                </span>
              </div>
              <Progress value={progressToNextTier} className="h-3" />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`p-4 rounded-lg border-2 text-center ${
                  tier.name === currentTier.name
                    ? 'border-primary bg-primary/5'
                    : successfulReferrals >= tier.referrals
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className={`text-lg font-bold ${
                  tier.name === currentTier.name ? 'text-primary' : ''
                }`}>
                  {tier.name}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {tier.referrals}+ referrals
                </div>
                <div className="text-xl font-bold mt-2 text-green-600">
                  ${tier.reward}
                </div>
                <div className="text-xs text-muted-foreground">per referral</div>
                {tier.bonus > 0 && (
                  <Badge className="mt-2 bg-yellow-500">
                    +${tier.bonus} bonus
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Referrals and Rewards */}
      <Tabs defaultValue="referrals">
        <TabsList>
          <TabsTrigger value="referrals" className="gap-2">
            <Users className="h-4 w-4" />
            My Referrals
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Rewards History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead>Signed Up</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead className="text-right">Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{referral.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{referral.name}</p>
                            <p className="text-sm text-muted-foreground">{referral.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                      <TableCell>{referral.invitedAt}</TableCell>
                      <TableCell>{referral.signedUpAt || '-'}</TableCell>
                      <TableCell>{referral.subscribedAt || '-'}</TableCell>
                      <TableCell className="text-right">
                        {referral.reward ? (
                          <span className="font-semibold text-green-600">${referral.reward}</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Referral</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${
                            reward.type === 'cash' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <DollarSign className={`h-4 w-4 ${
                              reward.type === 'cash' ? 'text-green-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <span className="capitalize">{reward.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">${reward.amount}</span>
                      </TableCell>
                      <TableCell>{reward.referralName}</TableCell>
                      <TableCell>{reward.date}</TableCell>
                      <TableCell>
                        <Badge className={
                          reward.status === 'paid' || reward.status === 'credited'
                            ? 'bg-green-500'
                            : ''
                        }>
                          {reward.status === 'paid' ? 'Paid' :
                           reward.status === 'credited' ? 'Credited' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            How Referrals Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold">1. Share Your Link</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Send your unique referral link to friends and colleagues
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold">2. They Sign Up</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Your friend creates an account using your link
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold">3. They Subscribe</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Once they subscribe to any paid plan, you qualify
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold">4. Get Paid</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Receive your reward via PayPal or account credit
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Referrers This Month
              </CardTitle>
              <CardDescription>See how you stack up against other landlords</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View Full Leaderboard
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Alex Thompson', referrals: 23, reward: '$2,300' },
              { rank: 2, name: 'Maria Garcia', referrals: 18, reward: '$1,800' },
              { rank: 3, name: 'James Wilson', referrals: 15, reward: '$1,125' },
              { rank: 4, name: 'You', referrals: successfulReferrals, reward: `$${totalEarned}`, isYou: true },
              { rank: 5, name: 'Chris Lee', referrals: 8, reward: '$400' }
            ].sort((a, b) => b.referrals - a.referrals).map((entry, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.isYou ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                    i === 0 ? 'bg-yellow-100 text-yellow-600' :
                    i === 1 ? 'bg-gray-200 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={entry.isYou ? 'font-semibold' : ''}>
                    {entry.name}
                  </span>
                  {entry.isYou && <Badge>You</Badge>}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold">{entry.referrals}</p>
                    <p className="text-xs text-muted-foreground">referrals</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{entry.reward}</p>
                    <p className="text-xs text-muted-foreground">earned</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
