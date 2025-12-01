import { ToolImplementation } from './registry';
import { mockProperties, mockTenants, mockMaintenanceRequests, mockApplications, mockPayments } from '@/data/mock-data';

export const getPropertiesTool: ToolImplementation = {
    definition: {
        name: 'get_properties',
        description: 'Get a list of properties or details for a specific property',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Optional property ID to get details for a specific property',
                },
            },
        },
    },
    execute: async ({ id }) => {
        if (id) {
            const property = mockProperties.find(p => p.id === id);
            if (!property) return { error: 'Property not found' };
            return property;
        }
        return mockProperties;
    },
};

export const getTenantsTool: ToolImplementation = {
    definition: {
        name: 'get_tenants',
        description: 'Get a list of tenants or details for a specific tenant',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Optional tenant ID to get details for a specific tenant',
                },
                status: {
                    type: 'string',
                    enum: ['active', 'pending', 'past'],
                    description: 'Filter by tenant status',
                },
            },
        },
    },
    execute: async ({ id, status }) => {
        if (id) {
            const tenant = mockTenants.find(t => t.id === id);
            if (!tenant) return { error: 'Tenant not found' };
            return tenant;
        }
        if (status) {
            return mockTenants.filter(t => t.status === status);
        }
        return mockTenants;
    },
};

export const getMaintenanceRequestsTool: ToolImplementation = {
    definition: {
        name: 'get_maintenance_requests',
        description: 'Get a list of maintenance requests',
        parameters: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['open', 'in_progress', 'completed'],
                    description: 'Filter by status',
                },
                priority: {
                    type: 'string',
                    enum: ['urgent', 'high', 'normal', 'low'],
                    description: 'Filter by priority',
                },
            },
        },
    },
    execute: async ({ status, priority }) => {
        let requests = mockMaintenanceRequests;
        if (status) {
            requests = requests.filter(r => r.status === status);
        }
        if (priority) {
            requests = requests.filter(r => r.priority === priority);
        }
        return requests;
    },
};

export const getApplicationsTool: ToolImplementation = {
    definition: {
        name: 'get_applications',
        description: 'Get rental applications for the organization. Can filter by status or get details for a specific application.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Optional application ID to get details for a specific application',
                },
                status: {
                    type: 'string',
                    enum: ['NEW', 'UNDER_REVIEW', 'APPROVED', 'DENIED', 'WITHDRAWN'],
                    description: 'Filter applications by status',
                },
                propertyId: {
                    type: 'string',
                    description: 'Filter applications by property ID',
                },
            },
        },
    },
    execute: async ({ id, status, propertyId }) => {
        // Use mock data for now - in production, fetch from API
        if (mockApplications) {
            let applications = mockApplications;
            if (id) {
                const app = applications.find((a: { id: string }) => a.id === id);
                return app || { error: 'Application not found' };
            }
            if (status) {
                applications = applications.filter((a: { status: string }) => a.status === status);
            }
            if (propertyId) {
                applications = applications.filter((a: { propertyId?: string }) => a.propertyId === propertyId);
            }
            return applications;
        }
        return { message: 'No applications data available' };
    },
};

export const getPaymentsTool: ToolImplementation = {
    definition: {
        name: 'get_payments',
        description: 'Get payment information including upcoming rent, payment history, and outstanding balances.',
        parameters: {
            type: 'object',
            properties: {
                tenantId: {
                    type: 'string',
                    description: 'Get payments for a specific tenant',
                },
                status: {
                    type: 'string',
                    enum: ['PENDING', 'COMPLETED', 'FAILED', 'OVERDUE'],
                    description: 'Filter payments by status',
                },
                type: {
                    type: 'string',
                    enum: ['rent', 'deposit', 'fee', 'other'],
                    description: 'Filter by payment type',
                },
            },
        },
    },
    execute: async ({ tenantId, status, type }) => {
        // Use mock data for now - in production, fetch from API
        if (mockPayments) {
            let payments = mockPayments;
            if (tenantId) {
                payments = payments.filter((p: { tenantId?: string }) => p.tenantId === tenantId);
            }
            if (status) {
                payments = payments.filter((p: { status: string }) => p.status === status);
            }
            if (type) {
                payments = payments.filter((p: { type?: string }) => p.type === type);
            }
            return payments;
        }
        return { message: 'No payments data available' };
    },
};

export const getConversationsTool: ToolImplementation = {
    definition: {
        name: 'get_conversations',
        description: 'Get messaging conversations. Can filter by tenant or get unread messages.',
        parameters: {
            type: 'object',
            properties: {
                tenantId: {
                    type: 'string',
                    description: 'Get conversations with a specific tenant',
                },
                unreadOnly: {
                    type: 'boolean',
                    description: 'Only return conversations with unread messages',
                },
            },
        },
    },
    execute: async ({ tenantId, unreadOnly }) => {
        // Placeholder - would fetch from conversations API
        return {
            message: 'Conversations feature integration pending',
            tenantId,
            unreadOnly,
        };
    },
};
