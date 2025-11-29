import { AIToolDefinition } from '../providers/types';

export interface ToolImplementation {
    definition: AIToolDefinition;
    execute: (args: any) => Promise<any>;
}

export class ToolRegistry {
    private tools: Map<string, ToolImplementation> = new Map();

    register(tool: ToolImplementation) {
        this.tools.set(tool.definition.name, tool);
    }

    getDefinition(name: string): AIToolDefinition | undefined {
        return this.tools.get(name)?.definition;
    }

    getDefinitions(): AIToolDefinition[] {
        return Array.from(this.tools.values()).map(t => t.definition);
    }

    async execute(name: string, args: any): Promise<any> {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool ${name} not found`);
        }
        return tool.execute(args);
    }
}

export const toolRegistry = new ToolRegistry();
