# Happy Tenant - AI Agent Architecture

## AI-First Philosophy

Every feature in Happy Tenant should answer: "How can AI enhance or automate this?"

The AI system is designed around **autonomous agents** that can:
- Observe events and context
- Reason about the best course of action
- Take actions or make recommendations
- Learn from feedback

---

## AI Agent Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           AI ORCHESTRATION LAYER                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                     Agent Router & Coordinator                          │  │
│  │   • Routes tasks to appropriate agents                                  │  │
│  │   • Manages agent priorities and queues                                 │  │
│  │   • Handles multi-agent collaboration                                   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Communication  │      │  Operations     │      │   Financial     │
│     Agents      │      │    Agents       │      │    Agents       │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ • Tenant Chat   │      │ • Maintenance   │      │ • Rent          │
│ • Smart Reply   │      │ • Triage        │      │   Collection    │
│ • FAQ Bot       │      │ • Scheduling    │      │ • Late Fee      │
│ • Notification  │      │ • Inspection    │      │ • Expense       │
│   Composer      │      │   Reminders     │      │   Tracking      │
└─────────────────┘      └─────────────────┘      └─────────────────┘

         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Leasing       │      │   Document      │      │   Analytics     │
│    Agents       │      │    Agents       │      │    Agents       │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ • Lead          │      │ • Lease         │      │ • Performance   │
│   Qualification │      │   Analysis      │      │   Insights      │
│ • Showing       │      │ • Document      │      │ • Market        │
│   Scheduler     │      │   Extraction    │      │   Analysis      │
│ • Application   │      │ • Compliance    │      │ • Predictive    │
│   Reviewer      │      │   Checker       │      │   Analytics     │
│ • Listing       │      │                 │      │ • Risk          │
│   Optimizer     │      │                 │      │   Assessment    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## Agent Specifications

### 1. Tenant Communication Agent

**Purpose**: Handle routine tenant communications, provide instant responses, and escalate complex issues.

```yaml
agent_name: tenant_communication
triggers:
  - incoming_message
  - maintenance_update
  - payment_reminder_due
  - lease_renewal_approaching

capabilities:
  - Answer FAQ questions (parking, amenities, policies)
  - Provide maintenance request status updates
  - Send payment reminders with empathy
  - Schedule showing appointments
  - Escalate to human when needed

context_required:
  - tenant_profile
  - lease_details
  - property_rules
  - conversation_history
  - outstanding_balance
  - maintenance_history

actions:
  - send_message
  - create_task_for_landlord
  - schedule_callback
  - update_conversation_status

safety_rails:
  - Never commit to repairs or expenses
  - Always offer human callback option
  - Detect distress signals → immediate escalation
  - Comply with Fair Housing language requirements
```

**Example Interaction Flow**:
```
Tenant: "My AC isn't working and it's 95 degrees!"

AI Agent Analysis:
- Intent: Emergency maintenance request
- Urgency: HIGH (temperature mention + "not working")
- Sentiment: Frustrated/Urgent

AI Agent Response:
"I'm so sorry about the AC issue - I know how uncomfortable that must be!
I've flagged this as an urgent maintenance request. Our on-call technician
has been notified and will contact you within the next 2 hours.

In the meantime, here are some tips to stay cool:
• Close blinds to block direct sunlight
• Use fans to circulate air

Would you like me to have the property manager call you directly?"

AI Agent Actions:
1. Create maintenance_request (priority: emergency, category: hvac)
2. Notify property manager via SMS
3. Send notification to on-call vendor
4. Schedule follow-up in 2 hours
```

---

### 2. Maintenance Triage Agent

**Purpose**: Analyze maintenance requests, categorize urgency, route to appropriate resources, and predict issues.

```yaml
agent_name: maintenance_triage
triggers:
  - new_maintenance_request
  - maintenance_status_update
  - recurring_issue_detected
  - seasonal_maintenance_schedule

capabilities:
  - Categorize maintenance issues automatically
  - Assess priority and urgency
  - Match issues to vendors by specialty
  - Detect recurring patterns
  - Predict preventive maintenance needs
  - Generate work orders

context_required:
  - maintenance_history (property & unit)
  - vendor_availability
  - property_age_and_systems
  - similar_issues_database
  - weather_data
  - unit_appliance_inventory

actions:
  - categorize_request
  - set_priority
  - assign_vendor
  - create_work_order
  - schedule_appointment
  - send_tenant_eta
  - flag_recurring_issue

ai_models:
  - image_classification (for photo analysis)
  - text_classification (for issue categorization)
  - time_series (for predictive maintenance)
```

**Smart Categorization Logic**:
```python
def analyze_maintenance_request(request):
    """
    Multi-modal analysis of maintenance requests
    """
    analysis = {
        'text_analysis': analyze_description(request.description),
        'image_analysis': analyze_photos(request.photos),
        'history_context': get_unit_history(request.unit_id),
        'seasonal_factors': get_seasonal_context(request.property_location)
    }

    # Determine category
    category = classify_category(analysis)

    # Assess urgency (1-10 scale)
    urgency_score = calculate_urgency(
        text_indicators=analysis['text_analysis']['urgency_signals'],
        image_severity=analysis['image_analysis']['damage_level'],
        safety_risk=analysis['text_analysis']['safety_indicators'],
        livability_impact=category_livability_map[category],
        weather_factor=analysis['seasonal_factors']['extreme_weather']
    )

    # Predict resolution time
    similar_issues = find_similar_issues(analysis)
    predicted_resolution = estimate_resolution_time(similar_issues)

    return {
        'category': category,
        'priority': urgency_to_priority(urgency_score),
        'predicted_resolution_hours': predicted_resolution,
        'recommended_vendor': match_vendor(category, urgency_score),
        'similar_past_issues': similar_issues[:3],
        'is_recurring': detect_recurring_pattern(request.unit_id, category)
    }
```

---

### 3. Rent Collection Agent

**Purpose**: Automate rent collection, handle late payments with empathy, and maximize collection rates.

```yaml
agent_name: rent_collection
triggers:
  - rent_due_approaching (3 days before)
  - rent_due_date
  - payment_late (grace period expired)
  - payment_failed
  - partial_payment_received
  - payment_promise_date

capabilities:
  - Send personalized payment reminders
  - Offer flexible payment arrangements
  - Process payment promises
  - Escalate to human for hardship cases
  - Generate late fee notices
  - Track payment patterns

communication_style:
  - Empathetic but firm
  - Professional tone
  - Offer solutions, not just demands
  - Comply with debt collection regulations

context_required:
  - tenant_payment_history
  - current_balance
  - lease_terms (late fees, grace period)
  - previous_communications
  - tenant_financial_indicators
  - local_regulations

escalation_triggers:
  - Tenant mentions job loss
  - Tenant mentions medical emergency
  - 3+ consecutive late payments
  - Tenant requests to speak to human
  - Balance exceeds 2 months rent
```

**Communication Sequence**:
```
Timeline for $1,500 rent due on 1st:

Day -3 (Reminder):
"Hi Sarah! Just a friendly reminder that your rent of $1,500 is due
in 3 days (March 1st). You can pay anytime through the app.
Need to set up autopay? I can help with that!"

Day 1 (Due Date):
"Good morning! Your rent of $1,500 is due today.
Tap here to pay now: [Pay Now Button]
Remember, payments after March 5th will incur a late fee."

Day 6 (Late - Past Grace):
"Hi Sarah, I noticed your rent payment is 5 days past due.
A $75 late fee has been added, bringing your total to $1,575.

I understand things come up. Would any of these help?
• Set up a payment plan (split into 2 payments)
• Schedule payment for a specific date
• Talk to your property manager

Just reply to let me know how I can help."

Day 14 (Escalation):
[Human property manager notified]
[Formal notice generated for review]
"Sarah, I want to help resolve this. Your property manager,
Mike, will be reaching out today to discuss options."
```

---

### 4. Listing Optimization Agent

**Purpose**: Create compelling listings, optimize for search, and maximize qualified leads.

```yaml
agent_name: listing_optimizer
triggers:
  - new_listing_created
  - listing_not_performing
  - market_conditions_changed
  - similar_unit_rented

capabilities:
  - Generate compelling listing descriptions
  - Recommend optimal pricing
  - Suggest best photos to feature
  - Optimize for search keywords
  - A/B test listing variations
  - Analyze competitor listings

context_required:
  - unit_details
  - property_amenities
  - neighborhood_data
  - market_comparables
  - historical_performance
  - seasonal_demand_patterns

outputs:
  - ai_listing_description
  - rent_recommendation
  - keyword_suggestions
  - photo_ranking
  - competitive_analysis
```

**Listing Generation Example**:
```python
Input:
{
    "bedrooms": 2,
    "bathrooms": 1,
    "square_feet": 950,
    "features": ["hardwood_floors", "updated_kitchen", "in_unit_laundry"],
    "neighborhood": "Capitol Hill",
    "walk_score": 92,
    "nearby": ["coffee_shops", "restaurants", "metro_station"]
}

AI Generated Listing:
"""
✨ Charming 2BR in the Heart of Capitol Hill | In-Unit Laundry!

Wake up to sun-drenched hardwood floors in this beautifully updated
2-bedroom apartment. The modern kitchen features stainless appliances
and plenty of counter space for your inner chef.

What You'll Love:
🏠 950 sq ft of thoughtfully designed living space
👔 In-unit washer/dryer (no more laundromat runs!)
🚇 Steps from Eastern Market Metro
☕ Surrounded by DC's best coffee shops & restaurants
🚶 Walk Score: 92 - daily errands on foot!

Available [DATE] | $2,400/month | Pets negotiable

Schedule a tour today - this won't last long!
"""

Rent Analysis:
{
    "recommended_rent": 2400,
    "confidence": 0.85,
    "market_range": [2200, 2600],
    "comparable_units": [
        {"address": "123 Main St", "rent": 2350, "days_on_market": 12},
        {"address": "456 Oak Ave", "rent": 2500, "days_on_market": 28}
    ],
    "optimization_tips": [
        "Listing $2,400 should rent within 14 days",
        "Consider offering 1 month free for 13-month lease",
        "Pet-friendly could increase rent by $50-100/month"
    ]
}
```

---

### 5. Lead Qualification Agent

**Purpose**: Pre-screen rental applicants, schedule showings, and prioritize qualified leads.

```yaml
agent_name: lead_qualification
triggers:
  - new_inquiry_received
  - showing_requested
  - application_started

capabilities:
  - Answer property questions
  - Pre-qualify based on criteria
  - Schedule showings automatically
  - Follow up on no-shows
  - Send application reminders
  - Score lead quality

qualification_criteria:
  - income_ratio (typically 3x rent)
  - move_in_timeline
  - rental_history
  - pet_situation
  - number_of_occupants

context_required:
  - listing_details
  - landlord_requirements
  - showing_availability
  - similar_leads_conversion_data
```

**Conversation Flow**:
```
Lead: "Is the 2BR on Oak Street still available?"

AI Agent:
"Yes, the 2BR at 456 Oak Street is still available! It's $2,400/month.

Quick questions to make sure it's a good fit:
1. When are you looking to move in?
2. How many people will be living there?
3. Do you have any pets?

This helps me give you the most relevant info!"

Lead: "Looking for June 1, just me and my cat"

AI Agent:
"Perfect timing - June 1st works great! And yes, cats are welcome
(there's a small pet deposit).

I have showing times available:
📅 Thursday 5:30 PM
📅 Saturday 11:00 AM
📅 Saturday 2:00 PM

Which works best for you? Or suggest another time!"

[Lead selects Saturday 11 AM]

AI Agent:
"You're all set for Saturday at 11 AM! Here's what to know:

📍 456 Oak Street, Apt 2B
🅿️ Street parking available
📝 Bring ID for the showing

I'll send you a reminder tomorrow. Any questions before then?"

[Creates calendar event, sends confirmation, schedules reminder]
```

---

### 6. Document Analysis Agent

**Purpose**: Extract data from documents, verify compliance, and automate paperwork.

```yaml
agent_name: document_analysis
triggers:
  - document_uploaded
  - lease_signing_requested
  - compliance_check_scheduled
  - income_verification_needed

capabilities:
  - Extract data from photos/PDFs
  - Verify income documents
  - Analyze lease terms
  - Check compliance requirements
  - Compare documents against templates
  - Flag potential issues

document_types:
  - pay_stubs
  - bank_statements
  - tax_returns
  - employment_letters
  - rental_history
  - ID_documents
  - lease_agreements
  - inspection_reports

compliance_checks:
  - Fair Housing compliance
  - State/local rental regulations
  - Security deposit limits
  - Required disclosures
  - Lead paint requirements
```

**Processing Example**:
```python
def process_income_verification(documents):
    """
    Analyze uploaded income documents
    """
    results = []

    for doc in documents:
        # OCR and extraction
        extracted = extract_document_data(doc)

        if extracted['type'] == 'pay_stub':
            results.append({
                'document_type': 'pay_stub',
                'employer': extracted['employer_name'],
                'gross_income': extracted['gross_pay'],
                'pay_period': extracted['pay_period'],
                'ytd_earnings': extracted['ytd_gross'],
                'confidence': extracted['extraction_confidence']
            })

        elif extracted['type'] == 'bank_statement':
            results.append({
                'document_type': 'bank_statement',
                'bank_name': extracted['institution'],
                'account_type': extracted['account_type'],
                'avg_balance': calculate_avg_balance(extracted['transactions']),
                'deposits': sum_deposits(extracted['transactions']),
                'period': extracted['statement_period']
            })

    # Calculate verified income
    monthly_income = calculate_monthly_income(results)

    return {
        'verified_monthly_income': monthly_income,
        'income_to_rent_ratio': monthly_income / target_rent,
        'meets_requirements': monthly_income >= (target_rent * 3),
        'verification_confidence': calculate_confidence(results),
        'documents_analyzed': len(results),
        'flags': identify_flags(results)
    }
```

---

### 7. Financial Insights Agent

**Purpose**: Provide actionable financial insights, forecasting, and optimization recommendations.

```yaml
agent_name: financial_insights
triggers:
  - monthly_report_due
  - significant_variance_detected
  - tax_season
  - user_dashboard_view
  - expense_threshold_exceeded

capabilities:
  - Generate financial summaries
  - Detect anomalies in spending
  - Forecast cash flow
  - Optimize expense categorization
  - Tax preparation assistance
  - ROI analysis per property

metrics_tracked:
  - gross_rental_income
  - vacancy_rate
  - collection_rate
  - operating_expenses
  - net_operating_income
  - cap_rate
  - cash_on_cash_return

insights_generated:
  - performance_vs_market
  - expense_optimization_opportunities
  - rent_increase_recommendations
  - maintenance_cost_trends
  - tenant_retention_analysis
```

**Insight Example**:
```
Monthly Portfolio Summary - March 2024

📊 Overall Performance
━━━━━━━━━━━━━━━━━━━━
Gross Income:     $24,500  (+2.3% vs last month)
Expenses:         $8,200   (-5.1% vs last month)
Net Operating:    $16,300  (+6.2% vs last month)
Collection Rate:  97.3%    (Industry avg: 94%)

🏆 Top Performer
Oak Street Property - 12.4% cash-on-cash return

⚠️ Attention Needed
Pine Avenue Unit 3:
• Rent $200 below market ($1,300 vs $1,500 avg)
• Lease expires in 45 days
• Recommendation: Increase to $1,450 at renewal (+11.5%)
• Projected annual impact: +$1,800

💡 AI Insights
1. HVAC expenses up 34% YoY - consider preventive maintenance
   contract ($1,200/yr) to reduce emergency calls (~$3,000/yr)

2. Vacancy at Maple St could have been avoided - similar units
   with 60-day renewal notices had 23% better retention

3. Tax optimization: $2,340 in potentially missed deductions
   detected. Schedule review before Q2 estimated taxes.

[View Full Report] [Schedule Tax Review] [Adjust Strategy]
```

---

## AI Infrastructure

### Model Selection Strategy

| Use Case | Model | Reason |
|----------|-------|--------|
| Text Generation (Long) | Claude 3.5 Sonnet | High quality, good context |
| Text Generation (Fast) | Claude 3.5 Haiku | Speed + cost for simple tasks |
| Document OCR | Google Document AI | Industry-leading accuracy |
| Image Analysis | GPT-4V or Claude Vision | Photo analysis for maintenance |
| Embeddings | OpenAI text-embedding-3-small | Cost-effective, high quality |
| Classification | Fine-tuned models | Specific to our domain |

### Vector Database Architecture

```python
# Embedding Strategy
embeddings_config = {
    'documents': {
        'model': 'text-embedding-3-small',
        'dimensions': 1536,
        'index': 'happy-tenant-docs'
    },
    'conversations': {
        'model': 'text-embedding-3-small',
        'dimensions': 1536,
        'index': 'happy-tenant-conversations'
    },
    'maintenance_issues': {
        'model': 'text-embedding-3-small',
        'dimensions': 1536,
        'index': 'happy-tenant-maintenance'
    }
}

# Use cases:
# 1. Find similar maintenance issues for resolution prediction
# 2. Search conversation history for context
# 3. Semantic search across documents and leases
# 4. FAQ matching for tenant questions
```

### Agent Execution Framework

```python
class AIAgent:
    """Base class for all AI agents"""

    def __init__(self, agent_type: str, context: dict):
        self.agent_type = agent_type
        self.context = context
        self.session_id = create_session(agent_type)

    async def execute(self, input_data: dict) -> AgentResult:
        """Execute the agent's task"""

        # 1. Enrich context
        enriched_context = await self.gather_context(input_data)

        # 2. Build prompt
        prompt = self.build_prompt(enriched_context)

        # 3. Execute with safety rails
        with safety_rails(self.agent_type):
            response = await self.llm.generate(prompt)

        # 4. Parse and validate response
        parsed = self.parse_response(response)

        # 5. Execute actions if approved
        if parsed.actions and self.can_auto_execute(parsed.actions):
            results = await self.execute_actions(parsed.actions)
        else:
            results = await self.queue_for_approval(parsed.actions)

        # 6. Log session
        await self.log_session(input_data, response, results)

        return AgentResult(
            response=parsed.response,
            actions_taken=results,
            confidence=parsed.confidence
        )

    def can_auto_execute(self, actions: list) -> bool:
        """Determine if actions can be auto-executed or need approval"""
        auto_allowed = ['send_message', 'create_task', 'update_status']
        requires_approval = ['charge_fee', 'create_expense', 'send_legal_notice']

        for action in actions:
            if action.type in requires_approval:
                return False
        return True
```

---

## Safety & Compliance

### AI Safety Rails

```yaml
global_safety_rules:
  - Never make financial commitments without human approval
  - Never provide legal advice
  - Always offer human escalation path
  - Comply with Fair Housing Act in all communications
  - Never discriminate based on protected classes
  - Respect privacy - don't share tenant info between parties
  - Log all AI decisions for audit

content_filters:
  - No discriminatory language
  - No threatening or harassing content
  - No personally identifiable information in logs
  - No unauthorized disclosure of financial data

escalation_triggers:
  - Tenant mentions self-harm or safety concern
  - Landlord requests discriminatory action
  - Legal threat detected
  - High-value financial decision required
  - Compliance violation detected

human_in_the_loop:
  - required_for:
      - Eviction-related communications
      - Disputes over security deposits
      - Lease terminations
      - Fee waivers over $100
      - Legal notices
```

### Audit Logging

```sql
-- Every AI action is logged
CREATE TABLE ai_audit_log (
    id UUID PRIMARY KEY,
    agent_type VARCHAR(100),
    session_id UUID,
    organization_id UUID,

    -- Input/Output
    input_summary TEXT,
    output_summary TEXT,
    actions_taken JSONB,

    -- Decision context
    confidence_score DECIMAL(5,4),
    safety_checks_passed BOOLEAN,
    human_approved BOOLEAN,

    -- Metadata
    model_used VARCHAR(100),
    tokens_used INTEGER,
    latency_ms INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Learning & Improvement

### Feedback Loop

```yaml
feedback_collection:
  explicit:
    - User rates AI response (thumbs up/down)
    - User modifies AI suggestion
    - User escalates AI decision

  implicit:
    - User accepts AI suggestion without modification
    - Tenant responds positively after AI message
    - Maintenance resolved after AI triage
    - Lead converts after AI qualification

improvement_process:
  1. Collect feedback continuously
  2. Weekly analysis of low-rated interactions
  3. Monthly prompt refinement
  4. Quarterly model evaluation
  5. Continuous A/B testing of prompts
```

### Performance Metrics

| Agent | Key Metrics |
|-------|-------------|
| Tenant Communication | Response satisfaction, escalation rate, resolution time |
| Maintenance Triage | Categorization accuracy, priority accuracy, vendor match rate |
| Rent Collection | Collection rate, days to payment, tenant satisfaction |
| Listing Optimizer | Days on market, inquiry rate, rent vs recommendation |
| Lead Qualification | Qualification accuracy, showing attendance, conversion rate |
| Document Analysis | Extraction accuracy, processing time, flag accuracy |
| Financial Insights | Insight actionability, forecast accuracy, user engagement |
