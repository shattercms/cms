import {
  BuildContext,
  ConfigModule,
  Module,
  ShatterConfig,
} from '@shattercms/types';
import { jiti } from '../utils';
const jitiRequire = jiti();

const resolveModule = (
  module: ConfigModule,
  data: any = {}
): [Module, any] | undefined => {
  if (Array.isArray(module)) return resolveModule(module[0], module[1]);

  if (typeof module === 'string') {
    const moduleReq = jitiRequire(module) as Module | { default: Module };
    if (typeof moduleReq === 'object') {
      module = moduleReq.default;
    } else {
      module = moduleReq;
    }
  }

  if (typeof module === 'function') return [module, data];
};

export const getBuildContext = (config: ShatterConfig) => {
  // Resolve modules
  const modules: Array<[Module, any]> = [];
  for (const module of config.modules) {
    const m = resolveModule(module);
    if (!m) {
      console.log(`Invalid module "${module}"`);
      continue;
    }
    modules.push(m);
  }

  return {
    config,
    modules,
    resolvers: [],
    entities: [],
    directives: {},
    authHandlers: [],
  } as BuildContext;
};
