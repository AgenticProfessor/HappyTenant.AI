'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  ESignWizardState,
  DocumentSigner,
  SignatureField,
  SignatureFieldType,
  SignerRole,
} from '@/lib/schemas/esign';
import { SIGNER_COLORS, DEFAULT_FIELD_SIZES } from '@/lib/schemas/esign';

// ============================================================================
// Actions
// ============================================================================

type ESignAction =
  | { type: 'SET_STEP'; step: ESignWizardState['step'] }
  | { type: 'SET_FILE'; file: File; preview: string }
  | { type: 'CLEAR_FILE' }
  | { type: 'SET_DOCUMENT_INFO'; name: string; description?: string }
  | { type: 'ADD_SIGNER'; signer: Omit<DocumentSigner, 'id' | 'documentId' | 'status'> }
  | { type: 'UPDATE_SIGNER'; index: number; signer: Partial<Omit<DocumentSigner, 'id' | 'documentId' | 'status'>> }
  | { type: 'REMOVE_SIGNER'; index: number }
  | { type: 'REORDER_SIGNERS'; fromIndex: number; toIndex: number }
  | { type: 'ADD_FIELD'; field: Omit<SignatureField, 'id' | 'documentId'> }
  | { type: 'UPDATE_FIELD'; index: number; field: Partial<Omit<SignatureField, 'id' | 'documentId'>> }
  | { type: 'REMOVE_FIELD'; index: number }
  | { type: 'SET_MESSAGE'; message: string }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };

// ============================================================================
// Initial State
// ============================================================================

const initialState: ESignWizardState = {
  step: 'upload',
  document: null,
  uploadedFile: null,
  uploadedFilePreview: null,
  signers: [],
  fields: [],
  message: '',
  isProcessing: false,
  error: null,
};

// ============================================================================
// Reducer
// ============================================================================

function eSignReducer(state: ESignWizardState, action: ESignAction): ESignWizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step, error: null };

    case 'SET_FILE':
      return {
        ...state,
        uploadedFile: action.file,
        uploadedFilePreview: action.preview,
        document: {
          ...state.document,
          name: action.file.name.replace(/\.[^/.]+$/, ''),
          originalFileName: action.file.name,
          fileSize: action.file.size,
          mimeType: action.file.type,
        },
      };

    case 'CLEAR_FILE':
      return {
        ...state,
        uploadedFile: null,
        uploadedFilePreview: null,
        document: null,
        fields: [],
      };

    case 'SET_DOCUMENT_INFO':
      return {
        ...state,
        document: {
          ...state.document,
          name: action.name,
          description: action.description,
        },
      };

    case 'ADD_SIGNER':
      return {
        ...state,
        signers: [...state.signers, action.signer],
      };

    case 'UPDATE_SIGNER':
      return {
        ...state,
        signers: state.signers.map((s, i) =>
          i === action.index ? { ...s, ...action.signer } : s
        ),
      };

    case 'REMOVE_SIGNER': {
      const removedSignerIndex = action.index;
      return {
        ...state,
        signers: state.signers.filter((_, i) => i !== action.index),
        // Also remove fields assigned to this signer
        fields: state.fields.filter(
          (f) => f.signerId !== state.signers[removedSignerIndex]?.email
        ),
      };
    }

    case 'REORDER_SIGNERS': {
      const newSigners = [...state.signers];
      const [removed] = newSigners.splice(action.fromIndex, 1);
      newSigners.splice(action.toIndex, 0, removed);
      // Update order numbers
      return {
        ...state,
        signers: newSigners.map((s, i) => ({ ...s, order: i + 1 })),
      };
    }

    case 'ADD_FIELD':
      return {
        ...state,
        fields: [...state.fields, action.field],
      };

    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: state.fields.map((f, i) =>
          i === action.index ? { ...f, ...action.field } : f
        ),
      };

    case 'REMOVE_FIELD':
      return {
        ...state,
        fields: state.fields.filter((_, i) => i !== action.index),
      };

    case 'SET_MESSAGE':
      return { ...state, message: action.message };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.isProcessing };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface ESignContextType {
  state: ESignWizardState;
  dispatch: React.Dispatch<ESignAction>;

  // Helper actions
  setStep: (step: ESignWizardState['step']) => void;
  setFile: (file: File, preview: string) => void;
  clearFile: () => void;
  setDocumentInfo: (name: string, description?: string) => void;
  addSigner: (signer: {
    name: string;
    email: string;
    phone?: string;
    role: SignerRole;
    tenantId?: string;
    userId?: string;
  }) => void;
  updateSigner: (index: number, signer: Partial<DocumentSigner>) => void;
  removeSigner: (index: number) => void;
  addField: (
    signerId: string,
    type: SignatureFieldType,
    pageNumber: number,
    x: number,
    y: number
  ) => void;
  updateField: (index: number, field: Partial<SignatureField>) => void;
  removeField: (index: number) => void;
  setMessage: (message: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computed values
  canProceedToSigners: boolean;
  canProceedToFields: boolean;
  canProceedToReview: boolean;
  canSend: boolean;
  getSignerColor: (signerEmail: string) => string;
  getFieldsForSigner: (signerEmail: string) => Omit<SignatureField, 'id' | 'documentId'>[];
}

const ESignContext = createContext<ESignContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function ESignProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(eSignReducer, initialState);

  // Helper actions
  const setStep = useCallback((step: ESignWizardState['step']) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const setFile = useCallback((file: File, preview: string) => {
    dispatch({ type: 'SET_FILE', file, preview });
  }, []);

  const clearFile = useCallback(() => {
    dispatch({ type: 'CLEAR_FILE' });
  }, []);

  const setDocumentInfo = useCallback((name: string, description?: string) => {
    dispatch({ type: 'SET_DOCUMENT_INFO', name, description });
  }, []);

  const addSigner = useCallback(
    (signer: {
      name: string;
      email: string;
      phone?: string;
      role: SignerRole;
      tenantId?: string;
      userId?: string;
    }) => {
      const order = state.signers.length + 1;
      const color = SIGNER_COLORS[(state.signers.length) % SIGNER_COLORS.length];
      dispatch({
        type: 'ADD_SIGNER',
        signer: { ...signer, order, color },
      });
    },
    [state.signers.length]
  );

  const updateSigner = useCallback(
    (index: number, signer: Partial<DocumentSigner>) => {
      dispatch({ type: 'UPDATE_SIGNER', index, signer });
    },
    []
  );

  const removeSigner = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_SIGNER', index });
  }, []);

  const addField = useCallback(
    (
      signerId: string,
      type: SignatureFieldType,
      pageNumber: number,
      x: number,
      y: number
    ) => {
      const defaults = DEFAULT_FIELD_SIZES[type];
      dispatch({
        type: 'ADD_FIELD',
        field: {
          signerId,
          type,
          pageNumber,
          x,
          y,
          width: defaults.width,
          height: defaults.height,
          required: true,
        },
      });
    },
    []
  );

  const updateField = useCallback(
    (index: number, field: Partial<SignatureField>) => {
      dispatch({ type: 'UPDATE_FIELD', index, field });
    },
    []
  );

  const removeField = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FIELD', index });
  }, []);

  const setMessage = useCallback((message: string) => {
    dispatch({ type: 'SET_MESSAGE', message });
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', isProcessing });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Computed values
  const canProceedToSigners = !!state.uploadedFile && !!state.document?.name;
  const canProceedToFields = state.signers.length > 0;
  const canProceedToReview = state.fields.length > 0;
  const canSend =
    canProceedToSigners && canProceedToFields && canProceedToReview;

  const getSignerColor = useCallback(
    (signerEmail: string) => {
      const signer = state.signers.find((s) => s.email === signerEmail);
      return signer?.color || SIGNER_COLORS[0];
    },
    [state.signers]
  );

  const getFieldsForSigner = useCallback(
    (signerEmail: string) => {
      return state.fields.filter((f) => f.signerId === signerEmail);
    },
    [state.fields]
  );

  const value: ESignContextType = {
    state,
    dispatch,
    setStep,
    setFile,
    clearFile,
    setDocumentInfo,
    addSigner,
    updateSigner,
    removeSigner,
    addField,
    updateField,
    removeField,
    setMessage,
    setProcessing,
    setError,
    reset,
    canProceedToSigners,
    canProceedToFields,
    canProceedToReview,
    canSend,
    getSignerColor,
    getFieldsForSigner,
  };

  return (
    <ESignContext.Provider value={value}>{children}</ESignContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useESign() {
  const context = useContext(ESignContext);
  if (!context) {
    throw new Error('useESign must be used within an ESignProvider');
  }
  return context;
}
