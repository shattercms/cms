import { ShatterContext } from '@shattercms/types';
import { MiddlewareFn } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';

export const authMiddleware: MiddlewareFn<ShatterContext> = async (
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
