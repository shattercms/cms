import { ShatterContext } from '@shattercms/types';
import { MiddlewareFn } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';

export const authMiddleware: MiddlewareFn<ShatterContext> = async (
  { context, info, root },
  next
) => {
  let node = info.path;
  let stages: string[] = [];

  // Root Path (Query, Mutation, ...)
  if (!node.prev && node.typename) {
    const type = node.typename?.toLowerCase();
    const action = node.key.toString();
    stages = [type, action];
  }

  /*
  // Regular Paths (user.id, user.posts.title, ...)
  if (node.prev) {
    stages.unshift(node.key.toString());
  }
  while (node.prev) {
    if (!node.prev.typename && node.typename) {
      stages.unshift(node.typename.toLowerCase());
      break;
    }
    node = node.prev;
    if (node.typename) {
      stages.unshift(node.key.toString());
    }
  }
  */

  // Only process root scopes
  if (stages.length < 1) {
    return next();
  }

  // Construct scope and check permission
  const scope = stages.join('.');
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
