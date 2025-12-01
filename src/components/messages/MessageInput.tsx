'use client';

import { useState, useRef, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Paperclip, Sparkles, X, Image, File, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onAiAssist?: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showAiAssist?: boolean;
}

export function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
  onAiAssist,
  placeholder = 'Type a message...',
  disabled = false,
  showAiAssist = true,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle content change with typing indicators
  const handleContentChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);

      // Typing indicator logic
      if (value && !isTyping) {
        setIsTyping(true);
        onTypingStart?.();
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          onTypingStop?.();
        }
      }, 2000);
    },
    [isTyping, onTypingStart, onTypingStop]
  );

  // Handle send
  const handleSend = useCallback(() => {
    const trimmedContent = content.trim();
    if (!trimmedContent && attachments.length === 0) return;

    onSend(trimmedContent, attachments.length > 0 ? attachments : undefined);
    setContent('');
    setAttachments([]);

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [content, attachments, isTyping, onSend, onTypingStop]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Handle file selection
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    // Reset input
    e.target.value = '';
  }, []);

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle AI assist
  const handleAiAssist = useCallback(() => {
    if (onAiAssist) {
      onAiAssist(content);
    }
  }, [content, onAiAssist]);

  // Auto-resize textarea
  const handleTextareaInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  const canSend = content.trim() || attachments.length > 0;

  return (
    <div className="border-t p-4">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm"
            >
              {file.type.startsWith('image/') ? (
                <Image className="h-4 w-4 text-muted-foreground" />
              ) : (
                <File className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={disabled}>
                  <Paperclip className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Attach file</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Image className="h-4 w-4 mr-2" />
              Photo or Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <File className="h-4 w-4 mr-2" />
              Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onInput={handleTextareaInput}
          disabled={disabled}
          rows={1}
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
        />

        {/* AI Assist button */}
        {showAiAssist && onAiAssist && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAiAssist}
                disabled={disabled}
                className="text-primary"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI Assist</TooltipContent>
          </Tooltip>
        )}

        {/* Send button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={disabled || !canSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send message</TooltipContent>
        </Tooltip>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send &bull; Shift+Enter for new line
      </p>
    </div>
  );
}
