#!/usr/bin/env node
import path from 'path';
import cac from 'cac';
import { getConfig } from './config';
import createRequire from 'create-require';
import { ShatterConfig } from '@shattercms/types';
import 'reflect-metadata';

// CLI
const cli = cac('shattercms');
cli.option('--dir <path>', 'Run ShatterCMS in another directory', {
  default: '.',
});
cli.option('--debug', 'Print debug messages', {
  default: false,
});
cli.help();
const cmd = cli.parse();

const main = async () => {
  if (cmd.options.help) {
    return;
  }

  const rootDir = path.resolve(cmd.options.dir);
  const rootRequire = createRequire(rootDir);

  const config: ShatterConfig = await getConfig(rootDir);
  config.rootDir = rootDir;
  config.debug = cmd.options.debug;

  const Gateway = rootRequire('@shattercms/gateway').default;
  new Gateway(config);
};
main().catch((error) => {
  console.log(error);
});
