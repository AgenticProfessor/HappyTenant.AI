import type { ReportData, ReportRow } from '../types';

/**
 * Formats report data as Tab-Separated Values (TSV) for clipboard
 * This format pastes cleanly into Google Sheets and Excel
 */
export function formatReportForClipboard(report: ReportData): string {
    const lines: string[] = [];

    // 1. Title and Metadata
    lines.push(report.title);
    if (report.dateRange) {
        lines.push(report.dateRange);
    }
    lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
    lines.push(''); // Empty line

    // 2. Column Headers
    const headers = ['Account', ...report.columns.map((col) => col.label)];
    lines.push(headers.join('\t'));

    // 3. Data Rows
    const flatRows = flattenRows(report.rows);

    for (const row of flatRows) {
        // Add indentation for visual hierarchy in the first column
        const indent = '    '.repeat(row.depth);
        const rowName = `${indent}${row.name}`;

        const values = [
            rowName,
            ...report.columns.map((col) => {
                const value = row.values[col.key];
                if (value === null || value === undefined) return '';

                if (typeof value === 'number') {
                    // Format numbers based on column type, but keep them parseable if possible
                    // For clipboard, we often want raw numbers, but for "visual" paste, formatted is better.
                    // Let's stick to formatted for now as it's what users expect to see.
                    if (col.type === 'currency') {
                        return formatCurrency(value);
                    }
                    if (col.type === 'percentage') {
                        return `${value.toFixed(1)}%`;
                    }
                    return value.toString();
                }
                return String(value);
            }),
        ];

        lines.push(values.join('\t'));
    }

    return lines.join('\n');
}

function flattenRows(rows: ReportRow[], result: ReportRow[] = []): ReportRow[] {
    for (const row of rows) {
        result.push(row);
        if (row.children) {
            flattenRows(row.children, result);
        }
    }
    return result;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
