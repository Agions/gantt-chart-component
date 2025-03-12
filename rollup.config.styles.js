import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

export default [
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
  }
]; 