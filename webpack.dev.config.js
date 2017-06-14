var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var DefinePlugin = require('webpack/lib/DefinePlugin');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: __dirname + '/index.html',
    filename: 'index.html',
    inject: 'body'
});
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        app: './app/index.tsx',
        vendor: Object.keys(require('./package.json').dependencies)
    },
    output: {
        path: __dirname + '/dist/dev',
        filename: 'bundle.js',
        // publicPath: '/static/'
    },
    devtool: "source-map",
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
                loader: ExtractTextPlugin.extract('style', 'css!postcss!sass?sourceMap'),
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                loader: 'file-loader?name=images/[hash].[ext]'
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
            require('precss'),
            require('autoprefixer')
        ];
    },
    plugins: [
        new ExtractTextPlugin('bundle.css'),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
        new DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("dev"),
                API_URL: JSON.stringify("http://textius.tk/api/v1"),
                AUTH_SERVICE_URL: JSON.stringify("http://auth.textius.tk"),
                VK_APP: JSON.stringify("5829713"),
                FB_APP: JSON.stringify("388271138196824"),
                GOOGLE_APP: JSON.stringify("40195744486-2lr3lt2adencnt9k54rc1mhl4a4kh70i.apps.googleusercontent.com"),
                PAYWALL_ENABLE: JSON.stringify(false)
            }
        }),
        HTMLWebpackPluginConfig
    ]
};