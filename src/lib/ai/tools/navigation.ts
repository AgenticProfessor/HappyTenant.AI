import { ToolImplementation } from './registry';

export const navigationTool: ToolImplementation = {
    definition: {
        name: 'navigate',
        description: 'Navigate the user to a specific page in the application',
        parameters: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'The path to navigate to (e.g., /dashboard/properties)',
                },
            },
            required: ['path'],
        },
    },
    execute: async ({ path }) => {
        // Return a structured response that the API route can handle to trigger client-side navigation
        return {
            action: 'navigate',
            path,
            message: `Navigating to ${path}`
        };
    },
};
