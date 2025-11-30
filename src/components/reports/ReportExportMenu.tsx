'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ExternalLink,
  Loader2,
  Copy,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ReportType, ReportFilters, ExportFormat, ReportData } from '@/lib/reports/types';
import { formatReportForClipboard } from '@/lib/reports/export/clipboard-utils';

interface ReportExportMenuProps {
  reportType: ReportType;
  filters: ReportFilters;
  disabled?: boolean;
  // We need the actual report data for clipboard copy
  // In a real app, we might fetch it again or pass it down. 
  // For now, let's assume we might need to fetch it if not passed, 
  // but to keep it simple, we'll fetch the report data again from the API for the clipboard action
  // or better yet, if the parent component has it, it should pass it.
  // Let's check if we can modify the parent to pass data, or just fetch it here.
  // Looking at the usage in [type]/page.tsx, it passes `disabled={isLoading || !reportData}`.
  // We should add `reportData` prop.
  reportData?: ReportData | null;
}

export function ReportExportMenu({ reportType, filters, disabled, reportData }: ReportExportMenuProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format);

    try {
      const response = await fetch(`/api/reports/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, filters }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Handle different export types
      if (format === 'google-sheets') {
        const data = await response.json();
        if (data.success) {
          // For now, this is still a stub in the backend, but we can show a toast explaining the copy workflow
          // if the backend returns a specific message or url.
          if (data.url && !data.url.includes('simulated')) {
            window.open(data.url, '_blank');
            toast.success('Opened in Google Sheets');
          } else {
            // Fallback for the stub
            toast.info(
              'Google Sheets integration is being set up. Pro tip: Use "Copy to Clipboard" and paste directly into Sheets!',
              { duration: 5000 }
            );
          }
        } else {
          toast.error(data.message || 'Export failed');
        }
      } else if (format === 'quickbooks') {
        // Download the QB-friendly CSV
        const blob = await response.blob();
        downloadBlob(blob, `${reportType}-quickbooks.csv`);
        toast.success('Downloaded QuickBooks-ready CSV');
      } else {
        // Handle standard file download (csv, excel, pdf)
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${reportType}-report.${format}`;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) {
            filename = match[1];
          }
        }

        // If it's PDF, it might be HTML to print
        if (format === 'pdf' && blob.type === 'text/html') {
          const url = window.URL.createObjectURL(blob);
          const printWindow = window.open(url, '_blank');
          if (printWindow) {
            printWindow.onload = () => {
              printWindow.print();
            };
          }
          toast.success('Prepared report for printing/PDF');
        } else {
          downloadBlob(blob, filename);
          toast.success(`Report exported as ${format.toUpperCase()}`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleCopyToClipboard = async () => {
    if (!reportData) {
      toast.error('No data to copy');
      return;
    }

    setIsCopying(true);
    try {
      const text = formatReportForClipboard(reportData);
      await navigator.clipboard.writeText(text);
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-medium">Copied to clipboard!</span>
          <span className="text-xs opacity-90">Ready to paste into Excel or Google Sheets</span>
        </div>
      );
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    } finally {
      setTimeout(() => setIsCopying(false), 1000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting !== null}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCopyToClipboard} disabled={!reportData}>
          {isCopying ? (
            <ClipboardCheck className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          Copy to Clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Download</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting !== null}
        >
          <FileText className="h-4 w-4 mr-2" />
          Download CSV
          {isExporting === 'csv' && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={isExporting !== null}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Download Excel
          {isExporting === 'excel' && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting !== null}
        >
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
          {isExporting === 'pdf' && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Integrations</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => handleExport('google-sheets')}
          disabled={isExporting !== null}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Google Sheets
          {isExporting === 'google-sheets' && (
            <Loader2 className="h-4 w-4 ml-auto animate-spin" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('quickbooks')}
          disabled={isExporting !== null}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          QuickBooks Format
          {isExporting === 'quickbooks' && (
            <Loader2 className="h-4 w-4 ml-auto animate-spin" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('xero')}
          disabled={isExporting !== null}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Xero Format
          {isExporting === 'xero' && (
            <Loader2 className="h-4 w-4 ml-auto animate-spin" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('wave')}
          disabled={isExporting !== null}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Wave Format
          {isExporting === 'wave' && (
            <Loader2 className="h-4 w-4 ml-auto animate-spin" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
