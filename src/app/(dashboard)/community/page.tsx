'use client';

import { useState } from 'react';
import {
  Users,
  MessageCircle,
  BookOpen,
  Video,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Eye,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Star,
  Award,
  TrendingUp,
  Bookmark,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    badge?: string;
  };
  category: string;
  replies: number;
  views: number;
  likes: number;
  createdAt: string;
  isPinned?: boolean;
  isHot?: boolean;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'checklist' | 'ebook';
  downloadCount: number;
  rating: number;
  image?: string;
}

interface Webinar {
  id: string;
  title: string;
  description: string;
  speaker: string;
  date: string;
  time: string;
  duration: string;
  isLive: boolean;
  isRecorded: boolean;
  attendees?: number;
  thumbnail?: string;
}

// Mock data
const forumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'How do you handle late rent payments?',
    content: 'Looking for advice on handling tenants who consistently pay late...',
    author: { name: 'Sarah M.', badge: 'Pro Landlord' },
    category: 'Rent Collection',
    replies: 24,
    views: 342,
    likes: 18,
    createdAt: '2 hours ago',
    isHot: true
  },
  {
    id: '2',
    title: 'Best practices for tenant screening in 2024',
    content: 'What criteria do you use for screening tenants? Looking to update my process...',
    author: { name: 'Mike R.', badge: 'Verified Landlord' },
    category: 'Screening',
    replies: 31,
    views: 456,
    likes: 27,
    createdAt: '5 hours ago',
    isPinned: true
  },
  {
    id: '3',
    title: 'Security deposit return timeline by state',
    content: 'Can someone clarify the deposit return rules? I have properties in multiple states...',
    author: { name: 'Jennifer K.' },
    category: 'Legal',
    replies: 15,
    views: 198,
    likes: 12,
    createdAt: '1 day ago'
  },
  {
    id: '4',
    title: 'DIY maintenance vs hiring professionals',
    content: 'When do you decide to DIY vs call a pro? Trying to balance costs...',
    author: { name: 'David L.', badge: 'Handy Landlord' },
    category: 'Maintenance',
    replies: 42,
    views: 567,
    likes: 35,
    createdAt: '2 days ago',
    isHot: true
  },
  {
    id: '5',
    title: 'Raising rent: How much is too much?',
    content: 'Market rates have increased significantly. How do you approach rent increases?',
    author: { name: 'Amanda P.' },
    category: 'Rent Collection',
    replies: 28,
    views: 389,
    likes: 22,
    createdAt: '3 days ago'
  }
];

const resources: Resource[] = [
  {
    id: '1',
    title: 'Complete Landlord Starter Guide',
    description: 'Everything you need to know as a first-time landlord',
    type: 'ebook',
    downloadCount: 5420,
    rating: 4.9
  },
  {
    id: '2',
    title: 'Tenant Screening Checklist',
    description: 'Step-by-step checklist for thorough tenant screening',
    type: 'checklist',
    downloadCount: 3210,
    rating: 4.8
  },
  {
    id: '3',
    title: 'Move-In/Move-Out Inspection Form',
    description: 'Document property condition with this detailed template',
    type: 'template',
    downloadCount: 4150,
    rating: 4.7
  },
  {
    id: '4',
    title: 'State-by-State Legal Guide',
    description: 'Landlord-tenant laws for all 50 states',
    type: 'guide',
    downloadCount: 2890,
    rating: 4.9
  },
  {
    id: '5',
    title: 'Property Marketing Templates',
    description: 'Professional listing templates and photography tips',
    type: 'template',
    downloadCount: 1870,
    rating: 4.6
  },
  {
    id: '6',
    title: 'Maintenance Request Workflow',
    description: 'Streamline your maintenance process',
    type: 'guide',
    downloadCount: 2340,
    rating: 4.7
  }
];

const webinars: Webinar[] = [
  {
    id: '1',
    title: 'Maximizing Rental Income in 2024',
    description: 'Learn strategies to increase your rental yield without major renovations',
    speaker: 'John Davis, Property Investment Expert',
    date: 'Dec 5, 2024',
    time: '2:00 PM EST',
    duration: '60 min',
    isLive: true,
    isRecorded: false,
    attendees: 156
  },
  {
    id: '2',
    title: 'Navigating Fair Housing Laws',
    description: 'Essential compliance tips to avoid legal issues',
    speaker: 'Lisa Chen, Real Estate Attorney',
    date: 'Dec 12, 2024',
    time: '1:00 PM EST',
    duration: '45 min',
    isLive: true,
    isRecorded: false,
    attendees: 89
  },
  {
    id: '3',
    title: 'DIY Property Management 101',
    description: 'Manage your properties like a pro without hiring a property manager',
    speaker: 'Mark Thompson, Self-Managing Landlord',
    date: 'Nov 28, 2024',
    time: '3:00 PM EST',
    duration: '75 min',
    isLive: false,
    isRecorded: true
  },
  {
    id: '4',
    title: 'Tax Strategies for Landlords',
    description: 'Maximize deductions and minimize tax liability',
    speaker: 'Sarah Williams, CPA',
    date: 'Nov 21, 2024',
    time: '2:00 PM EST',
    duration: '60 min',
    isLive: false,
    isRecorded: true
  }
];

const categories = [
  'All Categories',
  'Rent Collection',
  'Screening',
  'Legal',
  'Maintenance',
  'Marketing',
  'Tax & Finance',
  'General Discussion'
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('forum');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    // In a real app, this would create a new post
    setNewPostDialogOpen(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostCategory('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow landlords, access resources, and learn from experts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            12,450 members
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">2,341</p>
                <p className="text-sm text-muted-foreground">Discussions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Resources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">48</p>
                <p className="text-sm text-muted-foreground">Webinars</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">Expert Answers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="forum" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Forum
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="webinars" className="gap-2">
            <Video className="h-4 w-4" />
            Webinars
          </TabsTrigger>
        </TabsList>

        {/* Forum Tab */}
        <TabsContent value="forum" className="mt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={newPostDialogOpen} onOpenChange={setNewPostDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Discussion</DialogTitle>
                  <DialogDescription>
                    Share your question or topic with the community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="postTitle">Title</Label>
                    <Input
                      id="postTitle"
                      placeholder="What's your question or topic?"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postCategory">Category</Label>
                    <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== 'All Categories').map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postContent">Details</Label>
                    <Textarea
                      id="postContent"
                      placeholder="Provide more details about your question..."
                      rows={4}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewPostDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost}>
                    Post Discussion
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.isPinned && (
                              <Badge variant="secondary" className="text-xs">
                                Pinned
                              </Badge>
                            )}
                            {post.isHot && (
                              <Badge variant="destructive" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Hot
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold mt-1 hover:text-primary">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {post.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{post.author.name}</span>
                          {post.author.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {post.author.badge}
                            </Badge>
                          )}
                          <span>•</span>
                          <span>{post.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {post.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {post.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search resources..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="checklist">Checklists</SelectItem>
                <SelectItem value="ebook">E-Books</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      resource.type === 'guide' ? 'bg-blue-100' :
                      resource.type === 'template' ? 'bg-green-100' :
                      resource.type === 'checklist' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      <BookOpen className={`h-5 w-5 ${
                        resource.type === 'guide' ? 'text-blue-600' :
                        resource.type === 'template' ? 'text-green-600' :
                        resource.type === 'checklist' ? 'text-purple-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {resource.type}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {resource.rating}
                      </div>
                      <span>•</span>
                      <span>{resource.downloadCount.toLocaleString()} downloads</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1" size="sm">
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webinars Tab */}
        <TabsContent value="webinars" className="mt-6">
          <div className="space-y-6">
            {/* Upcoming Webinars */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Webinars
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webinars.filter(w => w.isLive).map((webinar) => (
                  <Card key={webinar.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-red-500">
                          <span className="animate-pulse mr-1">●</span>
                          Upcoming Live
                        </Badge>
                        <span className="text-sm text-muted-foreground">{webinar.duration}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{webinar.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{webinar.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{webinar.speaker}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{webinar.date} at {webinar.time}</span>
                        </div>
                        {webinar.attendees && (
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>{webinar.attendees} registered</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1">Register Now</Button>
                        <Button variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Past Webinars */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5" />
                Past Recordings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webinars.filter(w => w.isRecorded).map((webinar) => (
                  <Card key={webinar.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary">Recording Available</Badge>
                        <span className="text-sm text-muted-foreground">{webinar.duration}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{webinar.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{webinar.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{webinar.speaker}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Recorded on {webinar.date}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Watch Recording
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Featured Experts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Featured Community Experts
          </CardTitle>
          <CardDescription>
            Top contributors who help fellow landlords succeed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Sarah Mitchell', title: 'Property Tax Expert', posts: 156, helpful: 423 },
              { name: 'David Chen', title: 'Legal Advisor', posts: 89, helpful: 312 },
              { name: 'Maria Garcia', title: 'Maintenance Pro', posts: 234, helpful: 567 },
              { name: 'James Wilson', title: 'Investment Guru', posts: 178, helpful: 445 }
            ].map((expert, i) => (
              <div key={i} className="text-center p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                <Avatar className="h-16 w-16 mx-auto mb-3">
                  <AvatarFallback className="text-lg">{expert.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h4 className="font-semibold">{expert.name}</h4>
                <p className="text-sm text-muted-foreground">{expert.title}</p>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{expert.posts} posts</span>
                  <span>•</span>
                  <span>{expert.helpful} helpful</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
