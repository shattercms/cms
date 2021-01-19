import { Connection, EntitySchema } from 'typeorm';
import { SchemaDirectiveVisitor } from 'apollo-server-express';
import { Request, Response } from 'express';
import { CorsOptions, CorsOptionsDelegate } from 'cors';

export interface ShatterConfig {
  rootDir: string;
  debug: boolean;

  modules: Array<ConfigModule>;

  server: {
    host: string;
    port: number;
    cors: CorsOptions | CorsOptionsDelegate | boolean;
    https?: {
      key: string;
      cert: string;
    };
  };

  postgres: {
    url?: string;
    database: string;
    username: string;
    password: string;
    logging: boolean;
    synchronize: boolean;
    migrations?: (string | Function)[];
  };

  permissions: {
    [scope: string]: any;
  };

  [key: string]: any;
}
export type UserConfig = DeepPartial<ShatterConfig>;

export interface ShatterContext {
  config: ShatterConfig;
  req: Request;
  res: Response;
  orm: Connection;

  auth: {
    hasPermission: AuthHandler;
  };
}

export interface BuildContext {
  config: ShatterConfig;
  modules: Array<[Module, any]>;

  resolvers: Array<Function>;
  entities: Array<Entity>;
  directives: { [name: string]: typeof SchemaDirectiveVisitor };
  authHandlers: Array<AuthHandler>;
}

export type Module<T = any> = (
  context: BuildContext,
  moduleOptions: T
) => Promise<void> | void;
export type ConfigModule = string | Module | [string | Module, any];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]> | T[P];
};

export type Entity = string | Function | EntitySchema<any> | undefined;

export type AuthHandler = (
  resource: { scope: string; permission: any; data: any },
  context: ShatterContext
) => Promise<boolean | undefined> | boolean | undefined;
