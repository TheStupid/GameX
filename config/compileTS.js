const path = require('path');
const webpack = require('webpack');
const distFolder = "./../bin/js";
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = (env,argv)=>({
    entry: {
        bundle: './src/Main.ts', // 项目主入口
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify('production/development')
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'disabled', // 不启动展示打包报告的http服务器
            generateStatsFile: true, // 是否生成stats.json文件
        })
    ],
    devtool: argv.mode == 'development' ? 'eval-source-map' : false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use:[
                  {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        experimentalWatchApi: true
                    }
                  }
                ]
            }
        ]
    },
    optimization: {// 配置splitChunks插件，拆分公共的代码块出来
        // splitChunks: {
        //     chunks: "all",//在做代码分割时，只对异步代码生效，写成all的话，同步异步代码都会分割
        //     minSize: 0, //引入的包大于30KB才做代码分割
        //     maxSize: 3000000, //拆出来的代码块最大约3MB
        //     minChunks: 1, //当一个包至少被用了多少次的时候才进行代码分割
        //     name: true,//让cacheGroups里设置的名字有效
        //     automaticNameDelimiter: "_",
        //     cacheGroups: {//当打包同步代码时,上面的参数生效
        //         vendors: {
        //             test: /[\\/]node_modules[\\/]/, //检测引入的库是否在node_modlues目录下的
        //             priority: -10,//值越大,优先级越高.模块先打包到优先级高的组里
        //             filename: 'vendors.js'//把所有的库都打包到一个叫vendors.js的文件里
        //         },
        //         default: {
        //             minChunks: 2,
        //             priority: -20,
        //             reuseExistingChunk: true//如果一个模块已经被打包过了,那么再打包时就忽略这个上模块
        //         }
        //     }
        // }
        //以上是默认配置
    },
    resolve: {
        extensions: [".ts"]
    },
    output: {
        filename: 'bundle.js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, distFolder)
    }
});