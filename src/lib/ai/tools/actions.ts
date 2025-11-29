import { ToolImplementation } from './registry';

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
