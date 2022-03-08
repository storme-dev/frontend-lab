const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');
const fs = require('fs');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Webpack',
            template: 'public/index.html'
        }),
        new MiniCssExtractPlugin({ filename: 'style.css' }),
        new CopyPlugin({
            patterns: [
                {
                    from: "public",
                    to: ".",
                    filter: (resourcePath) => {
                        return !resourcePath.includes('public/index.html');
                    },
                }
            ],
        })
    ],
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            }
        ]
    },
};
