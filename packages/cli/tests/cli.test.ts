import { resolveModule, getConfig } from '../src';
import path from 'path';

it('resolves modules', () => {
  expect(resolveModule('@shattercms/shards')).toStrictEqual([
    '@shattercms/shards',
    undefined,
  ]);
  expect(resolveModule(['@shattercms/shards'])).toStrictEqual([
    '@shattercms/shards',
    undefined,
  ]);
  expect(resolveModule(['@shattercms/shards', { test: true }])).toStrictEqual([
    '@shattercms/shards',
    { test: true },
  ]);
  expect(resolveModule({ path: '@shattercms/shards' })).toStrictEqual([
    '@shattercms/shards',
    undefined,
  ]);
  expect(
    resolveModule({ path: '@shattercms/shards', options: { test: true } })
  ).toStrictEqual(['@shattercms/shards', { test: true }]);
});

it('uses the right config file', () => {
  expect(getConfig(path.resolve(__dirname, './projects/ts'), {})).toMatchObject(
    { type: 'ts' }
  );
  expect(getConfig(path.resolve(__dirname, './projects/js'), {})).toMatchObject(
    { type: 'js' }
  );
  expect(
    getConfig(path.resolve(__dirname, './projects/json'), {})
  ).toMatchObject({ type: 'json' });
});

it('applies config defaults', () => {
  expect(getConfig(path.resolve(__dirname, './projects/ts'), {})).toMatchObject(
    { gateway: {}, modules: {}, server: {}, type: 'ts' }
  );

  expect(
    getConfig(path.resolve(__dirname, './projects/ts'), {
      port: 4000,
      host: 'localhost',
      debug: true,
    })
  ).toMatchObject({
    gateway: { debug: true },
    modules: {},
    server: { port: 4000, host: 'localhost' },
    type: 'ts',
  });
});
