import { ShatterConfig, UserConfig } from '@shattercms/types';
import defu from 'defu';

const configDefault: ShatterConfig = {
  rootDir: '.',
  debug: false,
  modules: [],
  server: {
    host: 'localhost',
    port: 4000,
    cors: { origin: '*' },
  },
  postgres: {
    database: 'cms',
    username: 'postgres',
    password: 'postgres',
    logging: false,
    synchronize: false,
  },
  permissions: {},
};

export const getConfig = (configUser: UserConfig) => {
  return defu(configUser, configDefault) as ShatterConfig;
};
