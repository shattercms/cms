import type { DeepPartial, GatewayConfig } from '@shattercms/types';
import defu from 'defu';

const configDefault: GatewayConfig = {
  debug: false,
  apollo: {
    uploads: false,
    subscriptions: {
      path: '/subscriptions',
      keepAlive: 30000,
    },
  },
  postgres: {
    database: 'shattercms',
    username: 'postgres',
    password: 'postgres',
    logging: false,
    synchronize: false,
    cache: false,
  },
  permissions: {},
};

export const getConfig = (config: DeepPartial<GatewayConfig>) => {
  return defu(config, configDefault) as GatewayConfig;
};
