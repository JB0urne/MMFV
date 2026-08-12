/**
 * Extra esbuild options for Nest.
 * SWC emits decorator metadata; plain esbuild does not.
 * Also maps tsconfig path aliases so workspace libs bundle from source.
 */
const fs = require('fs');
const path = require('path');
const swc = require('@swc/core');

const root = path.resolve(__dirname, '../..');
const baseTsconfig = JSON.parse(
    fs.readFileSync(path.join(root, 'tsconfig.base.json'), 'utf8'),
);
const pathAliases = baseTsconfig.compilerOptions?.paths ?? {};

const alias = {};
for (const [name, targets] of Object.entries(pathAliases)) {
    if (!Array.isArray(targets) || targets.length === 0) {
        continue;
    }
    alias[name] = path.join(root, targets[0]);
}

const swcPlugin = {
    name: 'swc-nestjs',
    setup(build) {
        build.onLoad({ filter: /\.ts$/ }, async args => {
            const source = await fs.promises.readFile(args.path, 'utf8');
            const result = await swc.transform(source, {
                filename: args.path,
                sourceMaps: true,
                jsc: {
                    parser: {
                        syntax: 'typescript',
                        decorators: true,
                    },
                    transform: {
                        legacyDecorator: true,
                        decoratorMetadata: true,
                    },
                    target: 'es2020',
                    keepClassNames: true,
                },
                module: {
                    type: 'es6',
                },
            });
            return {
                contents: result.code,
                loader: 'js',
                resolveDir: path.dirname(args.path),
            };
        });
    },
};

/** @type {import('esbuild').BuildOptions} */
module.exports = {
    sourcemap: true,
    keepNames: true,
    outExtension: {
        '.js': '.js',
    },
    alias,
    plugins: [swcPlugin],
};
