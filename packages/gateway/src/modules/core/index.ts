import { AuthenticationError } from 'apollo-server-express';
import { Resolver, Query, ObjectType, Field, MiddlewareFn } from 'type-graphql';
import type { AuthMiddleware, Module, GatewayContext } from '@shattercms/types';
const packageJson = require('../../../package.json');

@ObjectType()
class CMSInfoOutput {
  @Field()
  version!: string;
}

@Resolver()
class ShatterResolver {
  @Query(() => CMSInfoOutput)
  cms_info(): CMSInfoOutput {
    return { version: packageJson.version };
  }
}

const authHandler: AuthMiddleware = ({ permission }) => {
  if (permission === true) return true;
};

const authMiddleware: MiddlewareFn<GatewayContext> = async (
  { context, info, root },
  next
) => {
  // Only process root fields
  if (info.parentType.name.toLowerCase() !== info.operation.operation)
    return next();

  // Construct scope and check permission
  const scope = `${info.operation.operation}.${info.fieldName}`;

  const permission = context.config.permissions[scope];
  const hasAccess = await context.auth.hasPermission(
    { scope, permission, data: root },
    context
  );
  if (!hasAccess) {
    throw new AuthenticationError(
      'You are not authorized to access this resource.'
    );
  }

  return next();
};

export const coreModule: Module = (context) => {
  context.graphqlMiddleware.push(authMiddleware);
  context.authMiddleware.push(authHandler);
  context.resolvers.push(ShatterResolver);
};
