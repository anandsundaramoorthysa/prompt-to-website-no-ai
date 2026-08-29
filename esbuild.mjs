import { build, context } from 'esbuild';

const watch = process.argv.includes('--watch');

const common = {
  bundle: true,
  minify: !watch,
  sourcemap: watch,
  target: 'node18',
  logLevel: 'info'
};

const extension = {
  ...common,
  entryPoints: ['src/extension.ts'],
  outfile: 'dist/extension.js',
  platform: 'node',
  format: 'cjs',
  external: ['vscode']
};

const core = {
  ...common,
  entryPoints: ['src/index.ts'],
  outfile: 'dist/core.cjs',
  platform: 'node',
  format: 'cjs',
  minify: false
};

const cli = {
  ...common,
  entryPoints: ['src/cli.ts'],
  outfile: 'dist/cli.cjs',
  platform: 'node',
  format: 'cjs'
};

if (watch) {
  for (const cfg of [extension, cli, core]) (await context(cfg)).watch();
  console.log('watching…');
} else {
  await Promise.all([build(extension), build(cli), build(core)]);
}
