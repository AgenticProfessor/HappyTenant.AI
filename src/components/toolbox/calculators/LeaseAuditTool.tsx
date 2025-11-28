'use client';

import { useState } from 'react';
import { FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LeaseAuditToolProps {
  onClose?: () => void;
}

interface AuditIssue {
  severity: 'critical' | 'warning' | 'suggestion';
  title: string;
  description: string;
  clause?: string;
}

interface AuditResult {
  score: number;
  issues: AuditIssue[];
  missingClauses: string[];
  stateCompliance: {
    compliant: boolean;
    details: string[];
  };
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export function LeaseAuditTool({ onClose }: LeaseAuditToolProps) {
  const [selectedState, setSelectedState] = useState('CA');
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const analyzeLeaseAgreement = () => {
    if (!file) return;

    setAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      // Simulated results - in production, this would call an AI API
      setResult({
        score: 78,
        issues: [
          {
            severity: 'critical',
            title: 'Missing Lead Paint Disclosure',
            description: 'Federal law requires lead paint disclosure for properties built before 1978.',
            clause: 'Add EPA-approved lead paint disclosure form as an addendum.',
          },
          {
            severity: 'warning',
            title: 'Security Deposit Clause Needs Update',
            description: `${selectedState} law limits security deposits. Your current clause may exceed state limits.`,
            clause: 'Section 3: Security Deposit',
          },
          {
            severity: 'warning',
            title: 'Late Fee Grace Period Not Specified',
            description: 'Consider adding a grace period before late fees apply for tenant clarity.',
            clause: 'Section 5: Late Fees',
          },
          {
            severity: 'suggestion',
            title: 'Add Lease Renewal Terms',
            description: 'Consider adding automatic renewal or month-to-month conversion terms.',
          },
          {
            severity: 'suggestion',
            title: 'Maintenance Request Procedure',
            description: 'Add clear instructions for how tenants should submit maintenance requests.',
          },
        ],
        missingClauses: [
          'Mold disclosure statement',
          'Bed bug policy',
          'Renters insurance requirement',
          'Pet policy (if applicable)',
          'Move-out inspection procedure',
        ],
        stateCompliance: {
          compliant: false,
          details: [
            `${selectedState} requires specific language for security deposit return timeline`,
            `Entry notice requirements need to specify ${selectedState}'s minimum notice period`,
            'Eviction procedure references may need updating for current state law',
          ],
        },
      });
      setAnalyzing(false);
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <>
          {/* AI Badge */}
          <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-700 dark:text-purple-300">
              AI-powered lease analysis for compliance and issues
            </span>
          </div>

          {/* State Selection */}
          <div>
            <Label htmlFor="state">Property State</Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Lease will be checked against {selectedState} landlord-tenant laws
            </p>
          </div>

          {/* File Upload */}
          <div>
            <Label>Upload Lease Agreement</Label>
            <div className="mt-2">
              <label
                htmlFor="lease-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                  "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
                  "border-gray-300 dark:border-gray-700",
                  file && "border-green-500 bg-green-50 dark:bg-green-950"
                )}
              >
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOC, DOCX, or TXT</p>
                  </div>
                )}
                <input
                  id="lease-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <Button
            onClick={analyzeLeaseAgreement}
            className="w-full"
            disabled={!file || analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Lease...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Lease Agreement
              </>
            )}
          </Button>

          {analyzing && (
            <div className="space-y-2">
              <Progress value={66} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                AI is reviewing your lease for compliance issues...
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Score Card */}
          <Card className={cn(
            result.score >= 80
              ? "bg-green-50 border-green-200 dark:bg-green-950"
              : result.score >= 60
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950"
              : "bg-red-50 border-red-200 dark:bg-red-950"
          )}>
            <CardContent className="pt-6 text-center">
              <p className={cn("text-5xl font-bold", getScoreColor(result.score))}>
                {result.score}
              </p>
              <p className={cn("text-lg font-medium", getScoreColor(result.score))}>
                {getScoreLabel(result.score)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Compliance Score
              </p>
            </CardContent>
          </Card>

          {/* Issues Found */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Issues Found ({result.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.issues.map((issue, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border",
                    issue.severity === 'critical' && "bg-red-50 border-red-200 dark:bg-red-950",
                    issue.severity === 'warning' && "bg-yellow-50 border-yellow-200 dark:bg-yellow-950",
                    issue.severity === 'suggestion' && "bg-blue-50 border-blue-200 dark:bg-blue-950"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {issue.severity === 'critical' && (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    {issue.severity === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    {issue.severity === 'suggestion' && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{issue.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {issue.description}
                      </p>
                      {issue.clause && (
                        <p className="text-xs text-primary mt-1">
                          Affected: {issue.clause}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Missing Clauses */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Recommended Additions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.missingClauses.map((clause, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    {clause}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* State Compliance */}
          <Card className={cn(
            result.stateCompliance.compliant
              ? "bg-green-50 border-green-200"
              : "bg-orange-50 border-orange-200"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {result.stateCompliance.compliant ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
                {selectedState} State Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.stateCompliance.details.map((detail, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1">
              Download Report
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
            >
              Analyze Another
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
