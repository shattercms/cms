import { AuthHandler, Module } from '@shattercms/types';

const authHandler: AuthHandler = ({ permission }) => {
  if (permission === 'public') {
    return true;
  }
};

export const coreModule: Module = (context) => {
  context.authHandlers.push(authHandler);
};
