import type { Config } from 'prettier';

const config: Config = {
  singleQuote: true,
  trailingComma: 'es5',
  semi: true,
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
