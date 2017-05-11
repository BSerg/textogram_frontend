var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var DefinePlugin = require('webpack/lib/DefinePlugin');
var JavaScriptObfuscator = require('webpack-obfuscator');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: __dirname + '/index.html',
    filename: 'index.html',
    inject: 'body'
});
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        app: './app/index.tsx',
        vendor: ['react', 'react-router', 'react-dom']
    },
    output: {
        path: __dirname + '/dist/lentach_prod',
        filename: '[name].js',
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx", ".css", ".sass"]
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css!sass?sourceMap'),
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                loader: 'file-loader?name=images/[name].[ext]'
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                loader: 'file?name=fonts/[name].[ext]'
            },
            {
                test: /\.json$/,
                loader: 'file?name=json/[name].[ext]'
            }
        ],
        preLoaders: [
            { test: /\.jsx?$/, loader: "source-map-loader" }
        ]
    },
    postcss: function() {
        return [
            // require('postcss-smart-import'),
            require('precss'),
            require('autoprefixer')
        ];
    },
    plugins: [
        new ExtractTextPlugin('bundle.css'),
        new webpack.optimize.CommonsChunkPlugin("bundle.js", ['editor.js', 'vendor.js']),
        new JavaScriptObfuscator ({
            rotateUnicodeArray: true
        }),
        new DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('production'),
                API_URL: JSON.stringify("http://lentach.media/api/v1"),
                VK_APP: JSON.stringify("5951821"),
                FB_APP: JSON.stringify("176821492828506"),
                // PROD for lentach.media
                // "VK_APP": JSON.stringify("5955558"),
                // "FB_APP": JSON.stringify("722837137876952"),
                IS_LENTACH: JSON.stringify(true)
            }
        }),
        HTMLWebpackPluginConfig
    ]
};