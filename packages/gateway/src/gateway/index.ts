import express from 'express';
import type {
  ModuleContext,
  Module,
  GatewayConfig,
  DeepPartial,
} from '@shattercms/types';
import { getHandler } from './handler';
import { getConfig } from './config';
import { getModuleContext } from './context';

export class Gateway {
  private context: ModuleContext;

  /**
   * Creates a new gateway instance
   * @param config Gateway configuration
   */
  constructor(config: DeepPartial<GatewayConfig> = {}) {
    const c = getConfig(config);
    this.context = getModuleContext(c);
  }

  /**
   * Adds a custom module to the gateway
   * @param module The module to add
   * @param options Options that will be passed to the module
   */
  public addModule<T = any>(module: Module<T>, options?: T) {
    this.context.modules.push([module, options]);
    return this;
  }

  private async init() {
    // Execute module functions with build context
    for (const module of this.context.modules) {
      await module[0](this.context, module[1]);
    }
  }

  /**
   * Returns the underlaying express handler of the gateway
   * @returns Express router instance with all necessary middleware attached
   */
  public async getHandler() {
    await this.init();
    return getHandler(this.context);
  }

  /**
   * Spins up an express server running the gateway
   * @param port server port
   * @param host server host adress
   */
  public async listen(port: number = 4000, host: string = 'localhost') {
    // Setup express
    const handler = await this.getHandler();
    const app = express().use(handler);

    // Spin up a server
    const server = app.listen(port, host, () => {
      const info = server.address();
      if (info && typeof info !== 'string') {
        host = info.address;
        port = info.port;
      }
      if (host === '127.0.0.1') host = 'localhost';
      console.log(`ShatterCMS Gateway • http://${host}:${port}/graphql`);
    });
  }
}
