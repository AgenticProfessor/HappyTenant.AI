import { useEffect } from 'react';
import { useSteward, type StewardContextData } from '@/components/steward/StewardContext';

/**
 * Hook to register context with Steward when a component is mounted
 * @param context The context data to register
 * @param enabled Whether context registration is enabled (default: true)
 */
export function useStewardContext(context: StewardContextData, enabled: boolean = true) {
    const { registerContext, unregisterContext } = useSteward();

    useEffect(() => {
        if (!enabled) return;

        registerContext(context);

        return () => {
            unregisterContext();
        };
    }, [enabled, registerContext, unregisterContext, JSON.stringify(context)]);
}
