import express from 'express';
import type {
  ModuleContext,
  Module,
  GatewayConfig,
  DeepPartial,
} from '@shattercms/types';
import { getApollo } from './apollo';
import { getConfig } from './config';
import { getModuleContext } from './context';
import { createServer } from 'http';
import type { ApolloServer } from 'apollo-server-express';

export class Gateway {
  private context: ModuleContext;
  private apollo?: ApolloServer;
  private isInitialized = false;

  /**
   * Creates a new gateway instance
   * @param config Gateway configuration
   */
  constructor(config: DeepPartial<GatewayConfig> = {}) {
    this.context = getModuleContext(getConfig(config));
  }

  /**
   * Adds a custom module to the gateway
   * @param module The module to add
   * @param options Options that will be passed to the module
   */
  public addModule<T = any>(module: Module<T>, options?: T) {
    // Check if the gateway was already initialized
    if (this.isInitialized)
      throw new Error('Cannot add modules to an already initialized gateway');

    // Add the module to context
    this.context.modules.push([module, options]);
    return this; // Return gateway for chaining
  }

  private async init() {
    if (this.isInitialized) return;

    // Execute module functions with build context
    for (const module of this.context.modules) {
      await module[0](this.context, module[1]);
    }

    this.isInitialized = true;
  }

  /**
   * Returns the underlaying apollo server instance of the gateway
   * @returns Already running apollo server instance
   */
  public async getApollo() {
    if (this.apollo) return this.apollo;
    await this.init();
    return getApollo(this.context);
  }

  /**
   * Spins up an http server running the configured apollo server,
   * along with a subscriptions server and your provided express middleware
   * @param port server port
   * @param host server host adress
   */
  public async listen(
    port: number = 4000,
    host: string = 'localhost',
    grapqhlPath = '/graphql'
  ) {
    // Setup express app and http server
    const apollo = await this.getApollo();
    const app = express();
    const server = createServer(app);

    // Apply user-defined express middleware
    this.context.expressMiddleware.forEach((m) => {
      if (Array.isArray(m)) {
        app.use(m[0], m[1]);
      } else {
        app.use(m);
      }
    });

    // Apply apollo middleware
    app.use(apollo.getMiddleware({ cors: false, path: grapqhlPath }));
    apollo.installSubscriptionHandlers(server);

    // Spin up server and log startup message
    server.listen(port, host, () => {
      const info = server.address();
      if (info && typeof info !== 'string') {
        host = info.address;
        port = info.port;
      }
      if (host === '127.0.0.1') host = 'localhost';
      console.log(
        `ShatterCMS Gateway • http://${host}:${port}${apollo.graphqlPath}`
      );
    });
  }
}
