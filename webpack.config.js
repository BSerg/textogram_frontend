var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var DefinePlugin = require('webpack/lib/DefinePlugin');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: __dirname + '/index.html',
    filename: 'index.html',
    inject: 'body'
});
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var nodeExternals = require('webpack-node-externals');

function getBuildPath(...paths) {
  return path.join(__dirname, (process.env.NODE_ENV == 'local' ? '/dist' : `/build/${process.env.NODE_ENV}`), ...paths);
}

module.exports = [
    {
        name: 'client',
        entry: {
            app: './app/index.tsx',
            vendor: [
                'react', 
                'react-router', 
                'react-dom', 
                'react-router-dom',
                'clientjs',
                // 'core-js',
                'flux',
                'js-cookie',
                'moment',
                'marked',
                'sortablejs',
                'to-markdown',
                'uuid'
            ]
        },
        output: {
            path: getBuildPath('public'),
            filename: 'bundle.js',
        },
        devtool: "source-map",
        resolve: {
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx", ".css", ".sass"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader'
                },
                {
                    test: /\.scss$/,
                    use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader!postcss-loader!sass-loader?sourceMap' }),
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/,
                    use: 'file-loader?name=images/[hash].[ext]'
                },
                {
                    test: /\.(eot|ttf|woff|woff2)$/,
                    use: 'file-loader?name=fonts/[name].[ext]'
                },
                {
                    test: /\.json$/,
                    use: 'file-loader?name=json/[name].[ext]'
                }
            ],
            // preLoaders: [
            //     { test: /\.jsx?$/, loader: "source-map-loader" }
            // ]
        },
        plugins: [
            new ExtractTextPlugin('bundle.css'),
            new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.js'}),
            new DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify("local"),
                    API_URL: JSON.stringify("http://textius.localhost/api/v1"),
                    AUTH_SERVICE_URL: JSON.stringify("http://auth.textius.localhost"),
                    VK_APP: '5829785',
                    FB_APP: '1270929192923451',
                    PAYWALL_ENABLE: JSON.stringify(true)
                }
            }),
            HTMLWebpackPluginConfig
        ],
        node: {
            fs: 'empty'
        }
    },
    {
        name: 'server',
        entry: {
            app: './app/server.ts'
        },
        target: "node",
        output: {
            path: getBuildPath(),
            filename: "server.js"
        },
        externals: [nodeExternals()],
        resolve: {
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx", ".css", ".sass"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader'
                },
                {
                    test: /\.json$/,
                    use: 'file-loader?name=json/[name].[ext]'
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/,
                    use: 'file-loader?name=images/[name].[ext]'
                },
                {
                    test: /\.scss$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader', 
                        use: 'css-loader!sass-loader?sourceMap', 
                        publicPath: 'public'
                    }),
                }
            ],
        },

        plugins: [
            new ExtractTextPlugin('bundle.server.css'),
            new DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify("local"),
                    API_URL: JSON.stringify("http://textius.local/api/v1"),
                    USE_CACHE_API: JSON.stringify(true),
                    CACHE_API_URL: JSON.stringify("http://frontend.textius.local/api/v1"),
                    AUTH_SERVICE_URL: JSON.stringify('http://auth.textius.local'),
                    IS_LENTACH: JSON.stringify(false),
                    IS_BROWSER: JSON.stringify(false),
                    STATIC_ROOT: JSON.stringify(__dirname + '/dist/public'),
                    MEDIA_ROOT: JSON.stringify(__dirname + '/media'),
                    VIEWS_DIR: JSON.stringify(__dirname + '/dist/views'),
                    REDIS_HOST: JSON.stringify('127.0.0.1'),
                    REDIS_PORT: JSON.stringify(6379),
                    REDIS_DB: JSON.stringify('5'),
                }
            }),
            new CopyWebpackPlugin([{
                from: 'app/srv/views', to: 'views'
            }])
            // HTMLWebpackPluginConfigServer,
        ]
    }
];