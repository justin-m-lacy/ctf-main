import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv } from 'vite';
import { resolve } from 'path'
import { createHtmlPlugin } from "vite-plugin-html";
import { createAssetMap } from './map-assets';
import { existsSync } from 'fs';
import path from 'path';
import { mergeEnv } from './load-env';

const addSlash = (s?: string) => {
  if (!s) return '/';
  if (!s.startsWith('/')) s = '/' + s;
  return !s.endsWith('/') ? s + '/' : s;
}

// https://vitejs.dev/config/
export default async function (config: ConfigEnv) {

  const isProduction = config.mode === 'production';

  const cmdFlavor = process.env['FLAVOR'] ?? 'ctf';
  const env_dir = cmdFlavor ? `${cmdFlavor}/` : './'

  let env = process.env;
  /// MANUAL_ENV Means environmental variables are set through scripts only.
  /// No environment files are loaded.
  if (!process.env['MANUAL_ENV']) {
    console.log(`env dir: ${env_dir}`);
    env = mergeEnv(loadEnv(config.mode, env_dir), env);
  }

  const baseDir = addSlash(env.VITE_CLIENT_BASE) ?? '/'
  console.log(`BUILD: ${cmdFlavor ?? ''} ${config.mode}`);
  console.log(`Server: ${env.VITE_SERVER_HOST}:${env.VITE_SERVER_PORT}${baseDir}`);

  const flavor = cmdFlavor ?? env.VITE_FLAVOR;

  return defineConfig({

    envDir: env_dir,

    base: baseDir,

    publicDir: cmdFlavor ? resolve(cmdFlavor, 'public') : 'public',

    resolve: {

      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: [
        {
          find: /^@server/,
          replacement: '',
          customResolver: function (
            source,
          ) {

            const serverPath = path.join(__dirname, '../server');

            /// check for file in base server path or server flavor path.
            if (flavor != null) {
              let uri = path.join(serverPath, flavor, 'assets', source);

              if (existsSync(uri)) {
                return uri;
              }
            }

            let uri = path.join(serverPath, 'assets', source);
            if (existsSync(uri)) {
              return uri;
            }
            return null;
          }
        },
        { find: /^@pixiwixi\//, replacement: `${resolve(__dirname, "../pixiwixi/")}/` },
        { find: /^@model\//, replacement: `${resolve(__dirname, "./src/model/")}/` },
        { find: /^@components\//, replacement: `${resolve(__dirname, "./src/components/")}/` },
        { find: /^@\//, replacement: `${resolve(__dirname, './src/')}/` },

      ]
    },

    build: {

      /// Build output to static server directory.
      outDir: resolve(__dirname, 'dist'),

      commonjsOptions: {
      },
      rollupOptions: {

        /*plugins: [
          externalGlobals({
            jquery: "howler"
          })
        ],*/
        output: {
          globals: {
            howler: "howler"
          },
          manualChunks(id: any) {
            if (id.includes("node_modules/") && !id.endsWith(".css")) {
              return "libs";
            }
          },
        },
      }
    },

    plugins: [

      createAssetMap(),

      createHtmlPlugin({
        minify: isProduction,
        template: './index.html'
        , inject: {
          data: env,
        },
      }),


    ],

    optimizeDeps: {

      exclude: ['howler'],

    },

    server: {

      port: 3001,
      cors: true,
      https: {

      },
      hmr: {
        host: 'localhost',
      },
      fs: {
        strict: false
      },
      watch: {
        ignored: [
        ],
      },
    },
  });
}