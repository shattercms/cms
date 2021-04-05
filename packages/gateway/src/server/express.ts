import express from 'express';
import { ConnectionOptions, createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import { ApolloServer, SchemaDirectiveVisitor } from 'apollo-server-express';
import { BuildContext, ShatterContext } from '@shattercms/types';
import { authMiddleware } from './middleware';

export const startServer = async (context: BuildContext) => {
  const app = express();

  // Execute user express middleware
  context.config.expressMiddlewares.forEach((middleware) => {
    if (Array.isArray(middleware)) {
      app.use(middleware[0], middleware[1]);
    } else {
      app.use(middleware);
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
    globalMiddlewares: [authMiddleware],
  });
  SchemaDirectiveVisitor.visitSchemaDirectives(schema, context.directives);

  // Setup apollo
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }): ShatterContext => ({
      req,
      res,
      config: context.config,
      orm,
      auth: {
        hasPermission: async (resource, ctx) => {
          for (const handler of context.authHandlers) {
            const result = await handler(resource, ctx);
            if (result === true) {
              return true;
            }
          }
          return false;
        },
      },
    }),
    formatError: (error) => {
      if (context.config.debug) {
        return error;
      }

      if (error.extensions?.exception) {
        delete error.extensions.exception.stacktrace;
      }
      return error;
    },
    uploads: false,
  });

  // Apply apollo middleware
  apolloServer.applyMiddleware({ app, cors: context.config.server.cors });

  // Start server
  let host = context.config.server.host;
  let port = context.config.server.port;
  const server = app.listen(port, host, () => {
    const info = server.address();
    if (info && typeof info !== 'string') {
      host = info.address;
      port = info.port;
    }
    if (host === '127.0.0.1') host = 'localhost';

    console.log(`ShatterCMS • http://${host}:${port}/graphql`);
  });
};
