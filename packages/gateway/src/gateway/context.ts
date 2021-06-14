import { coreModule } from '../modules/core';
import type { ModuleContext, GatewayConfig } from '@shattercms/types';

export const getContext = (config: GatewayConfig): ModuleContext => ({
  config,
  authMiddleware: [],
  entities: [],
  resolvers: [],
  modules: [[coreModule]],
  graphqlMiddleware: [],
  expressMiddleware: [],
});
