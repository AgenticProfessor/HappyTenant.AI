/**
 * Maintenance Triage Module for Steward AI
 * Handles maintenance request categorization, urgency scoring, and vendor matching
 */

import { BaseModule, type ModuleContext, type ModuleResponse } from './base-module';
import type { AIModuleType, AIToolDefinition } from '../providers/types';

export interface MaintenanceCategory {
  primary: string;
  secondary?: string;
  confidence: number;
}

export interface UrgencyAssessment {
  score: number; // 1-10
  level: 'emergency' | 'high' | 'medium' | 'low';
  factors: string[];
  responseTimeTarget: string;
  safetyRisk: boolean;
  propertyRisk: boolean;
}

export interface VendorRecommendation {
  vendorId: string;
  vendorName: string;
  matchScore: number;
  specialties: string[];
  avgRating: number;
  estimatedCost: {
    low: number;
    high: number;
  };
  availability: string;
  rationale: string;
}

export interface TriageResult {
  category: MaintenanceCategory;
  urgency: UrgencyAssessment;
  vendorRecommendations: VendorRecommendation[];
  suggestedResponse: string;
  estimatedResolutionTime: string;
  requiredPermissions: string[];
}

export class MaintenanceTriageModule extends BaseModule {
  readonly moduleName: AIModuleType = 'maintenance';
  readonly displayName = 'Maintenance Triage';
  readonly description = 'Categorize requests, assess urgency, and match vendors';

  public getSystemPrompt(): string {
    return `You are an expert property maintenance coordinator with deep knowledge of:
- Building systems (HVAC, plumbing, electrical, structural)
- Emergency vs routine maintenance classification
- Vendor specializations and capabilities
- Cost estimation for common repairs
- Safety and code compliance

Your role is to:
1. Categorize maintenance requests accurately
2. Assess urgency based on safety, property damage risk, and tenant impact
3. Recommend appropriate vendors based on issue type and history
4. Estimate costs and resolution times
5. Identify when professional inspection is needed

Urgency Scoring (1-10):
- 9-10: EMERGENCY - Immediate safety/property risk (gas leak, flooding, no heat in winter)
- 7-8: HIGH - Significant impact, needs same-day attention (AC broken in summer, water heater failure)
- 4-6: MEDIUM - Important but can wait 24-48 hours (appliance issues, minor leaks)
- 1-3: LOW - Routine maintenance, can be scheduled (cosmetic, minor repairs)

Category Classification:
- Plumbing: Water supply, drains, fixtures, water heater
- Electrical: Outlets, switches, lighting, circuits, panel
- HVAC: Heating, cooling, ventilation, thermostats
- Appliance: Refrigerator, stove, dishwasher, washer/dryer
- Structural: Doors, windows, floors, walls, roof
- Pest Control: Insects, rodents, wildlife
- Landscaping: Lawn, trees, irrigation
- General: Locks, paint, cleaning, other

Always consider:
- Tenant safety first
- Property protection second
- Cost efficiency third`;
  }

  protected getTools(): AIToolDefinition[] {
    return [
      {
        name: 'categorize_issue',
        description: 'Categorize a maintenance request based on description',
        parameters: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'The maintenance issue description from tenant',
            },
            photos: {
              type: 'array',
              items: { type: 'string' },
              description: 'URLs to photos of the issue (optional)',
            },
          },
          required: ['description'],
        },
      },
      {
        name: 'assess_urgency',
        description: 'Assess the urgency of a maintenance request',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'The category of the issue',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the issue',
            },
            propertyType: {
              type: 'string',
              enum: ['apartment', 'house', 'condo', 'townhouse'],
              description: 'Type of property',
            },
            season: {
              type: 'string',
              enum: ['spring', 'summer', 'fall', 'winter'],
              description: 'Current season (affects HVAC urgency)',
            },
          },
          required: ['category', 'description'],
        },
      },
      {
        name: 'find_vendors',
        description: 'Find and rank vendors for a maintenance issue',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Category of maintenance needed',
            },
            urgency: {
              type: 'string',
              enum: ['emergency', 'high', 'medium', 'low'],
              description: 'Urgency level',
            },
            propertyId: {
              type: 'string',
              description: 'Property ID for location-based matching',
            },
            budget: {
              type: 'number',
              description: 'Maximum budget (optional)',
            },
          },
          required: ['category', 'urgency'],
        },
      },
      {
        name: 'estimate_cost',
        description: 'Estimate repair costs based on issue type',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Category of repair',
            },
            issueType: {
              type: 'string',
              description: 'Specific type of issue',
            },
            severity: {
              type: 'string',
              enum: ['minor', 'moderate', 'major'],
              description: 'Severity of the issue',
            },
          },
          required: ['category', 'issueType'],
        },
      },
      {
        name: 'generate_work_order',
        description: 'Generate a work order for a maintenance request',
        parameters: {
          type: 'object',
          properties: {
            requestId: {
              type: 'string',
              description: 'The maintenance request ID',
            },
            vendorId: {
              type: 'string',
              description: 'Selected vendor ID',
            },
            scheduledDate: {
              type: 'string',
              description: 'Scheduled date for the work',
            },
            notes: {
              type: 'string',
              description: 'Additional notes for the vendor',
            },
          },
          required: ['requestId', 'vendorId'],
        },
      },
    ];
  }

  /**
   * Perform full triage on a maintenance request
   */
  async triageRequest(
    context: ModuleContext,
    description: string,
    propertyType?: string,
    photoUrls?: string[]
  ): Promise<ModuleResponse<TriageResult>> {
    const userMessage = `Triage this maintenance request:

Description: "${description}"
Property Type: ${propertyType || 'Unknown'}
Photos: ${photoUrls?.length ? `${photoUrls.length} photos attached` : 'None'}

Provide:
1. Category (primary and secondary)
2. Urgency score (1-10) with factors
3. Top 3 vendor recommendations
4. Suggested tenant response
5. Estimated resolution time
6. Any special permissions needed (entry, utility shutoff, etc.)`;

    return this.executeWithLogging(
      context,
      'triage_request',
      {
        systemPrompt: this.getSystemPrompt(),
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 1500,
        temperature: 0.3,
      },
      (response) => {
        // Parse AI response - mock implementation
        return this.parseTriageResponse(description);
      }
    );
  }

  /**
   * Execute a tool by name
   */
  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'categorize_issue':
        return this.categorizeIssue(args.description as string);

      case 'assess_urgency':
        return this.assessUrgency(
          args.category as string,
          args.description as string,
          args.season as string
        );

      case 'find_vendors':
        return this.findVendors(
          args.category as string,
          args.urgency as string
        );

      case 'estimate_cost':
        return this.estimateCost(
          args.category as string,
          args.issueType as string,
          args.severity as string
        );

      case 'generate_work_order':
        return {
          workOrderId: `WO-${Date.now()}`,
          status: 'created',
          scheduledDate: args.scheduledDate,
          vendorNotified: true,
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private categorizeIssue(description: string): MaintenanceCategory {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('water') || lowerDesc.includes('leak') || lowerDesc.includes('drain') || lowerDesc.includes('toilet')) {
      return { primary: 'plumbing', confidence: 0.9 };
    }
    if (lowerDesc.includes('heat') || lowerDesc.includes('ac') || lowerDesc.includes('air') || lowerDesc.includes('temperature')) {
      return { primary: 'hvac', confidence: 0.9 };
    }
    if (lowerDesc.includes('electric') || lowerDesc.includes('outlet') || lowerDesc.includes('light') || lowerDesc.includes('power')) {
      return { primary: 'electrical', confidence: 0.9 };
    }
    if (lowerDesc.includes('refrigerator') || lowerDesc.includes('stove') || lowerDesc.includes('dishwasher') || lowerDesc.includes('washer')) {
      return { primary: 'appliance', confidence: 0.9 };
    }
    if (lowerDesc.includes('door') || lowerDesc.includes('window') || lowerDesc.includes('floor') || lowerDesc.includes('wall')) {
      return { primary: 'structural', confidence: 0.85 };
    }
    if (lowerDesc.includes('bug') || lowerDesc.includes('pest') || lowerDesc.includes('mouse') || lowerDesc.includes('roach')) {
      return { primary: 'pest-control', confidence: 0.95 };
    }

    return { primary: 'general', confidence: 0.6 };
  }

  private assessUrgency(category: string, description: string, season?: string): UrgencyAssessment {
    const lowerDesc = description.toLowerCase();
    const factors: string[] = [];
    let score = 5;
    let safetyRisk = false;
    let propertyRisk = false;

    // Emergency keywords
    if (lowerDesc.includes('gas') || lowerDesc.includes('smell gas')) {
      score = 10;
      safetyRisk = true;
      factors.push('Potential gas leak - immediate danger');
    }
    if (lowerDesc.includes('flood') || lowerDesc.includes('burst')) {
      score = Math.max(score, 9);
      propertyRisk = true;
      factors.push('Active water damage');
    }
    if (lowerDesc.includes('no heat') && season === 'winter') {
      score = Math.max(score, 9);
      safetyRisk = true;
      factors.push('No heat in winter - health hazard');
    }
    if (lowerDesc.includes('no power') || lowerDesc.includes('electrical fire')) {
      score = Math.max(score, 9);
      safetyRisk = true;
      factors.push('Electrical safety concern');
    }

    // High priority keywords
    if (lowerDesc.includes('no hot water')) {
      score = Math.max(score, 7);
      factors.push('Essential service unavailable');
    }
    if (lowerDesc.includes('ac') && season === 'summer') {
      score = Math.max(score, 7);
      factors.push('AC failure in summer');
    }

    const level: UrgencyAssessment['level'] =
      score >= 9 ? 'emergency' :
      score >= 7 ? 'high' :
      score >= 4 ? 'medium' : 'low';

    const responseTimeTarget =
      level === 'emergency' ? '1-2 hours' :
      level === 'high' ? 'Same day' :
      level === 'medium' ? '24-48 hours' : '3-5 business days';

    return {
      score,
      level,
      factors,
      responseTimeTarget,
      safetyRisk,
      propertyRisk,
    };
  }

  private findVendors(category: string, urgency: string): VendorRecommendation[] {
    // Mock vendor recommendations - in production, query database
    return [
      {
        vendorId: 'vendor-1',
        vendorName: 'Quick Fix Plumbing',
        matchScore: 0.95,
        specialties: ['plumbing', 'water-heater'],
        avgRating: 4.8,
        estimatedCost: { low: 150, high: 400 },
        availability: urgency === 'emergency' ? 'Available now' : 'Next available: Tomorrow 9am',
        rationale: 'Top-rated vendor with emergency availability',
      },
      {
        vendorId: 'vendor-2',
        vendorName: 'Reliable Repairs',
        matchScore: 0.88,
        specialties: ['general', 'plumbing', 'hvac'],
        avgRating: 4.5,
        estimatedCost: { low: 125, high: 350 },
        availability: 'Next available: Tomorrow 2pm',
        rationale: 'Good value, experienced with property',
      },
      {
        vendorId: 'vendor-3',
        vendorName: 'Pro Maintenance Co',
        matchScore: 0.82,
        specialties: ['general', category],
        avgRating: 4.3,
        estimatedCost: { low: 100, high: 300 },
        availability: 'Next available: 2 days',
        rationale: 'Budget-friendly option',
      },
    ];
  }

  private estimateCost(category: string, issueType: string, severity: string = 'moderate'): { low: number; high: number; average: number } {
    const baseCosts: Record<string, { low: number; high: number }> = {
      'plumbing': { low: 150, high: 500 },
      'electrical': { low: 150, high: 400 },
      'hvac': { low: 200, high: 800 },
      'appliance': { low: 100, high: 600 },
      'structural': { low: 200, high: 1000 },
      'pest-control': { low: 100, high: 300 },
      'general': { low: 75, high: 250 },
    };

    const base = baseCosts[category] || baseCosts['general'];
    const multiplier = severity === 'major' ? 1.5 : severity === 'minor' ? 0.6 : 1;

    return {
      low: Math.round(base.low * multiplier),
      high: Math.round(base.high * multiplier),
      average: Math.round((base.low + base.high) / 2 * multiplier),
    };
  }

  private parseTriageResponse(description: string): TriageResult {
    const category = this.categorizeIssue(description);
    const urgency = this.assessUrgency(category.primary, description);
    const vendors = this.findVendors(category.primary, urgency.level);

    return {
      category,
      urgency,
      vendorRecommendations: vendors,
      suggestedResponse: `Thank you for reporting this ${category.primary} issue. We've categorized this as ${urgency.level} priority and are working to schedule a technician. Expected response time: ${urgency.responseTimeTarget}.`,
      estimatedResolutionTime: urgency.level === 'emergency' ? '2-4 hours' : urgency.level === 'high' ? '24 hours' : '2-3 days',
      requiredPermissions: urgency.safetyRisk ? ['emergency-entry', 'utility-shutoff'] : [],
    };
  }
}
