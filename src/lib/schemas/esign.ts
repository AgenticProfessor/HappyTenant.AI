/**
 * E-Sign Types and Schemas
 * Comprehensive type definitions for the electronic signature feature
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const DocumentStatus = {
  DRAFT: 'DRAFT',
  PENDING_SIGNATURES: 'PENDING_SIGNATURES',
  PARTIALLY_SIGNED: 'PARTIALLY_SIGNED',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const SignerRole = {
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT',
  CO_SIGNER: 'CO_SIGNER',
  WITNESS: 'WITNESS',
  OTHER: 'OTHER',
} as const;

export type SignerRole = (typeof SignerRole)[keyof typeof SignerRole];

export const SignatureFieldType = {
  SIGNATURE: 'SIGNATURE',
  INITIALS: 'INITIALS',
  DATE: 'DATE',
  NAME: 'NAME',
  EMAIL: 'EMAIL',
  COMPANY: 'COMPANY',
  TITLE: 'TITLE',
  TEXTBOX: 'TEXTBOX',
  CHECKBOX: 'CHECKBOX',
  DROPDOWN: 'DROPDOWN',
  RADIO: 'RADIO',
} as const;

export type SignatureFieldType = (typeof SignatureFieldType)[keyof typeof SignatureFieldType];

// ============================================================================
// Document Types
// ============================================================================

export interface ESignDocument {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: DocumentStatus;

  // File information
  originalFileUrl: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;

  // Relations
  createdById: string;
  propertyId?: string;
  leaseId?: string;

  // Metadata
  message?: string; // Message to signers
  reminderEnabled: boolean;
  reminderDays: number;
}

// ============================================================================
// Signer Types
// ============================================================================

export interface DocumentSigner {
  id: string;
  documentId: string;

  // Signer info
  name: string;
  email: string;
  phone?: string;
  role: SignerRole;
  order: number; // Signing order (1, 2, 3...)

  // Reference to existing entities
  tenantId?: string;
  userId?: string;

  // Status
  status: 'PENDING' | 'VIEWED' | 'SIGNED' | 'DECLINED';
  viewedAt?: Date;
  signedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;

  // Security
  accessCode?: string; // Optional PIN for access
  signatureIp?: string;
  signatureUserAgent?: string;

  // Avatar color for UI
  color: string;
}

// ============================================================================
// Signature Field Types
// ============================================================================

export interface SignatureField {
  id: string;
  documentId: string;
  signerId: string;

  // Field type
  type: SignatureFieldType;
  label?: string;
  placeholder?: string;
  required: boolean;

  // Position on document
  pageNumber: number;
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  width: number; // Percentage of page width
  height: number; // Percentage of page height

  // Field-specific options
  options?: string[]; // For dropdown/radio
  validation?: string; // Regex pattern for textbox
  maxLength?: number;

  // Value
  value?: string;
  signedAt?: Date;
}

// ============================================================================
// Signature Data Types
// ============================================================================

export interface SignatureData {
  type: 'drawn' | 'typed' | 'uploaded';
  data: string; // Base64 image or text
  fontFamily?: string; // For typed signatures
}

export interface DigitalStamp {
  documentId: string;
  signerId: string;
  timestamp: Date;
  certificateHash: string;
  signatureData: SignatureData;
  ipAddress: string;
  userAgent: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateESignDocumentRequest {
  name: string;
  description?: string;
  propertyId?: string;
  leaseId?: string;
  message?: string;
  expiresAt?: Date;
  reminderEnabled?: boolean;
  reminderDays?: number;
}

export interface AddSignerRequest {
  name: string;
  email: string;
  phone?: string;
  role: SignerRole;
  order?: number;
  tenantId?: string;
  userId?: string;
  accessCode?: string;
}

export interface AddFieldRequest {
  signerId: string;
  type: SignatureFieldType;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface SignFieldRequest {
  fieldId: string;
  value: string;
  signatureData?: SignatureData;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface ESignWizardState {
  step: 'upload' | 'signers' | 'fields' | 'review' | 'sent';
  document: Partial<ESignDocument> | null;
  uploadedFile: File | null;
  uploadedFilePreview: string | null;
  signers: Omit<DocumentSigner, 'id' | 'documentId' | 'status'>[];
  fields: Omit<SignatureField, 'id' | 'documentId'>[];
  message: string;
  isProcessing: boolean;
  error: string | null;
}

export interface FieldDragState {
  isDragging: boolean;
  draggedFieldType: SignatureFieldType | null;
  draggedFieldId: string | null;
  dropPosition: { x: number; y: number; pageNumber: number } | null;
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255),
  description: z.string().max(1000).optional(),
  propertyId: z.string().optional(),
  leaseId: z.string().optional(),
  message: z.string().max(2000).optional(),
  expiresAt: z.coerce.date().optional(),
  reminderEnabled: z.boolean().default(true),
  reminderDays: z.number().int().min(1).max(30).default(3),
});

export const addSignerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['LANDLORD', 'TENANT', 'CO_SIGNER', 'WITNESS', 'OTHER']),
  order: z.number().int().min(1).optional(),
  tenantId: z.string().optional(),
  userId: z.string().optional(),
  accessCode: z.string().min(4).max(10).optional(),
});

export const addFieldSchema = z.object({
  signerId: z.string().min(1),
  type: z.enum([
    'SIGNATURE',
    'INITIALS',
    'DATE',
    'NAME',
    'EMAIL',
    'COMPANY',
    'TITLE',
    'TEXTBOX',
    'CHECKBOX',
    'DROPDOWN',
    'RADIO',
  ]),
  pageNumber: z.number().int().min(1),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(1).max(100),
  height: z.number().min(1).max(100),
  label: z.string().max(255).optional(),
  placeholder: z.string().max(255).optional(),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),
});

// ============================================================================
// Constants
// ============================================================================

export const SIGNER_COLORS = [
  '#3B82F6', // Blue
  '#F97316', // Orange
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#EF4444', // Red
];

export const DEFAULT_FIELD_SIZES: Record<SignatureFieldType, { width: number; height: number }> = {
  SIGNATURE: { width: 20, height: 6 },
  INITIALS: { width: 8, height: 6 },
  DATE: { width: 15, height: 4 },
  NAME: { width: 25, height: 4 },
  EMAIL: { width: 25, height: 4 },
  COMPANY: { width: 25, height: 4 },
  TITLE: { width: 20, height: 4 },
  TEXTBOX: { width: 30, height: 4 },
  CHECKBOX: { width: 3, height: 3 },
  DROPDOWN: { width: 20, height: 4 },
  RADIO: { width: 15, height: 8 },
};

export const FIELD_LABELS: Record<SignatureFieldType, string> = {
  SIGNATURE: 'Signature',
  INITIALS: 'Initials',
  DATE: 'Date Signed',
  NAME: 'Full Name',
  EMAIL: 'Email Address',
  COMPANY: 'Company',
  TITLE: 'Title',
  TEXTBOX: 'Text Field',
  CHECKBOX: 'Checkbox',
  DROPDOWN: 'Dropdown',
  RADIO: 'Radio Group',
};
