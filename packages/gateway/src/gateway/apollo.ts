import { ConnectionOptions, createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import type { ModuleContext } from '@shattercms/types';
import { getGatewayContext } from './context';

export const getApollo = async (context: ModuleContext) => {
  // Create database connection
  const orm = await createConnection({
    ...context.config.typeorm,
    type: 'postgres',
    entities: context.entities,
  } as ConnectionOptions);
  orm.runMigrations();

  // Build schema
  const schema = await buildSchema({
    resolvers: context.resolvers as any,
    globalMiddlewares: context.graphqlMiddleware,
  });

  // Start apollo server
  const apollo = new ApolloServer({
    ...context.config.apollo,
    schema,
    context: ({ req, res }) => getGatewayContext(context, { req, res, orm }),
  });
  await apollo.start();

  return apollo;
};
