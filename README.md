# ShatterCMS

<div style="display: flex; align-items: center; flex-flow: column;">
<img style="display: block; height: 200px; margin-bottom: 20px;" src="./.github/shattercms.png" alt="ShatterCMS Icon"/>

[![test](https://github.com/shattercms/cms/actions/workflows/test.yml/badge.svg)](https://github.com/shattercms/cms/actions/workflows/test.yml)
[![Downloads](https://badgen.net/npm/dt/shattercms)](https://www.npmjs.com/package/shattercms)
[![Version](https://badgen.net/npm/v/shattercms)](https://www.npmjs.com/package/shattercms)
[![Types](https://badgen.net/npm/types/shattercms)](https://www.npmjs.com/package/shattercms)
[![License](https://badgen.net/github/license/shattercms/cms)](https://github.com/shattercms/cms/blob/main/LICENSE)

</div>

> Modular Headless CMS built with GraphQL, TypeScript and Express.

## Installation

```bash
# npm
$ npm install shattercms

# yarn
$ yarn add shattercms
```

> You likely have to install the `pg` package too, as `typeorm` does not list it as dependency. The gateway server will not start without it.

## Configuration

#### **`shatter.config.ts`**

```ts
import { UserConfig } from 'shattercms';

const config: UserConfig = {
  modules: [],
};
export default config;
```

#### **`shatter.config.js`**

```js
/** @type {import('shattercms').UserConfig} */
const config = {
  modules: [],
};
module.exports = config;
```

#### **`shatter.config.json`**

```json
{
  "modules": []
}
```

## Adding modules

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

## Start the Server

#### **`package.json`**

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

## Create your own modules

#### **`yourModule.ts`**

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

#### **`yourModule.js`**

```js
module.exports = (context, moduleOptions) => {
  // context.resolvers.push(YourCustomResolver);
  // context.entities.push(YourCustomEntities);
  // ...
  // console.log(moduleOptions)
};
```
