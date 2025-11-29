'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ReportType, ReportFilters, ExportFormat } from '@/lib/reports/types';

interface ReportExportMenuProps {
  reportType: ReportType;
  filters: ReportFilters;
  disabled?: boolean;
}

export function ReportExportMenu({ reportType, filters, disabled }: ReportExportMenuProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);

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
      if (format === 'google-sheets' || format === 'quickbooks') {
        const data = await response.json();
        if (data.success) {
          if (data.url) {
            toast.success(
              <div className="flex flex-col gap-1">
                <span>Export successful!</span>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  Open in Google Sheets
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>,
              { duration: 10000 }
            );
          } else {
            toast.success(data.message || 'Export successful!');
          }
        } else {
          toast.error(data.message || 'Export failed');
        }
      } else {
        // Handle file download
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${reportType}-report.${format}`;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) {
            filename = match[1];
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Report exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report. Please try again.');
    } finally {
      setIsExporting(null);
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

        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport('google-sheets')}
          disabled={isExporting !== null}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Send to Google Sheets
          {isExporting === 'google-sheets' && (
            <Loader2 className="h-4 w-4 ml-auto animate-spin" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('quickbooks')}
          disabled={isExporting !== null}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Export to QuickBooks
          {isExporting === 'quickbooks' && (
            <Loader2 className="h-4 w-4 ml-auto animate-spin" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
