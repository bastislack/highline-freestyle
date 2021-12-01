const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const {InjectManifest} = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const webpackPlugins = [
  new HtmlWebpackPlugin({
    template: path.resolve( __dirname, 'public/index.html'),
    filename: 'index.html',
  }),
  new CopyPlugin({
    patterns: [
      {from: "./public/favicon.ico", to: ""},
      {from: "./public/manifest.json", to: ""},
      {from: "./public/logo192.png", to: ""},
      {from: "./public/logo512.png", to: ""},
      {from: "./CNAME", to: ""},
    ],
  }),
];

if (process.env.NODE_ENV === 'production') {
  webpackPlugins.push(
    new InjectManifest({
      swSrc: './src/src-sw.js',
      swDest: 'sw.js'
    })
  );
}

module.exports = {
  context: __dirname,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js',
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.css?$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(png|j?g|svg|gif)?$/,
        use: 'file-loader?name=./images/[name].[ext]'
      },
    ]
  },
  plugins: webpackPlugins
};
