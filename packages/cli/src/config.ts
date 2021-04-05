import { existsSync } from 'fs';
import jiti from 'jiti';
import path from 'path';
const jitiRequire = jiti();

export const getConfig = () => {
  const names = [
    'shatter.config.ts',
    'shatter.config.js',
    'shatter.config.json',
  ];

  for (const name of names) {
    const file = path.resolve(name);
    if (existsSync(file)) {
      let config = jitiRequire(file);
      if (config.default) {
        config = config.default;
      }
      return config;
    }
  }

  throw new Error('No configuration file found');
};
