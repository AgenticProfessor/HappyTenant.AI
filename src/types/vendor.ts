export type VendorCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliance'
  | 'general_handyman'
  | 'locksmith'
  | 'pest_control'
  | 'cleaning'
  | 'landscaping'
  | 'roofing'
  | 'flooring'
  | 'painting';

export interface WorkingHours {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface Vendor {
  id: string;
  organizationId: string;
  name: string;                   // Company name "Mike's Plumbing"
  contactName: string;            // "Mike Johnson"
  phone: string;
  email: string;
  categories: VendorCategory[];
  serviceArea: string[];          // ZIP codes or city names
  workingHours: {
    monday: WorkingHours | null;
    tuesday: WorkingHours | null;
    wednesday: WorkingHours | null;
    thursday: WorkingHours | null;
    friday: WorkingHours | null;
    saturday: WorkingHours | null;
    sunday: WorkingHours | null;
  };
  emergencyAvailable: boolean;
  emergencyPhone?: string;
  hourlyRate?: number;
  minimumCharge?: number;
  priceTier: 'budget' | 'mid' | 'premium';
  rating: number;                 // 1-5 stars
  totalJobs: number;
  onTimePercentage: number;
  preferredContactMethod: 'phone' | 'text' | 'email';
  callInstructions?: string;
  status: 'active' | 'inactive' | 'on_vacation';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Export helper type for vendor form
export interface VendorFormData {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  categories: VendorCategory[];
  serviceArea: string[];
  workingHours: Vendor['workingHours'];
  emergencyAvailable: boolean;
  emergencyPhone?: string;
  hourlyRate?: number;
  minimumCharge?: number;
  priceTier: 'budget' | 'mid' | 'premium';
  preferredContactMethod: 'phone' | 'text' | 'email';
  callInstructions?: string;
  notes?: string;
}

// Category display info
export const VENDOR_CATEGORIES: { value: VendorCategory; label: string; icon: string }[] = [
  { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'hvac', label: 'HVAC', icon: '❄️' },
  { value: 'appliance', label: 'Appliance Repair', icon: '🔌' },
  { value: 'general_handyman', label: 'General Handyman', icon: '🛠️' },
  { value: 'locksmith', label: 'Locksmith', icon: '🔐' },
  { value: 'pest_control', label: 'Pest Control', icon: '🐜' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'landscaping', label: 'Landscaping', icon: '🌳' },
  { value: 'roofing', label: 'Roofing', icon: '🏠' },
  { value: 'flooring', label: 'Flooring', icon: '🪵' },
  { value: 'painting', label: 'Painting', icon: '🎨' },
];

export const PRICE_TIERS = [
  { value: 'budget', label: 'Budget', description: 'Most affordable option' },
  { value: 'mid', label: 'Mid-Range', description: 'Balance of cost and quality' },
  { value: 'premium', label: 'Premium', description: 'Highest quality service' },
];
