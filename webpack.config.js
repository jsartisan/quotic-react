const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');
const WebpackZipPlugin = require('webpack-zip-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';
let plugins = [];
let imageLoaders = [
  {
    loader: 'url-loader',
    options: {
      limit: 5000000,
    },
  },
];

if (isDevelopment === false) {
  plugins = plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    }),
    new WebpackZipPlugin({
      initialFile: 'build',
      endPath: './',
      zipName: 'build.zip',
    }),
  ]);

  imageLoaders = imageLoaders.concat([
    {
      loader: 'image-webpack-loader',
      options: {
        bypassOnDebug: true,
      },
    },
    {
      loader: 'image-maxsize-webpack-loader',
      options: {
        'max-width': 1024,
        'max-height': 700,
        useImageMagick: false,
      },
    },
  ]);
}


const config = {
  entry: {
    bundle: './src/index.js',
  },
  output: {
    filename: isDevelopment ? '[name].js' : '[name]-[hash].js',
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            ['env', { targets: { browser: ['last 2 versions'] } }],
            'react',
            'stage-2',
          ],
        },
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
            },
          ],
        }),
      },
      {
        test: /\.(png|jpg|jpeg|svg)$/,
        use: imageLoaders,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: {
        collapseWhitespace: isDevelopment === false,
        collapseInlineTagWhitespace: isDevelopment === false,
        removeComments: isDevelopment === false,
        removeRedundantAttributes: isDevelopment === false,
      },
    }),
    new StyleExtHtmlWebpackPlugin({
      minify: isDevelopment === false,
    }),
    new ExtractTextPlugin('[name].css'),
    new CopyWebpackPlugin([
      { from: './src/manifest.json', to: './manifest.json' },
      { from: './src/icon16.png', to: './icon16.png' },
      { from: './src/icon48.png', to: './icon48.png' },
      { from: './src/icon128.png', to: './icon128.png' },
    ]),
    ...plugins,
  ],
};

module.exports = config;
