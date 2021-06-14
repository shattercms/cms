import type { DeepPartial, GatewayConfig, Module } from '@shattercms/types';
import { existsSync } from 'fs';
import jiti from 'jiti';
import path from 'path';
import defu from 'defu';
const jitiRequire = jiti();

export type ConfigModule =
  | string
  | { path: string; options?: any }
  | [path: string, options?: any];

export type CLIConfig = {
  gateway: DeepPartial<GatewayConfig>;
  modules: ConfigModule[];
  server: {
    host?: string;
    port?: number;
  };
};

export type UserConfig = DeepPartial<CLIConfig>;

export const resolveModule = (
  module: ConfigModule
): [path: string, options?: any] => {
  if (typeof module === 'string') return [module, undefined];
  if (Array.isArray(module) && module.length > 0) return [module[0], module[1]];
  if (!Array.isArray(module) && typeof module === 'object' && module.path)
    return [module.path, module.options];
  throw new Error(`Invalid module definition '${JSON.stringify(module)}'`);
};

export const getConfig = (root: string, options: { [key: string]: any }) => {
  let cliConfig: UserConfig | undefined;

  // Read the config file
  const names = [
    'shatter.config.ts',
    'shatter.config.js',
    'shatter.config.json',
  ];
  for (const name of names) {
    const file = path.resolve(root, name);
    if (!existsSync(file)) continue;
    let c = jitiRequire(file);
    if (c.default) c = c.default;
    cliConfig = c;
    break;
  }
  if (!cliConfig) throw new Error('Failed to find a configuration file');

  // Apply defaults
  const defaultConfig: CLIConfig = {
    gateway: {},
    modules: [],
    server: {},
  };
  const config = defu(cliConfig, defaultConfig) as CLIConfig;

  // Apply provided options
  if (options.debug === true) config.gateway.debug = true;
  if (options.host) config.server.host = options.host;
  if (options.port) config.server.port = options.port;

  return config;
};
