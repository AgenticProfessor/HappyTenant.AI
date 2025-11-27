// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'landlord' | 'tenant' | 'admin';
  createdAt: Date;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'individual' | 'company';
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
}

// Property Types
export interface Property {
  id: string;
  organizationId: string;
  name: string;
  type: 'single_family' | 'multi_family' | 'apartment' | 'condo' | 'townhouse' | 'commercial';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  yearBuilt?: number;
  squareFeet?: number;
  purchasePrice?: number;
  currentValue?: number;
  photos: string[];
  status: 'active' | 'inactive' | 'sold';
  createdAt: Date;
  units: Unit[];
}

// Unit Types
export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  name?: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  floorNumber?: number;
  features: string[];
  marketRent: number;
  depositAmount: number;
  status: 'vacant' | 'occupied' | 'notice_given' | 'maintenance' | 'off_market';
  availableDate?: Date;
  isListed: boolean;
  listingDescription?: string;
  listingPhotos: string[];
  aiRentRecommendation?: number;
  currentTenant?: Tenant;
  currentLease?: Lease;
}

// Tenant Types
export interface Tenant {
  id: string;
  organizationId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  screeningStatus?: 'not_started' | 'pending' | 'passed' | 'failed' | 'review_needed';
  employerName?: string;
  monthlyIncome?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  aiRiskScore?: number;
  createdAt: Date;
}

// Lease Types
export interface Lease {
  id: string;
  unitId: string;
  leaseType: 'fixed' | 'month_to_month' | 'week_to_week';
  startDate: Date;
  endDate?: Date;
  rentAmount: number;
  rentDueDay: number;
  securityDeposit: number;
  petDeposit?: number;
  lateFeeAmount: number;
  lateFeeGraceDays: number;
  status: 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated' | 'renewed';
  tenants: Tenant[];
  createdAt: Date;
}

// Transaction Types
export interface Transaction {
  id: string;
  organizationId: string;
  leaseId?: string;
  tenantId?: string;
  type: 'rent' | 'deposit' | 'late_fee' | 'utility' | 'maintenance' | 'refund' | 'other_income' | 'expense';
  category?: string;
  description?: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  dueDate?: Date;
  paidAt?: Date;
  createdAt: Date;
}

// Maintenance Types
export interface MaintenanceRequest {
  id: string;
  unitId: string;
  tenantId?: string;
  reportedByUserId?: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest_control' | 'landscaping' | 'cleaning' | 'other';
  priority: 'emergency' | 'high' | 'medium' | 'low';
  isEmergency: boolean;
  photos: string[];
  status: 'submitted' | 'acknowledged' | 'scheduled' | 'in_progress' | 'pending_parts' | 'completed' | 'cancelled';
  assignedToUserId?: string;
  assignedToVendorId?: string;
  scheduledDate?: Date;
  scheduledTimeStart?: string;
  scheduledTimeEnd?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  estimatedCost?: number;
  actualCost?: number;
  tenantRating?: number;
  tenantFeedback?: string;
  aiCategorySuggestion?: string;
  aiPrioritySuggestion?: string;
  entryPermissionGranted: boolean;
  entryInstructions?: string;
  createdAt: Date;
}

// Message Types
export interface Conversation {
  id: string;
  organizationId: string;
  type: 'landlord_tenant' | 'internal' | 'ai_assistant' | 'support';
  contextType?: string;
  contextId?: string;
  status: 'active' | 'archived';
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  participants: ConversationParticipant[];
  messages: Message[];
  createdAt: Date;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId?: string;
  tenantId?: string;
  role: 'owner' | 'participant' | 'ai_agent';
  unreadCount: number;
  lastReadAt?: Date;
  isMuted: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUserId?: string;
  senderTenantId?: string;
  isAiGenerated: boolean;
  content: string;
  contentType: 'text' | 'image' | 'file' | 'system' | 'ai_suggestion';
  attachments: string[];
  aiSentiment?: string;
  aiSuggestedResponse?: string;
  channel: 'in_app' | 'sms' | 'email' | 'whatsapp';
  sentAt: Date;
  deliveredAt?: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId?: string;
  tenantId?: string;
  type: string;
  title: string;
  body?: string;
  actionUrl?: string;
  actionType?: string;
  channels: string[];
  readAt?: Date;
  sentAt?: Date;
  createdAt: Date;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  expectedRent: number;
  collectedRent: number;
  collectionRate: number;
  pendingPayments: number;
  overduePayments: number;
  openMaintenanceRequests: number;
  unreadMessages: number;
}

// AI Insight Types
export interface AIInsight {
  id: string;
  type: 'rent_optimization' | 'maintenance_prediction' | 'collection_risk' | 'market_analysis' | 'lease_renewal';
  title: string;
  description: string;
  impact?: string;
  actionLabel?: string;
  actionUrl?: string;
  confidence: number;
  createdAt: Date;
}

// Document Types
export interface Document {
  id: string;
  organizationId: string;
  name: string;
  type: 'lease' | 'template' | 'receipt' | 'insurance' | 'inspection' | 'notice' | 'other';
  category: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  leaseId?: string;
  signatureStatus?: 'pending' | 'signed' | 'expired' | 'not_required';
  uploadedByUserId: string;
  uploadedAt: Date;
  lastAccessedAt?: Date;
  tags?: string[];
  description?: string;
}
