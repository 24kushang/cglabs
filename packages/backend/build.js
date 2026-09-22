import * as esbuild from 'esbuild';
import * as fs from 'node:fs';

const fixCjsRequiresPlugin = {
  name: 'fix-cjs-requires',
  setup(build) {
    const supportedNative = new Set([
      'buffer', 'crypto', 'events', 'path', 'stream', 'util', 'string_decoder', 'async_hooks', 'process'
    ]);

    const mocks = {
      perf_hooks: `
        export const performance = globalThis.performance || { now: () => Date.now() };
        export default { performance };
      `,
      os: `
        export const homedir = () => '/';
        export const tmpdir = () => '/tmp';
        export const hostname = () => 'localhost';
        export const platform = () => 'browser';
        export const type = () => 'Browser';
        export const release = () => '1.0.0';
        export const cpus = () => [{ model: 'Worker CPU', speed: 2000 }];
        export const totalmem = () => 1073741824;
        export const freemem = () => 536870912;
        export default { homedir, tmpdir, hostname, platform, type, release, cpus, totalmem, freemem };
      `,
      fs: `
        export const readFileSync = () => '';
        export const writeFileSync = () => {};
        export const existsSync = () => false;
        export const promises = { readFile: async () => '', writeFile: async () => {} };
        export default { readFileSync, writeFileSync, existsSync, promises };
      `,
      net: `export default {};`,
      tls: `export default {};`,
      http: `export default {};`,
      https: `export default {};`,
      repl: `export default {};`,
      cluster: `export default {};`,
      dgram: `export default {};`,
      dns: `export default {};`,
      child_process: `export default {};`,
      v8: `export default {};`,
      vm: `export default {};`,
      module: `export default {};`,
    };

    build.onResolve({ filter: /.*/ }, args => {
      const cleanPath = args.path.replace(/^node:/, '');
      if (mocks[cleanPath]) {
        return { path: cleanPath, namespace: 'mock-node-module' };
      }
      return null;
    });

    build.onLoad({ filter: /.*/, namespace: 'mock-node-module' }, args => {
      return {
        contents: mocks[args.path] || 'export default {};',
        loader: 'js',
      };
    });

    build.onLoad({ filter: /\.(m?js|cjs|ts)$/ }, async (args) => {
      if (!args.path.includes('node_modules')) return;

      let contents;
      try {
        contents = await fs.promises.readFile(args.path, 'utf8');
      } catch (e) {
        return;
      }

      let modified = false;
      let headerImports = '';

      for (const b of Array.from(supportedNative)) {
        const regex1 = new RegExp(`require\\(["']${b}["']\\)`, 'g');
        const regex2 = new RegExp(`require\\(["']node:${b}["']\\)`, 'g');

        if (regex1.test(contents) || regex2.test(contents)) {
          const varName = `__imported_${b}__`;
          headerImports += `import * as ${varName} from "node:${b}";\n`;
          contents = contents.replace(regex1, varName).replace(regex2, varName);
          modified = true;
        }
      }

      if (modified) {
        return {
          contents: headerImports + contents,
          loader: args.path.endsWith('.ts') ? 'ts' : 'js',
        };
      }
    });
  },
};

await esbuild.build({
  entryPoints: ['src/worker.ts'],
  bundle: true,
  outfile: 'dist/worker.js',
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  mainFields: ['module', 'main'],
  plugins: [fixCjsRequiresPlugin],
  external: [
    'node:*',
    'cloudflare:*',
    '@nestjs/websockets/*',
    '@nestjs/microservices/*',
    '@nestjs/microservices',
    '@nestjs/platform-express',
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  banner: {
    js: `import { Buffer } from 'node:buffer'; import process from 'node:process'; globalThis.Buffer = Buffer; globalThis.process = process;`,
  },
  minify: false,
  sourcemap: true,
});

console.log('Backend worker bundled successfully with Buffer & Process banner polyfill.');
