import { coreModule } from '../modules/core';
import type {
  ModuleContext,
  GatewayConfig,
  GatewayContext,
} from '@shattercms/types';
import { EntityTarget, getRepository, In } from 'typeorm';
import DataLoader from 'dataloader';

export const getModuleContext = (config: GatewayConfig): ModuleContext => ({
  config,
  authMiddleware: [],
  entities: [],
  resolvers: [],
  modules: [[coreModule]],
  graphqlMiddleware: [],
  expressMiddleware: [],
});

export const getGatewayContext = (
  buildContext: ModuleContext,
  input: Pick<GatewayContext, 'req' | 'res' | 'orm'>
): GatewayContext => {
  const dataloaders = new Map<string, DataLoader<any, any>>();

  return {
    ...input,
    config: buildContext.config,
    auth: {
      hasPermission: async (resource, ctx) => {
        for (const handler of buildContext.authMiddleware) {
          const result = await handler(resource, ctx);
          if (result === true) return true;
        }
        return false;
      },
    },
    getLoader: <E, K extends keyof E>(
      name: string,
      key: K,
      entity: EntityTarget<E>
    ) => {
      let dataloader = dataloaders.get(name) as DataLoader<E[K], E>;
      if (dataloader) {
        // Clear dataloder cache startup to prevent returning stale data
        dataloader.clearAll();
        return dataloader;
      }

      // Create a new dataloader instance if necessary
      dataloader = new DataLoader<E[K], E>(async (keys) => {
        // Remove duplicates so less data is fetched
        const uniqueKeys = keys.filter((k, i) => keys.indexOf(k) === i);

        // Fetch all items in one query
        const items = await getRepository(entity).find({
          [key]: In(uniqueKeys),
        });

        // Map returned data to the matching key
        const dataMap = new Map<E[K], E>();
        items.forEach((item) => dataMap.set(item[key], item));

        // Return data (or error) by key
        return keys.map(
          (k) =>
            dataMap.get(k) ?? new Error('Could not find the requested resource')
        );
      });

      // Save the dataloader for later requests
      dataloaders.set(name, dataloader);
      return dataloader;
    },
  };
};
