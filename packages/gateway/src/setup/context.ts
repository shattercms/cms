import {
  BuildContext,
  ConfigModule,
  Module,
  ShatterConfig,
} from '@shattercms/types';
import createRequire from 'create-require';

const resolveModule = (
  rootRequire: NodeRequire,
  module: ConfigModule,
  data: any = {}
): [Module, any] | undefined => {
  if (Array.isArray(module)) {
    return resolveModule(rootRequire, module[0], module[1]);
  }

  if (typeof module === 'string') {
    const file = rootRequire.resolve(module);
    const moduleReq = rootRequire(file) as Module | { default: Module };
    if (typeof moduleReq === 'object') {
      module = moduleReq.default;
    } else {
      module = moduleReq;
    }
  }

  if (typeof module === 'function') {
    return [module, data];
  }
};

export const getBuildContext = (config: ShatterConfig) => {
  const rootRequire = createRequire(config.rootDir);

  // Resolve modules
  const modules: Array<[Module, any]> = [];
  for (const module of config.modules) {
    const m = resolveModule(rootRequire, module);
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
