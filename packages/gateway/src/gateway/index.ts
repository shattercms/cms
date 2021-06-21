import express, { Router, Express } from 'express';
import type {
  ModuleContext,
  Module,
  GatewayConfig,
  DeepPartial,
} from '@shattercms/types';
import { createApollo } from './apollo';
import { getConfig } from './config';
import { getModuleContext } from './context';
import { createServer, Server } from 'http';
import type { ApolloServer } from 'apollo-server-express';

export class Gateway {
  private context: ModuleContext;
  private isInitialized = false;
  private isListening = false;

  private apollo?: ApolloServer;
  private server?: Server;
  private handler?: Router;

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

    // Create a new apollo server instance
    const apollo = await createApollo(this.context);

    this.apollo = apollo;
    return apollo;
  }

  public async getHandler(graphqlPath: string) {
    if (this.handler) return this.handler;
    await this.init();

    // Create a new express router
    const handler = Router();

    // Apply user-defined express middleware
    this.context.expressMiddleware.forEach((m) => {
      if (Array.isArray(m)) {
        handler.use(m[0], m[1]);
      } else {
        handler.use(m);
      }
    });

    // Apply apollo server middleware
    const apollo = await this.getApollo();
    handler.use(apollo.getMiddleware({ cors: false, path: graphqlPath }));

    this.handler = handler;
    return handler;
  }

  public async getServer(graphqlPath: string) {
    if (this.server) return this.server;
    await this.init();

    // Create the http server from an express app
    const handler = await this.getHandler(graphqlPath);
    const server = createServer(express().use(handler));

    // Apply apollo subscription handlers
    const apollo = await this.getApollo();
    apollo.installSubscriptionHandlers(server);

    this.server = server;
    return server;
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
    graphqlPath = '/graphql'
  ) {
    if (this.isListening)
      throw new Error('The gateway server is already running');
    await this.init();

    // Create a new server instance
    const server = await this.getServer(graphqlPath);

    // Spin up server and log startup message
    await new Promise<void>((resolve, reject) => {
      server.on('error', reject);
      server.listen(port, host, resolve);
    });
    const info = server.address();
    if (info && typeof info !== 'string') {
      host = info.address;
      port = info.port;
    }
    if (host === '127.0.0.1') host = 'localhost';
    console.log(`ShatterCMS Gateway • http://${host}:${port}${graphqlPath}`);

    this.isListening = true;
  }

  /**
   * Stops the gateway server
   */
  public async stop() {
    await new Promise<void>((resolve, reject) => {
      if (!this.server) return resolve();
      this.server.once('close', resolve);
      this.server.close();
    });
    if (this.apollo) await this.apollo.stop();
    this.isListening = false;
  }
}
