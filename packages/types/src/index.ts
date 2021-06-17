import type { Connection, EntitySchema, EntityTarget } from 'typeorm';
import type { Request, RequestHandler, Response } from 'express';
import type { MiddlewareFn } from 'type-graphql';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import type DataLoader from 'dataloader';
import type { ApolloServerExpressConfig } from 'apollo-server-express';

export interface GatewayConfig {
  debug: boolean;
  apollo: Omit<ApolloServerExpressConfig, 'schema' | 'context'>;
  postgres: {
    url?: string;
    database: string;
    username: string;
    password: string;
    logging: boolean;
    synchronize: boolean;
    migrations?: (string | Function)[];
    cache: PostgresConnectionOptions['cache'];
  };
  permissions: {
    [scope: string]: any;
  };
}

export interface GatewayContext {
  config: GatewayConfig;

  req: Request;
  res: Response;
  orm: Connection;

  auth: {
    hasPermission: AuthMiddleware;
  };

  getLoader: <E, K extends keyof E>(
    name: string,
    key: K,
    entity: EntityTarget<E>
  ) => DataLoader<E[K], E>;
}

export interface ModuleContext {
  config: GatewayConfig;

  modules: [module: Module, options?: any][];
  resolvers: Function[];
  entities: Entity[];

  authMiddleware: AuthMiddleware[];
  expressMiddleware: ExpressMiddleware[];
  graphqlMiddleware: GraphQLMiddleware[];
}

export type ExpressMiddleware =
  | RequestHandler
  | [path: string, handler: RequestHandler];
export type GraphQLMiddleware = MiddlewareFn<GatewayContext>;
export type AuthMiddleware = (
  resource: { scope: string; permission: any; data: any },
  context: GatewayContext
) => Promise<boolean | undefined> | boolean | undefined;

export type Module<T = any> = (
  context: ModuleContext,
  options?: T
) => Promise<void> | void;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]> | T[P];
};

export type Entity = string | Function | EntitySchema<any> | undefined;
