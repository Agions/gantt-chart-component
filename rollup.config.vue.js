import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import { dts } from 'rollup-plugin-dts';
import vue from 'rollup-plugin-vue';
import pkg from './package.json';

// 外部依赖，不会打包进最终文件
const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {})
];

export default [
  // Vue版本主要打包配置
  {
    input: 'src/components/gantt-chart/index.vue.js',
    output: [
      {
        file: 'dist/vue/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        inlineDynamicImports: true
      },
      {
        file: 'dist/vue/index.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named',
        inlineDynamicImports: true
      }
    ],
    external,
    plugins: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue']
      }),
      vue({
        preprocessStyles: true
      }),
      postcss({
        plugins: [autoprefixer()],
        extract: false
      }),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        sourceMap: true,
        outDir: 'dist/vue',
        declaration: false // 我们会使用dts插件生成声明文件
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        presets: ['@babel/preset-env']
      }),
      terser()
    ]
  },
  // 生成Vue版本的类型定义文件
  {
    input: 'src/components/gantt-chart/index.vue.js',
    output: {
      file: 'dist/vue/index.d.ts',
      format: 'es'
    },
    plugins: [
      // 添加解析插件以处理CSS导入和Vue文件
      resolve(),
      {
        name: 'ignore-css-and-vue',
        resolveId(source) {
          if (source.endsWith('.css') || source.endsWith('.vue')) {
            return source;
          }
          return null;
        },
        load(id) {
          if (id.endsWith('.css') || id.endsWith('.vue')) {
            return '';
          }
          return null;
        }
      },
      dts()
    ]
  }
]; 