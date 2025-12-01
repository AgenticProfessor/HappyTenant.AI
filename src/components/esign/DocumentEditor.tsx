'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Type,
  Calendar,
  User,
  Mail,
  Building2,
  Briefcase,
  AlignLeft,
  CheckSquare,
  ChevronDown,
  Radio,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Hand,
  Move,
  HelpCircle,
  Lightbulb,
  LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useESign } from './ESignContext';
import {
  SignatureFieldType,
  FIELD_LABELS,
  DEFAULT_FIELD_SIZES,
} from '@/lib/schemas/esign';

// Field type icons
const FIELD_ICONS: Record<SignatureFieldType, LucideIcon> = {
  SIGNATURE: PenTool,
  INITIALS: Type,
  DATE: Calendar,
  NAME: User,
  EMAIL: Mail,
  COMPANY: Building2,
  TITLE: Briefcase,
  TEXTBOX: AlignLeft,
  CHECKBOX: CheckSquare,
  DROPDOWN: ChevronDown,
  RADIO: Radio,
};

function getFieldIcon(type: SignatureFieldType): LucideIcon {
  return FIELD_ICONS[type];
}

// Field categories
const SIGNATURE_FIELDS: SignatureFieldType[] = ['SIGNATURE', 'INITIALS'];
const AUTO_FILL_FIELDS: SignatureFieldType[] = ['DATE', 'NAME', 'EMAIL', 'COMPANY', 'TITLE'];
const STANDARD_FIELDS: SignatureFieldType[] = ['TEXTBOX', 'CHECKBOX', 'DROPDOWN', 'RADIO'];

interface DraggableFieldProps {
  type: SignatureFieldType;
  onDragStart: (type: SignatureFieldType) => void;
}

function DraggableField({ type, onDragStart }: DraggableFieldProps) {
  const Icon = getFieldIcon(type);

  return (
    <motion.div
      draggable
      onDragStart={() => onDragStart(type)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing hover:border-primary/50 hover:bg-primary/5 transition-colors"
    >
      <div className="p-2 rounded-md bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <span className="text-sm font-medium">{FIELD_LABELS[type]}</span>
    </motion.div>
  );
}

interface PlacedFieldProps {
  field: {
    signerId: string;
    type: SignatureFieldType;
    x: number;
    y: number;
    width: number;
    height: number;
    required: boolean;
  };
  index: number;
  signerColor: string;
  signerName: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updates: { x?: number; y?: number; width?: number; height?: number }) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function PlacedField({
  field,
  index,
  signerColor,
  signerName,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  containerRef,
}: PlacedFieldProps) {
  const Icon = getFieldIcon(field.type);
  const [isDragging, setIsDragging] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('fieldIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={fieldRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        'absolute cursor-move group',
        isSelected && 'z-10'
      )}
      style={{
        left: `${field.x}%`,
        top: `${field.y}%`,
        width: `${field.width}%`,
        height: `${field.height}%`,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={cn(
          'size-full rounded border-2 flex items-center justify-center gap-1 transition-all',
          isSelected
            ? 'border-solid shadow-lg'
            : 'border-dashed group-hover:border-solid group-hover:shadow-md'
        )}
        style={{
          borderColor: signerColor,
          backgroundColor: `${signerColor}15`,
        }}
      >
        <Icon className="size-3" style={{ color: signerColor }} />
        <span
          className="text-[10px] font-medium truncate"
          style={{ color: signerColor }}
        >
          {FIELD_LABELS[field.type]}
        </span>
      </motion.div>

      {/* Delete button */}
      {isSelected && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white shadow-md hover:bg-destructive/90"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="size-3" />
        </motion.button>
      )}

      {/* Signer indicator */}
      <div
        className="absolute -bottom-5 left-0 text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
        style={{ backgroundColor: signerColor, color: 'white' }}
      >
        {signerName}
      </div>

      {/* Resize handles */}
      {isSelected && (
        <>
          <div
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-6 bg-white border rounded cursor-ew-resize"
            style={{ borderColor: signerColor }}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-6 bg-white border rounded cursor-ns-resize"
            style={{ borderColor: signerColor }}
          />
        </>
      )}
    </div>
  );
}

export function DocumentEditor() {
  const {
    state,
    addField,
    updateField,
    removeField,
    setStep,
    canProceedToReview,
    getSignerColor,
  } = useESign();

  const [selectedSigner, setSelectedSigner] = useState<string>(
    state.signers[0]?.email || ''
  );
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [showInstructions, setShowInstructions] = useState(true);
  const [draggingFieldType, setDraggingFieldType] = useState<SignatureFieldType | null>(null);
  const documentContainerRef = useRef<HTMLDivElement>(null);

  // Handle drop on document
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const container = documentContainerRef.current;
      if (!container || !selectedSigner) return;

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Check if dropping an existing field (repositioning)
      const fieldIndexStr = e.dataTransfer.getData('fieldIndex');
      if (fieldIndexStr) {
        const fieldIndex = parseInt(fieldIndexStr, 10);
        updateField(fieldIndex, { x: Math.max(0, Math.min(x, 80)), y: Math.max(0, Math.min(y, 90)) });
        return;
      }

      // Check if dropping a new field type
      if (draggingFieldType) {
        addField(
          selectedSigner,
          draggingFieldType,
          currentPage,
          Math.max(0, Math.min(x, 80)),
          Math.max(0, Math.min(y, 90))
        );
        setDraggingFieldType(null);
      }
    },
    [selectedSigner, draggingFieldType, currentPage, addField, updateField]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragStart = (type: SignatureFieldType) => {
    setDraggingFieldType(type);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const selectedSignerData = state.signers.find((s) => s.email === selectedSigner);

  return (
    <div className="flex h-[calc(100vh-300px)] min-h-[600px] gap-6">
      {/* Left Sidebar - Instructions & Fields */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4">
        {/* Instructions Panel */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Lightbulb className="size-4 text-primary" />
                      How It Works
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => setShowInstructions(false)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      1
                    </div>
                    <p className="text-muted-foreground">Select a signer from the dropdown</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      2
                    </div>
                    <p className="text-muted-foreground">Drag fields onto the document</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      3
                    </div>
                    <p className="text-muted-foreground">Repeat for each signer</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signer Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Signer</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSigner} onValueChange={setSelectedSigner}>
              <SelectTrigger>
                <SelectValue placeholder="Select signer">
                  {selectedSignerData && (
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: selectedSignerData.color }}
                      />
                      <span className="truncate">{selectedSignerData.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {state.signers.map((signer) => (
                  <SelectItem key={signer.email} value={signer.email}>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback
                          className="text-[10px]"
                          style={{ backgroundColor: signer.color, color: 'white' }}
                        >
                          {getInitials(signer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{signer.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Fields Panel */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-sm font-semibold">Fields</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 px-4 pb-4">
            <div className="space-y-4">
              {/* Signature Fields */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Signature Fields
                </p>
                <div className="space-y-2">
                  {SIGNATURE_FIELDS.map((type) => (
                    <DraggableField
                      key={type}
                      type={type}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>

              {/* Auto-fill Fields */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Auto-fill Fields
                </p>
                <div className="space-y-2">
                  {AUTO_FILL_FIELDS.map((type) => (
                    <DraggableField
                      key={type}
                      type={type}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>

              {/* Standard Fields */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Standard Fields
                </p>
                <div className="space-y-2">
                  {STANDARD_FIELDS.map((type) => (
                    <DraggableField
                      key={type}
                      type={type}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Document Preview Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                    <ZoomOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                    <ZoomIn className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled={currentPage <= 1}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium">Page {currentPage} of 1</span>
            <Button variant="ghost" size="icon" disabled={currentPage >= 1}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              <HelpCircle className="size-3 mr-1" />
              Help
            </Button>
          </div>
        </div>

        {/* Document Canvas */}
        <div className="flex-1 bg-muted/50 rounded-lg overflow-auto p-8 flex items-center justify-center">
          <div
            ref={documentContainerRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => setSelectedFieldIndex(null)}
            className="relative bg-white shadow-2xl rounded-sm"
            style={{
              width: `${(8.5 * 96 * zoom) / 100}px`,
              height: `${(11 * 96 * zoom) / 100}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Document Preview Placeholder */}
            {state.uploadedFilePreview ? (
              state.uploadedFile?.type === 'application/pdf' ? (
                <div className="size-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-4 p-8">
                    <div className="size-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <PenTool className="size-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{state.document?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        PDF Preview (drag fields to place them)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={state.uploadedFilePreview}
                  alt="Document preview"
                  className="size-full object-contain"
                />
              )
            ) : (
              <div className="size-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <Move className="size-12 mx-auto opacity-50" />
                  <p className="text-sm">Document preview area</p>
                </div>
              </div>
            )}

            {/* Placed Fields */}
            <AnimatePresence>
              {state.fields
                .filter((f) => f.pageNumber === currentPage)
                .map((field, index) => {
                  const signer = state.signers.find((s) => s.email === field.signerId);
                  if (!signer) return null;

                  const actualIndex = state.fields.findIndex(
                    (f) => f === field
                  );

                  return (
                    <PlacedField
                      key={`${field.signerId}-${field.type}-${index}`}
                      field={field}
                      index={actualIndex}
                      signerColor={signer.color}
                      signerName={signer.name}
                      isSelected={selectedFieldIndex === actualIndex}
                      onSelect={() => setSelectedFieldIndex(actualIndex)}
                      onDelete={() => {
                        removeField(actualIndex);
                        setSelectedFieldIndex(null);
                      }}
                      onUpdate={(updates) => updateField(actualIndex, updates)}
                      containerRef={documentContainerRef}
                    />
                  );
                })}
            </AnimatePresence>

            {/* Drop indicator */}
            {draggingFieldType && (
              <div className="absolute inset-0 border-4 border-dashed border-primary/50 rounded bg-primary/5 pointer-events-none flex items-center justify-center">
                <p className="text-primary font-medium">Drop field here</p>
              </div>
            )}
          </div>
        </div>

        {/* Field Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            {state.signers.map((signer) => {
              const fieldCount = state.fields.filter(
                (f) => f.signerId === signer.email
              ).length;
              return (
                <div key={signer.email} className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: signer.color }}
                  />
                  <span className="text-sm">
                    {signer.name.split(' ')[0]}: {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {state.fields.length} fields
          </div>
        </div>
      </div>

      {/* Right Sidebar - Selected Field Properties */}
      <div className="w-64 flex-shrink-0">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PenTool className="size-4" />
              Field Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFieldIndex !== null && state.fields[selectedFieldIndex] ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Field Type</p>
                  <p className="font-medium">
                    {FIELD_LABELS[state.fields[selectedFieldIndex].type]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor: state.signers.find(
                          (s) => s.email === state.fields[selectedFieldIndex].signerId
                        )?.color,
                      }}
                    />
                    <span className="font-medium">
                      {state.signers.find(
                        (s) => s.email === state.fields[selectedFieldIndex].signerId
                      )?.name}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      removeField(selectedFieldIndex);
                      setSelectedFieldIndex(null);
                    }}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Remove Field
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <PenTool className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a field to edit its properties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Navigation component for the editor step
export function DocumentEditorStep() {
  const { setStep, canProceedToReview, state } = useESign();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Place Signature Fields</h2>
        <p className="text-muted-foreground mt-1">
          Drag and drop fields onto the document to indicate where each signer should sign
        </p>
      </div>

      <DocumentEditor />

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setStep('signers')}>
          Back
        </Button>
        <Button
          onClick={() => setStep('review')}
          disabled={!canProceedToReview}
          size="lg"
          className="min-w-[200px]"
        >
          Next: Review & Send
        </Button>
      </div>
    </div>
  );
}
