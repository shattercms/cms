import { Router } from 'express';
import { ConnectionOptions, createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import type { ModuleContext, GatewayContext } from '@shattercms/types';

export const getHandler = async (context: ModuleContext) => {
  const handler = Router();

  // Execute user express middleware
  context.expressMiddleware.forEach((m) => {
    if (Array.isArray(m)) {
      handler.use(m[0], m[1]);
    } else {
      handler.use(m);
    }
  });

  // Create database connection
  const orm = await createConnection({
    ...context.config.postgres,
    type: 'postgres',
    entities: context.entities,
  } as ConnectionOptions);
  orm.runMigrations();

  // Build schema
  const schema = await buildSchema({
    resolvers: context.resolvers as any,
    globalMiddlewares: context.graphqlMiddleware,
  });

  // Setup apollo
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }): GatewayContext => ({
      req,
      res,
      config: context.config,
      orm,
      auth: {
        hasPermission: async (resource, ctx) => {
          for (const handler of context.authMiddleware) {
            const result = await handler(resource, ctx);
            if (result === true) return true;
          }
          return false;
        },
      },
    }),
    uploads: false, // Disable uploads to prevent version mismatch
  });

  // Apply apollo middleware
  handler.use(apolloServer.getMiddleware({ cors: false }));

  return handler;
};
