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
  // 主要打包配置
  {
    input: 'src/components/gantt-chart/index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        inlineDynamicImports: true
      },
      {
        file: pkg.module,
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
      postcss({
        plugins: [autoprefixer()],
        extract: 'style.css',
        minimize: true,
        // 确保可以处理.vue文件中的样式
        extensions: ['.css', '.scss', '.sass', '.less', '.styl', '.vue'],
        inject: false
      }),
      vue({
        preprocessStyles: true,
        css: false // 让postcss插件处理样式
      }),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        sourceMap: true
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        presets: ['@babel/preset-react']
      }),
      terser()
    ]
  },
  // 打包样式文件
  {
    input: 'src/components/gantt-chart/styles/index.css',
    output: {
      file: 'dist/style.css'
    },
    plugins: [
      postcss({
        plugins: [autoprefixer()],
        extract: true,
        minimize: true
      })
    ]
  },
  // 生成类型定义文件
  {
    input: 'src/components/gantt-chart/index.js',
    output: {
      file: pkg.types,
      format: 'es'
    },
    plugins: [
      // 添加解析插件以处理CSS导入
      resolve(),
      // 添加插件以忽略CSS文件和Vue文件
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