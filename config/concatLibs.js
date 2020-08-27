const path = require('path');
const webpack = require('webpack');
const baseDir = "./../";
const distFolder = baseDir + "bin/js";
const jsLibsPath = path.resolve(__dirname, baseDir + "bin/libs");

module.exports = (env, argv) => ({
    entry: {
        core: [
            path.resolve(jsLibsPath, "laya.core.js"),
            path.resolve(jsLibsPath, "laya.effect.js"),
            path.resolve(jsLibsPath, "laya.html.js"),
            path.resolve(jsLibsPath, "laya.ui.js"),
            path.resolve(jsLibsPath, "jszip.js")
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify('production/development')
        })
    ],
    devtool: argv.mode == 'development' ? 'source-map' : false,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    "presets": [
                        [
                            "@babel/preset-env",
                            {
                                "useBuiltIns": "usage",
                                "corejs": 3
                            }
                        ]
                    ],
                    "plugins": [
                        ["@babel/plugin-transform-modules-commonjs",{"strictMode": false}]
                    ]
                }
            }
        ]
    },
    optimization: {// 配置splitChunks插件，拆分公共的代码块出来
        // minimize: true,
        splitChunks: {
            chunks: "all",//在做代码分割时，只对异步代码生效，写成all的话，同步异步代码都会分割
            minSize: 0, //引入的包大于30KB才做代码分割
            maxSize: 3000000, //拆出来的代码块最大约3MB
            minChunks: 1, //当一个包至少被用了多少次的时候才进行代码分割
            name: true,//让cacheGroups里设置的名字有效
            automaticNameDelimiter: "_",
            cacheGroups: {//当打包同步代码时,上面的参数生效
                vendors: {
                    test: /[\\/]node_modules[\\/]/, //检测引入的库是否在node_modlues目录下的
                    priority: -10,//值越大,优先级越高.模块先打包到优先级高的组里
                    filename: 'vendors.js'//把所有的库都打包到一个叫vendors.js的文件里
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true//如果一个模块已经被打包过了,那么再打包时就忽略这个上模块
                }
            }
        }
        //以上是默认配置
    },
    resolve: {
        extensions: [".js"]
    },
    output: {
        filename: 'core.js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, distFolder)
    }
});