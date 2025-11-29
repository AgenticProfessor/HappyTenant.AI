import { ToolImplementation } from './registry';
import { mockProperties, mockTenants, mockMaintenanceRequests } from '@/data/mock-data';

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
