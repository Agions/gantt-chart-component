import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import { dts } from 'rollup-plugin-dts';
import pkg from './package.json';

// 外部依赖，不会打包进最终文件
const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {})
];

// 创建两个构建配置
export default [
  // React版本主要打包配置
  {
    input: 'src/components/gantt-chart/index.react.js',
    output: [
      {
        file: 'dist/react/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        inlineDynamicImports: true
      },
      {
        file: 'dist/react/index.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named',
        inlineDynamicImports: true
      }
    ],
    external,
    plugins: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        sourceMap: true,
        outDir: 'dist/react',
        declaration: false // 我们会使用dts插件生成声明文件
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        presets: ['@babel/preset-react']
      }),
      postcss({
        plugins: [autoprefixer()],
        inject: false,
        extract: false
      }),
      terser()
    ]
  },
  // 生成React版本的类型定义文件
  {
    input: 'src/components/gantt-chart/index.react.js',
    output: {
      file: 'dist/react/index.d.ts',
      format: 'es'
    },
    plugins: [
      // 添加解析插件以处理CSS导入
      resolve(),
      // 添加插件以忽略CSS文件
      {
        name: 'ignore-css',
        resolveId(source) {
          if (source.endsWith('.css')) {
            return source;
          }
          return null;
        },
        load(id) {
          if (id.endsWith('.css')) {
            return '';
          }
          return null;
        }
      },
      dts()
    ]
  }
]; 