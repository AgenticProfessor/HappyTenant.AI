/**
 * Steward Components - Main exports
 */

// Core components
export { StewardOrb, type StewardOrbState } from './StewardOrb';
export { StewardAvatar, type StewardAvatarSize } from './StewardAvatar';
export { StewardChat } from './StewardChat';
export { StewardFloatingWidget } from './StewardFloatingWidget';

// Context and provider
export {
  StewardProvider,
  useSteward,
  type StewardMessage,
  type StewardContextData,
  type RootDataContext,
} from './StewardContext';

// Root-level data provider for portfolio-wide awareness
export {
  StewardDataProvider,
  useStewardData,
  useStewardRichContext,
  type PortfolioMetrics,
  type PortfolioAlert,
  type ProactiveInsight,
  type PageContextEnrichment,
} from './StewardDataProvider';
