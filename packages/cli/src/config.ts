import createRequire from 'create-require';
import { existsSync } from 'fs';
import path from 'path';

export const getConfig = (rootDir: string) => {
  const rootRequire = createRequire(rootDir);

  const names = ['shatter.js', 'shatter.json'];
  for (const name of names) {
    const file = path.resolve(rootDir, name);
    if (existsSync(file)) {
      let config = rootRequire(file);
      if (config.default) {
        config = config.default;
      }
      return config;
    }
  }

  throw new Error('No configuration file found');
};
