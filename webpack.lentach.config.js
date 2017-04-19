var HtmlWebpackPlugin = require('html-webpack-plugin');
var DefinePlugin = require('webpack/lib/DefinePlugin');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: __dirname + '/index.html',
    filename: 'index.html',
    inject: 'body'
});
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

module.exports = {
    entry: [
        './app/index.tsx'
    ],
    output: {
        path: '/home/serega/projects/textogram/static',
        filename: 'bundle.js',
        // vendor: ['article']
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
    plugins: [
        new ExtractTextPlugin('bundle.css'),
        new DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify("local"),
                API_URL: JSON.stringify("http://localhost:8000/api/v1"),
                VK_APP: JSON.stringify("5598086"),
                FB_APP: JSON.stringify("1270929192923451"),
                IS_LENTACH: JSON.stringify(true)
            }
        }),
        HTMLWebpackPluginConfig
    ]
};