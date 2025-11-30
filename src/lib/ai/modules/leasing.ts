/**
 * Leasing Module for Steward AI
 * Handles property listings, applicant screening, and lease optimization
 */

import { BaseModule, type ModuleContext, type ModuleResponse } from './base-module';
import type { AIModuleType, AIToolDefinition } from '../providers/types';

export interface PropertyListing {
  headline: string;
  description: string;
  highlights: string[];
  amenities: string[];
  neighborhoodInfo: string;
  callToAction: string;
  seoKeywords: string[];
}

export interface ApplicantScreening {
  score: number; // 0-100
  recommendation: 'approve' | 'review' | 'decline';
  riskLevel: 'low' | 'medium' | 'high';
  strengths: string[];
  concerns: string[];
  suggestedQuestions: string[];
  incomeToRentRatio: number;
}

export interface RentAnalysis {
  currentRent: number;
  marketRent: number;
  suggestedRent: number;
  percentageVsMarket: number;
  comparables: Array<{
    address: string;
    rent: number;
    beds: number;
    baths: number;
    sqft: number;
  }>;
  recommendation: string;
  optimalListingPrice: {
    aggressive: number;
    market: number;
    conservative: number;
  };
}

export interface LeaseRenewalStrategy {
  currentTenantValue: number;
  retentionRisk: 'low' | 'medium' | 'high';
  suggestedIncrease: {
    percentage: number;
    amount: number;
    newRent: number;
  };
  incentives: string[];
  timing: string;
  approach: 'aggressive' | 'moderate' | 'retention-focused';
  rationale: string;
}

export class LeasingModule extends BaseModule {
  readonly moduleName: AIModuleType = 'leasing';
  readonly displayName = 'Leasing & Listings';
  readonly description = 'Generate listings, screen applicants, and optimize leasing';

  public getSystemPrompt(): string {
    return `You are an expert real estate leasing specialist with expertise in:
- Writing compelling property listings that convert
- Screening tenant applications for risk
- Market rent analysis and pricing strategy
- Lease renewal negotiations and retention
- Fair housing compliance

Your role is to:
1. Create engaging property listings that highlight unique features
2. Analyze applications objectively and identify red flags
3. Provide market-based rent recommendations
4. Develop retention strategies for quality tenants
5. Ensure all practices comply with fair housing laws

Listing Writing Guidelines:
- Lead with the most compelling feature
- Use active, descriptive language
- Include specific details (square footage, upgrades, views)
- Mention neighborhood highlights (transit, dining, parks)
- End with clear call to action

Screening Guidelines:
- Income should be 2.5-3x monthly rent
- Credit score thresholds: 700+ (excellent), 650-699 (good), 600-649 (fair), <600 (concerning)
- Look for stable employment history (2+ years preferred)
- Check rental history for evictions, late payments
- Verify references
- NEVER discriminate based on protected classes

IMPORTANT: All screening must comply with Fair Housing Act. Base decisions only on:
- Income and employment verification
- Credit history
- Rental history
- Criminal background (where legally permitted)
- Reference checks`;
  }

  protected getTools(): AIToolDefinition[] {
    return [
      {
        name: 'generate_listing',
        description: 'Generate a compelling property listing',
        parameters: {
          type: 'object',
          properties: {
            propertyData: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                beds: { type: 'number' },
                baths: { type: 'number' },
                sqft: { type: 'number' },
                rent: { type: 'number' },
                features: { type: 'array', items: { type: 'string' } },
                propertyType: { type: 'string' },
              },
              required: ['address', 'beds', 'baths', 'rent'],
            },
            tone: {
              type: 'string',
              enum: ['professional', 'casual', 'luxury', 'family-friendly'],
              description: 'Desired tone of the listing',
            },
            platform: {
              type: 'string',
              enum: ['zillow', 'apartments.com', 'craigslist', 'facebook', 'general'],
              description: 'Target platform for the listing',
            },
          },
          required: ['propertyData'],
        },
      },
      {
        name: 'screen_applicant',
        description: 'Screen a rental application',
        parameters: {
          type: 'object',
          properties: {
            applicantData: {
              type: 'object',
              properties: {
                monthlyIncome: { type: 'number' },
                creditScore: { type: 'number' },
                employmentLength: { type: 'number', description: 'Months at current job' },
                rentalHistory: { type: 'string' },
                hasEvictions: { type: 'boolean' },
                hasPets: { type: 'boolean' },
              },
              required: ['monthlyIncome', 'creditScore'],
            },
            rentAmount: {
              type: 'number',
              description: 'Monthly rent for the unit',
            },
          },
          required: ['applicantData', 'rentAmount'],
        },
      },
      {
        name: 'analyze_rent',
        description: 'Analyze market rent for a property',
        parameters: {
          type: 'object',
          properties: {
            propertyId: {
              type: 'string',
              description: 'Property ID to analyze',
            },
            currentRent: {
              type: 'number',
              description: 'Current rent amount',
            },
            unitDetails: {
              type: 'object',
              properties: {
                beds: { type: 'number' },
                baths: { type: 'number' },
                sqft: { type: 'number' },
              },
            },
          },
          required: ['currentRent'],
        },
      },
      {
        name: 'renewal_strategy',
        description: 'Develop a lease renewal strategy',
        parameters: {
          type: 'object',
          properties: {
            tenantId: {
              type: 'string',
              description: 'Tenant ID',
            },
            currentRent: {
              type: 'number',
              description: 'Current rent amount',
            },
            marketRent: {
              type: 'number',
              description: 'Current market rent',
            },
            tenantHistory: {
              type: 'object',
              properties: {
                monthsAsResident: { type: 'number' },
                paymentHistory: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] },
                maintenanceRequests: { type: 'number' },
                complaints: { type: 'number' },
              },
            },
          },
          required: ['currentRent', 'marketRent'],
        },
      },
      {
        name: 'pre_screen_questions',
        description: 'Generate pre-screening questions for a prospective tenant',
        parameters: {
          type: 'object',
          properties: {
            propertyType: {
              type: 'string',
              description: 'Type of property',
            },
            concerns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific concerns to address',
            },
          },
        },
      },
    ];
  }

  /**
   * Generate a property listing
   */
  async generateListing(
    context: ModuleContext,
    propertyData: {
      address: string;
      beds: number;
      baths: number;
      sqft?: number;
      rent: number;
      features?: string[];
      propertyType?: string;
    },
    tone: 'professional' | 'casual' | 'luxury' | 'family-friendly' = 'professional'
  ): Promise<ModuleResponse<PropertyListing>> {
    const userMessage = `Generate a ${tone} property listing for:

Address: ${propertyData.address}
Bedrooms: ${propertyData.beds}
Bathrooms: ${propertyData.baths}
${propertyData.sqft ? `Square Feet: ${propertyData.sqft}` : ''}
Monthly Rent: $${propertyData.rent}
Property Type: ${propertyData.propertyType || 'Apartment'}
Features: ${propertyData.features?.join(', ') || 'Standard amenities'}

Create:
1. Attention-grabbing headline
2. Full description (2-3 paragraphs)
3. 5-7 highlight bullet points
4. List of amenities
5. Neighborhood description
6. Call to action
7. SEO keywords`;

    return this.executeWithLogging(
      context,
      'generate_listing',
      {
        systemPrompt: this.getSystemPrompt(),
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 1500,
        temperature: 0.7,
      },
      (response) => this.parseListing(propertyData, tone)
    );
  }

  /**
   * Screen a rental application
   */
  async screenApplicant(
    context: ModuleContext,
    applicantData: {
      monthlyIncome: number;
      creditScore: number;
      employmentLength?: number;
      hasEvictions?: boolean;
      hasPets?: boolean;
    },
    rentAmount: number
  ): Promise<ModuleResponse<ApplicantScreening>> {
    const incomeToRentRatio = applicantData.monthlyIncome / rentAmount;

    return this.executeWithLogging(
      context,
      'screen_applicant',
      {
        systemPrompt: this.getSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: `Screen this applicant:
Income: $${applicantData.monthlyIncome}/month
Credit Score: ${applicantData.creditScore}
Employment: ${applicantData.employmentLength || 'Unknown'} months
Evictions: ${applicantData.hasEvictions ? 'Yes' : 'No'}
Pets: ${applicantData.hasPets ? 'Yes' : 'No'}
Rent: $${rentAmount}/month
Income/Rent Ratio: ${incomeToRentRatio.toFixed(2)}x`,
          },
        ],
        maxTokens: 800,
        temperature: 0.3,
      },
      () => this.performScreening(applicantData, rentAmount)
    );
  }

  /**
   * Execute a tool by name
   */
  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'generate_listing':
        return this.parseListing(
          args.propertyData as any,
          (args.tone as any) || 'professional'
        );

      case 'screen_applicant':
        return this.performScreening(
          args.applicantData as any,
          args.rentAmount as number
        );

      case 'analyze_rent':
        return this.analyzeRent(
          args.currentRent as number,
          args.unitDetails as any
        );

      case 'renewal_strategy':
        return this.developRenewalStrategy(
          args.currentRent as number,
          args.marketRent as number,
          args.tenantHistory as any
        );

      case 'pre_screen_questions':
        return this.generatePreScreenQuestions(args.propertyType as string);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private parseListing(
    propertyData: { address: string; beds: number; baths: number; rent: number; sqft?: number; features?: string[] },
    tone: string
  ): PropertyListing {
    const { beds, baths, rent, sqft, features = [] } = propertyData;

    const toneAdjectives: Record<string, string[]> = {
      luxury: ['Stunning', 'Exquisite', 'Prestigious', 'Exceptional'],
      professional: ['Well-maintained', 'Desirable', 'Convenient', 'Quality'],
      casual: ['Cozy', 'Charming', 'Perfect', 'Great'],
      'family-friendly': ['Spacious', 'Safe', 'Welcoming', 'Ideal'],
    };

    const adj = toneAdjectives[tone] || toneAdjectives.professional;

    return {
      headline: `${adj[0]} ${beds}BR/${baths}BA ${sqft ? `${sqft} SF ` : ''}Apartment - $${rent}/month`,
      description: `Welcome to this ${adj[1].toLowerCase()} ${beds}-bedroom, ${baths}-bathroom residence that offers the perfect blend of comfort and convenience. ${sqft ? `With ${sqft} square feet of living space, you'll` : "You'll"} have plenty of room to make this space your own.

This ${adj[2].toLowerCase()} home features ${features.length > 0 ? features.slice(0, 3).join(', ') : 'modern finishes and thoughtful updates throughout'}. The open layout creates an inviting atmosphere perfect for both relaxation and entertaining.

Don't miss this opportunity to call this ${adj[3].toLowerCase()} space home. Schedule your tour today!`,
      highlights: [
        `${beds} bedrooms, ${baths} bathrooms`,
        sqft ? `${sqft} square feet of living space` : 'Generous living space',
        ...features.slice(0, 5),
        'Convenient location',
        'Available now',
      ],
      amenities: features.length > 0 ? features : [
        'In-unit laundry',
        'Central A/C',
        'Hardwood floors',
        'Updated kitchen',
        'Ample closet space',
      ],
      neighborhoodInfo: 'Located in a desirable neighborhood with easy access to shopping, dining, and public transportation.',
      callToAction: 'Schedule a tour today! Contact us to learn more about this fantastic opportunity.',
      seoKeywords: [
        `${beds} bedroom apartment`,
        `${beds}br ${baths}ba`,
        'apartment for rent',
        'rental home',
        sqft ? `${sqft} sq ft apartment` : 'spacious apartment',
      ],
    };
  }

  private performScreening(
    applicantData: {
      monthlyIncome: number;
      creditScore: number;
      employmentLength?: number;
      hasEvictions?: boolean;
      hasPets?: boolean;
    },
    rentAmount: number
  ): ApplicantScreening {
    const incomeRatio = applicantData.monthlyIncome / rentAmount;
    const strengths: string[] = [];
    const concerns: string[] = [];
    let score = 50;

    // Income analysis
    if (incomeRatio >= 3) {
      score += 20;
      strengths.push(`Strong income-to-rent ratio (${incomeRatio.toFixed(1)}x)`);
    } else if (incomeRatio >= 2.5) {
      score += 10;
      strengths.push(`Acceptable income-to-rent ratio (${incomeRatio.toFixed(1)}x)`);
    } else {
      score -= 15;
      concerns.push(`Low income-to-rent ratio (${incomeRatio.toFixed(1)}x) - below 2.5x threshold`);
    }

    // Credit analysis
    if (applicantData.creditScore >= 700) {
      score += 20;
      strengths.push('Excellent credit score');
    } else if (applicantData.creditScore >= 650) {
      score += 10;
      strengths.push('Good credit score');
    } else if (applicantData.creditScore >= 600) {
      concerns.push('Fair credit score - additional deposit may be warranted');
    } else {
      score -= 20;
      concerns.push('Credit score below acceptable threshold');
    }

    // Employment
    if (applicantData.employmentLength && applicantData.employmentLength >= 24) {
      score += 10;
      strengths.push('Stable employment history (2+ years)');
    } else if (applicantData.employmentLength && applicantData.employmentLength >= 12) {
      score += 5;
      strengths.push('Reasonable employment stability');
    }

    // Evictions
    if (applicantData.hasEvictions) {
      score -= 30;
      concerns.push('Prior eviction on record - high risk');
    } else {
      strengths.push('No eviction history');
    }

    // Determine recommendation
    let recommendation: ApplicantScreening['recommendation'];
    let riskLevel: ApplicantScreening['riskLevel'];

    if (score >= 70) {
      recommendation = 'approve';
      riskLevel = 'low';
    } else if (score >= 50) {
      recommendation = 'review';
      riskLevel = 'medium';
    } else {
      recommendation = 'decline';
      riskLevel = 'high';
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      recommendation,
      riskLevel,
      strengths,
      concerns,
      suggestedQuestions: concerns.length > 0
        ? [
            'Can you provide additional proof of income?',
            'Can you explain any credit issues?',
            'Can you provide additional references?',
          ]
        : [],
      incomeToRentRatio: incomeRatio,
    };
  }

  private analyzeRent(currentRent: number, unitDetails?: { beds?: number; baths?: number; sqft?: number }): RentAnalysis {
    // Mock market analysis - in production, use actual market data
    const marketRent = Math.round(currentRent * (0.95 + Math.random() * 0.15));
    const percentageVsMarket = ((currentRent - marketRent) / marketRent) * 100;

    return {
      currentRent,
      marketRent,
      suggestedRent: Math.round(marketRent * 1.02),
      percentageVsMarket,
      comparables: [
        { address: '123 Similar St', rent: marketRent - 50, beds: unitDetails?.beds || 2, baths: unitDetails?.baths || 1, sqft: unitDetails?.sqft || 900 },
        { address: '456 Nearby Ave', rent: marketRent + 25, beds: unitDetails?.beds || 2, baths: unitDetails?.baths || 1, sqft: (unitDetails?.sqft || 900) + 50 },
        { address: '789 Market Dr', rent: marketRent, beds: unitDetails?.beds || 2, baths: unitDetails?.baths || 1, sqft: unitDetails?.sqft || 900 },
      ],
      recommendation: percentageVsMarket < -5
        ? 'Consider increasing rent - currently below market'
        : percentageVsMarket > 5
        ? 'Rent is above market - may affect occupancy'
        : 'Rent is well-positioned for the market',
      optimalListingPrice: {
        aggressive: Math.round(marketRent * 1.05),
        market: marketRent,
        conservative: Math.round(marketRent * 0.97),
      },
    };
  }

  private developRenewalStrategy(
    currentRent: number,
    marketRent: number,
    tenantHistory?: {
      monthsAsResident?: number;
      paymentHistory?: string;
      maintenanceRequests?: number;
      complaints?: number;
    }
  ): LeaseRenewalStrategy {
    const isGoodTenant = tenantHistory?.paymentHistory === 'excellent' || tenantHistory?.paymentHistory === 'good';
    const isLongTerm = (tenantHistory?.monthsAsResident || 0) >= 24;

    let suggestedPercentage: number;
    let approach: LeaseRenewalStrategy['approach'];

    if (isGoodTenant && isLongTerm) {
      suggestedPercentage = 3;
      approach = 'retention-focused';
    } else if (isGoodTenant) {
      suggestedPercentage = 4;
      approach = 'moderate';
    } else {
      suggestedPercentage = 5;
      approach = 'aggressive';
    }

    const suggestedAmount = Math.round(currentRent * (suggestedPercentage / 100));
    const newRent = currentRent + suggestedAmount;

    return {
      currentTenantValue: isGoodTenant ? (isLongTerm ? 9 : 7) : 5,
      retentionRisk: newRent > marketRent * 1.05 ? 'high' : newRent > marketRent ? 'medium' : 'low',
      suggestedIncrease: {
        percentage: suggestedPercentage,
        amount: suggestedAmount,
        newRent,
      },
      incentives: approach === 'retention-focused'
        ? ['Early renewal discount', 'Free carpet cleaning', 'Waive one month of pet rent']
        : approach === 'moderate'
        ? ['Lock in rate for 18 months', 'Minor upgrade of choice']
        : [],
      timing: 'Send renewal offer 90 days before lease expiration',
      approach,
      rationale: approach === 'retention-focused'
        ? 'Long-term quality tenant - prioritize retention over maximum rent increase'
        : approach === 'moderate'
        ? 'Good tenant - balance between fair increase and retention'
        : 'Standard tenant - standard market-rate increase',
    };
  }

  private generatePreScreenQuestions(propertyType?: string): string[] {
    return [
      'What is your current employment status and monthly income?',
      'How long have you been at your current job?',
      'Do you have any prior evictions or broken leases?',
      'How many people will be living in the unit?',
      'Do you have any pets? If so, what type and size?',
      'What is your desired move-in date?',
      'Why are you moving from your current residence?',
      'Can you provide references from previous landlords?',
      'Are you able to pass a background and credit check?',
      'How long do you plan to stay?',
    ];
  }
}
