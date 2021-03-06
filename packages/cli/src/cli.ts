#!/usr/bin/env node
import cac from 'cac';
import Gateway from '@shattercms/gateway';
import { getConfig, resolveModule } from '.';
import path from 'path';

const cli = cac('shattercms');
cli.help();
cli
  .command('', 'Run the ShatterCMS Gateway server')
  .option('--debug', 'Print debug messages', { default: false })
  .option('--port <port>', 'Set server port')
  .option('--host <host>', 'Set server hostname')
  .option('--dir <dir>', 'Use another directory as root');

const main = async () => {
  const { options } = cli.parse();
  if (options.help || options.version) return;

  // Get root directory
  const root = options.dir ? options.dir : '.';

  // Setup gateway
  const config = getConfig(root, options);
  const gateway = new Gateway(config.gateway);

  // Add modules
  for (const module of config.modules ?? []) {
    // Resolve module
    const [p, options] = resolveModule(module);

    // Resolve module path
    const isLocal = p.startsWith('./') || p.startsWith('/');
    let requirePath = isLocal ? path.resolve(path.join(root, p)) : p;

    // Pass module to gateway
    const apiModule = require(requirePath).default;
    gateway.addModule(apiModule, options);
  }

  // Start server
  gateway.listen(config.server.port, config.server.host);
};
main();
