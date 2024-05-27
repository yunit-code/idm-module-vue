
const path = require('path')
const chalk = require('chalk')
function resolve(dir) {
    return path.join(__dirname, dir)
}

const fileMode = process.env.FILE_MODE || 'dynamic'
let indexName = 'index';
if(fileMode== 'static') {
  indexName = 'index2'
}
console.log(`${chalk.blue('Current file mode')}   ------ >  ${chalk.yellow(fileMode)}`)
console.log(`${chalk.blue('Current file index')}  ------ >  ${chalk.yellow(indexName)}`)
console.log(`${chalk.green('Start building .....')}`)
const entryFileMap = {
  dynamic: 'src/main.js',
  static: 'src/mainStatic.js'
}
let assetsDir = "./static";
let getAssetsDir = function(filename) {
  return path.posix.join(assetsDir, filename);
};
const isDev = process.env.NODE_ENV === 'development'
let uuidCharts = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
let getGUID = function(len, radix) {
  var chars = uuidCharts,
      uuid = [],
      i;
  radix = radix || chars.length;
  len = len || 16;
  if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = "";
      uuid[14] = "4";

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
          if (!uuid[i]) {
              r = 0 | (Math.random() * 16);
              uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
          }
      }
  }

  return uuid.join("");
}
const splitChunks = {
  chunks: 'async',
  minSize: 2000000,
  minChunks: 1,
  maxAsyncRequests: 30,
  maxInitialRequests: 30,
  enforceSizeThreshold: 50000,
  cacheGroups: {
    vendors: {
      name: 'chunk-vendors2',
      test: /[\\/]node_modules[\\/]/,
      enforce: true,
      reuseExistingChunk: true,
      priority: 0
    }
  },
}
const externals = {
  vue: 'Vue',
  'vue-router': 'VueRouter',
  vuex: 'Vuex',
  // axios: 'axios',
  jquery: '$'
}
module.exports = {
    publicPath:"./",
    productionSourceMap: false,
    assetsDir:assetsDir,
    transpileDependencies: [
        /[/\\]node_modules[/\\](.+?)?sockjs-client(.*)/,
        /[/\\]node_modules[/\\](.+?)?ant-design_colors(.*)[/\\]colors/,
    ],
    pages:{
      [indexName]: {
        // page 的入口
        entry: entryFileMap[fileMode],
        // 模板来源
        template: 'public/index.html',
        // 在 dist/index.html 的输出
        filename: 'index.html',
        // 当使用 title 选项时，
        // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
        title: '',
        includeScripts: [
           "./lib/vue.min.js",
           "./lib/jquery.min.js",
            "./lib/axios.min.js",
            "./lib/qs.js",
            "./lib/lodash.min.js",
            "./lib/idm.core.js"
        ],
        includeCss:[
          "./lib/idm.base.css"
        ]
      },
    },
    chainWebpack(config) {
      config.externals(externals)
      config
      .plugin('define')
      .tap(args => { 
          args[0]['process.env.CodeVar'] = JSON.stringify("CodeVar_"+getGUID()+"_"+new Date().getTime());
          return args
      })
      // set svg-sprite-loader
      config.module
        .rule('svg')
        .exclude.add(resolve('src/icons'))
        .end()
      config.module
        .rule('icons')
        .test(/\.svg$/)
        .include.add(resolve('src/icons'))
        .end()
        .use('svg-sprite-loader')
        .loader('svg-sprite-loader')
        .options({
          symbolId: 'icon-[name]'
        })
        .end()
        /**
         * 图片打包不转换base64，可自由选择启用还是不启用，如果小的图片比较多的时候建议启用这个
         */
        // config.module
        // .rule("images")
        // .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
        // .use("url-loader")
        // .loader("url-loader")
        // .options({
        //   name: getAssetsDir(`img/[name].[hash:8].[ext]`),
        //   limit: 1
        // })
      // config
      //   .plugin('webpack-bundle-analyzer')
      //   .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    },
    configureWebpack: {
      optimization: fileMode == 'dynamic' ?  undefined : { splitChunks },
      plugins: [
        // new MiniCssExtractPlugin({
        //   // 修改打包后css文件名
        //   filename: `${assetsDir}/css/[name].css`,
        //   chunkFilename: `${assetsDir}/css/[name].css`
        // }),
        // new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/)
      ],
      output: {
        // 输出重构  打包编译后的 文件名称
        filename: `${assetsDir}/js/[name].js`,
        chunkFilename: `${assetsDir}/js/[name].js`,
        jsonpFunction:JSON.stringify("webpackJsonp_"+getGUID()+"_"+new Date().getTime())
      },
      resolve:{
        extensions: ['.js', '.vue', '.json'],
        alias: {
          //按需引入ant design的图标，防止打包文件过大，如果使用ant design vue请放开此注释
          // '@ant-design/icons/lib/dist$': resolve('src/plugins/antdicons.js')
        }
      }
    },
    css: {
        // 是否使用css分离插件 ExtractTextPlugin
        extract: isDev ? false : {
          filename: `${assetsDir}/css/[name].css`,
          chunkFilename: `${assetsDir}/css/[name].css`
        },
        // 开启 CSS source maps?
        sourceMap: isDev,
        // css预设器配置项
        // 启用 CSS modules for all css / pre-processor files.
        requireModuleExtension: true,
        loaderOptions: {
          // 给 sass-loader 传递选项
          sass: {
            // @/ 是 src/ 的别名
            // 所以这里假设你有 `src/variables.sass` 这个文件
            // 注意：在 sass-loader v8 中，这个选项名是 "prependData"
            // prependData: `@import "@/style/common/common.scss";`
          }
        }
    },
    devServer: {
        proxy: {
            '^/DreamWeb/*': {
                target: "http://localhost:8080",
                changeOrigin: true,
                secure: false
            }
        }
    }

}