#!/usr/bin/env node
import cac from 'cac';
import Gateway from '@shattercms/gateway';
import { getConfig } from './config';
import { ShatterConfig } from '@shattercms/types';
import 'reflect-metadata';

// CLI
const cli = cac('shattercms');
cli.option('--debug', 'Print debug messages', {
  default: false,
});
cli.help();
const cmd = cli.parse();

const main = async () => {
  if (cmd.options.help) return;

  const config: ShatterConfig = await getConfig();
  config.debug = cmd.options.debug;

  const gateway = new Gateway(config);
};
main().catch((err) => {
  console.error(err);
});
