import { defineConfig, presetWind4, transformerCompileClass } from 'unocss';
import { shortcuts, theme } from './src/styles/config';

export default defineConfig({
  presets: [presetWind4({ dark: 'media' })],
  transformers: [transformerCompileClass({ trigger: /(["'`])(?<name>)(.+?)\1/g })],
  theme,
  shortcuts,
});
