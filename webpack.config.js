//https://github.com/yahiko00/PixiProject

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDev = process.env.NODE_ENV !== 'production';

const config = {
    mode: isDev ? 'development' : 'production',
    entry: './src/scripts/app.ts',
    output: {
        path: path.resolve(__dirname, 'src/dist'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    devtool: 'inline-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            template: "./src/bubblz.html",
            favicon:  "./src/favicon.ico",
            //inject: false,
            filename: "index.html"
        }),
        new CleanWebpackPlugin(),
        new CopyPlugin(
            {
                patterns:
                [
                    //{ from: 'src/bubblz.html' },
                    { from: 'src/favicon.ico', to: 'favicon.ico'},
                    { from: 'src/css/bubblz.css', to: 'css/' },
                    { from: 'data/world_gdp.json', to: 'data/'},
                    { from: 'data/cars.csv', to: 'data/'},
                    { from: 'data/google_product_taxonomy.json', to:'data/'}
                ]
            }
        )
    ],
    devServer: {
        //contentBase: './dist',
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080,
        hot: true
    },
    optimization: {
        minimize: !isDev
      }
};

module.exports = config;