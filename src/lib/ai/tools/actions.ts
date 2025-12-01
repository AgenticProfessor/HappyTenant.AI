import { ToolImplementation } from './registry';

// Message Tools
export const draftMessageTool: ToolImplementation = {
    definition: {
        name: 'draft_message',
        description: 'Draft a message to a tenant',
        parameters: {
            type: 'object',
            properties: {
                recipientId: { type: 'string', description: 'ID of the tenant' },
                subject: { type: 'string', description: 'Subject of the message' },
                body: { type: 'string', description: 'Body content of the message' },
            },
            required: ['recipientId', 'subject', 'body'],
        },
    },
    execute: async (args) => {
        return {
            action: 'draft_message',
            ...args,
            message: `Drafted message to tenant ${args.recipientId}`
        };
    },
};

// Maintenance Tools
export const createMaintenanceRequestTool: ToolImplementation = {
    definition: {
        name: 'create_maintenance_request',
        description: 'Create a new maintenance request',
        parameters: {
            type: 'object',
            properties: {
                unitId: { type: 'string', description: 'ID of the unit' },
                title: { type: 'string', description: 'Title of the request' },
                description: { type: 'string', description: 'Description of the issue' },
                priority: { type: 'string', enum: ['urgent', 'high', 'normal', 'low'], description: 'Priority level' },
            },
            required: ['unitId', 'title', 'description', 'priority'],
        },
    },
    execute: async (args) => {
        return {
            action: 'create_maintenance_request',
            ...args,
            message: `Created maintenance request: ${args.title}`
        };
    },
};

// Application Tools
export const reviewApplicationTool: ToolImplementation = {
    definition: {
        name: 'review_application',
        description: 'Add a review note or update status of a rental application',
        parameters: {
            type: 'object',
            properties: {
                applicationId: { type: 'string', description: 'ID of the application to review' },
                action: {
                    type: 'string',
                    enum: ['add_note', 'request_info', 'approve', 'deny', 'schedule_showing'],
                    description: 'Action to take on the application'
                },
                note: { type: 'string', description: 'Note or reason for the action' },
                assignTo: { type: 'string', description: 'User ID to assign for follow-up (optional)' },
            },
            required: ['applicationId', 'action'],
        },
    },
    execute: async (args) => {
        return {
            action: 'review_application',
            ...args,
            message: `Application ${args.applicationId}: ${args.action} action recorded`,
            requiresApproval: ['approve', 'deny'].includes(args.action),
        };
    },
};

export const scoreApplicationTool: ToolImplementation = {
    definition: {
        name: 'score_application',
        description: 'Generate an internal screening score for an application based on provided criteria',
        parameters: {
            type: 'object',
            properties: {
                applicationId: { type: 'string', description: 'ID of the application to score' },
                criteria: {
                    type: 'object',
                    description: 'Scoring criteria',
                    properties: {
                        incomeToRent: { type: 'number', description: 'Income to rent ratio (e.g., 3 means 3x rent)' },
                        rentalHistory: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'], description: 'Rental history assessment' },
                        employment: { type: 'string', enum: ['stable', 'new', 'unemployed', 'self_employed'], description: 'Employment status' },
                        references: { type: 'string', enum: ['positive', 'mixed', 'negative', 'unavailable'], description: 'Reference check result' },
                    },
                },
            },
            required: ['applicationId', 'criteria'],
        },
    },
    execute: async (args) => {
        // Calculate internal score based on criteria
        let score = 50; // Base score
        const criteria = args.criteria || {};

        // Income scoring
        if (criteria.incomeToRent >= 3) score += 20;
        else if (criteria.incomeToRent >= 2.5) score += 10;
        else if (criteria.incomeToRent < 2) score -= 15;

        // Rental history scoring
        const historyScores: Record<string, number> = { excellent: 15, good: 10, fair: 0, poor: -20 };
        score += historyScores[criteria.rentalHistory] || 0;

        // Employment scoring
        const employmentScores: Record<string, number> = { stable: 10, new: 5, self_employed: 0, unemployed: -15 };
        score += employmentScores[criteria.employment] || 0;

        // Reference scoring
        const refScores: Record<string, number> = { positive: 10, mixed: 0, negative: -15, unavailable: -5 };
        score += refScores[criteria.references] || 0;

        return {
            action: 'score_application',
            applicationId: args.applicationId,
            score: Math.max(0, Math.min(100, score)),
            recommendation: score >= 70 ? 'APPROVE' : score >= 50 ? 'REVIEW' : 'CAUTION',
            breakdown: criteria,
        };
    },
};

// Payment Tools
export const sendPaymentReminderTool: ToolImplementation = {
    definition: {
        name: 'send_payment_reminder',
        description: 'Send a rent payment reminder to a tenant',
        parameters: {
            type: 'object',
            properties: {
                tenantId: { type: 'string', description: 'ID of the tenant' },
                amount: { type: 'number', description: 'Amount due' },
                dueDate: { type: 'string', description: 'Payment due date' },
                tone: {
                    type: 'string',
                    enum: ['friendly', 'formal', 'urgent'],
                    description: 'Tone of the reminder message'
                },
            },
            required: ['tenantId', 'amount', 'dueDate'],
        },
    },
    execute: async (args) => {
        const tone = args.tone || 'friendly';
        let message = '';

        switch (tone) {
            case 'friendly':
                message = `Hi! Just a friendly reminder that your rent payment of $${args.amount} is due on ${args.dueDate}. Let us know if you have any questions!`;
                break;
            case 'formal':
                message = `This is to remind you that your rent payment of $${args.amount} is due on ${args.dueDate}. Please ensure timely payment to avoid late fees.`;
                break;
            case 'urgent':
                message = `URGENT: Your rent payment of $${args.amount} was due on ${args.dueDate}. Please submit payment immediately to avoid further action.`;
                break;
        }

        return {
            action: 'send_payment_reminder',
            tenantId: args.tenantId,
            draftMessage: message,
            requiresApproval: true,
        };
    },
};

export const recordPaymentTool: ToolImplementation = {
    definition: {
        name: 'record_payment',
        description: 'Record a manual payment from a tenant (cash, check, etc.)',
        parameters: {
            type: 'object',
            properties: {
                tenantId: { type: 'string', description: 'ID of the tenant' },
                amount: { type: 'number', description: 'Payment amount in cents' },
                method: {
                    type: 'string',
                    enum: ['cash', 'check', 'money_order', 'other'],
                    description: 'Payment method'
                },
                reference: { type: 'string', description: 'Check number or reference (optional)' },
                notes: { type: 'string', description: 'Additional notes (optional)' },
            },
            required: ['tenantId', 'amount', 'method'],
        },
    },
    execute: async (args) => {
        return {
            action: 'record_payment',
            ...args,
            message: `Payment of $${(args.amount / 100).toFixed(2)} recorded for tenant ${args.tenantId}`,
            requiresApproval: true,
        };
    },
};
