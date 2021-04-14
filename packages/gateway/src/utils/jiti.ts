import _jiti from 'jiti';
export const jiti = () =>
  _jiti(undefined, {
    transformOptions: {
      babel: {
        plugins: [
          // Add babel module to fix error with using decorators
          require('@babel/plugin-proposal-class-properties'),
        ],
      },
    },
  });
