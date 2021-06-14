import type { DeepPartial, GatewayConfig } from '@shattercms/types';
import defu from 'defu';

const configDefault: GatewayConfig = {
  debug: false,
  postgres: {
    database: 'cms',
    username: 'postgres',
    password: 'postgres',
    logging: false,
    synchronize: false,
  },
  permissions: {},
};

export const getConfig = (config: DeepPartial<GatewayConfig>) => {
  return defu(config, configDefault) as GatewayConfig;
};
