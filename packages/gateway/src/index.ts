import { BuildContext, ShatterConfig, UserConfig } from '@shattercms/types';
import { startServer } from './server';
import { getConfig, getBuildContext } from './setup';
import { coreModule } from './module';
import pino from 'pino';
const logger = pino({ prettyPrint: true });

export default class Gateway {
  buildContext: BuildContext;
  config: ShatterConfig;

  constructor(configUser: UserConfig) {
    this.config = getConfig(configUser);
    if (this.config.debug === true) {
      logger.level = 'debug';
    }

    this.buildContext = getBuildContext(this.config);
    this.init();
  }

  async init() {
    // Register modules in sequence
    logger.debug('modules:pre');
    await coreModule(this.buildContext, {});
    for (const module of this.buildContext.modules) {
      await module[0](this.buildContext, module[1]);
    }
    logger.debug('modules:post');

    this.main();
  }

  async main() {
    // Spin up server
    logger.debug('main:pre');
    await startServer(this.buildContext);
    logger.debug('main:post');
  }
}
