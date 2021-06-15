# ShatterCMS

<p align="center">
  <img src="./.github/shattercms.png" width="100px" alt="ShatterCMS Icon"/>
</p>
<p align="center">
  <a href="https://github.com/shattercms/cms/actions/workflows/test.yml"><img src="https://github.com/shattercms/cms/actions/workflows/test.yml/badge.svg" alt="Test Status"></a>
  <a href="https://www.npmjs.com/package/shattercms"><img src="https://badgen.net/npm/dt/shattercms" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/shattercms"><img src="https://badgen.net/npm/v/shattercms" alt="Version"></a>
  <a href="https://www.npmjs.com/package/shattercms"><img src="https://badgen.net/npm/types/shattercms" alt="Types"></a>
  <a href="https://github.com/shattercms/cms/blob/main/LICENSE"><img src="https://badgen.net/github/license/shattercms/cms" alt="License"></a>
</p>

> Modular Headless CMS built with GraphQL, TypeScript and Express.

## Getting Started

### Prerequisites

ShatterCMS Gateway uses a **PostgreSQL database** under the hood. Follow the guides for your platform to get a database running. If your connection options vary from the default, you can set your own in the config file.

`shatter.config.ts`

```ts
postgres: {
  url?: string,
  database: 'shattercms',
  username: 'postgres',
  password: 'postgres',
  logging: boolean,
  synchronize: boolean,
  migrations?: (string | Function)[],
}
```

### Installation

```bash
# npm
$ npm install shattercms

# yarn
$ yarn add shattercms
```

> `typeorm` does not list the `pg` package as dependency, causing issues on startup when using yarn 2. Just add the snippet below to your `.yarnrc.yml` to fix this issue.

`.yarnrc.yml`

```yml
packageExtensions:
  'typeorm@*':
    dependencies:
      pg: '*'
```

## Usage

### Configuration

`shatter.config.ts`

```ts
import { UserConfig } from 'shattercms';

const config: UserConfig = {
  modules: [],
};
export default config;
```

`shatter.config.js`

```js
/** @type {import('shattercms').UserConfig} */
const config = {
  modules: [],
};
module.exports = config;
```

`shatter.config.json`

```json
{
  "modules": []
}
```

### Adding modules

```ts
// Without passing options
export default {
  modules: ['@shattercms/shards'],
};

// With passing options
export default {
  modules: [
    ['@shattercms/shards', { foo: 'bar' }],
    // or
    {
      path: '@shattercms/shards',
      options: { foo: 'bar' },
    },
  ],
};

// Local modules
export default {
  modules: ['./local/module'],
};
```

### Start the Server

`package.json`

```json
"scripts": {
  "start": "shattercms"
}
```

```bash
# use a script
$ npm run start
$ yarn start

# or call directly
$ yarn shattercms

# view the help for all commands and options
$ yarn shattercms --help
```

## Development

### Create your own modules

`yourModule.ts`

```ts
import type { Module } from '@shattercms/types';

interface ModuleOptions {
  foo: string;
}

const exampleModule: Module<ModuleOptions> = (context, moduleOptions) => {
  // context.resolvers.push(YourCustomResolver);
  // context.entities.push(YourCustomEntities);
  // ...
  // console.log(moduleOptions)
};
export default exampleModule;
```

> TypeScript modules need to be compiled to JavaScript before they can be used with ShatterCMS.

`yourModule.js`

```js
module.exports = (context, moduleOptions) => {
  // context.resolvers.push(YourCustomResolver);
  // context.entities.push(YourCustomEntities);
  // ...
  // console.log(moduleOptions)
};
```

## License

This project is licensed under the **MIT License**.

See [LICENSE](LICENSE) for more information.
